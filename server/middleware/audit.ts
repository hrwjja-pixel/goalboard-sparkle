import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditInfo {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REORDER';
  entityType: 'Goal' | 'SubGoal' | 'Note' | 'Category';
  entityId: string;
  entityTitle?: string;
  changes?: any;
}

// Attach audit logger to request
export function attachAuditLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Add audit function to request
  (req as any).audit = async (info: AuditInfo) => {
    if (!req.user) {
      console.warn('Audit log attempted without authenticated user');
      return;
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: info.action,
          entityType: info.entityType,
          entityId: info.entityId,
          entityTitle: info.entityTitle,
          userId: req.user.userId,
          changes: info.changes ? JSON.stringify(info.changes) : null,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  };

  next();
}
