export type GoalCategory = string;
export type GoalSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';

export interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isPinned: boolean;
  version?: number;
}

export interface SubGoal {
  id: string;
  title: string;
  description?: string;
  owner: string;
  progress: number;
  startDate?: string;
  dueDate?: string;
  statusNote?: string;
  version?: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  owner: string;
  categories: GoalCategory[]; // 최소 1개, 최대 5개
  progress: number;
  size: GoalSize; // 카드 크기 = 중요도
  startDate?: string;
  dueDate?: string;
  statusNote?: string;
  subGoals?: SubGoal[];
  notes?: Note[]; // 메모 히스토리
  attachments?: Attachment[]; // 첨부파일
  order?: number; // 드래그 앤 드롭 순서
  completed?: boolean; // 완료 여부
  version?: number; // 낙관적 잠금을 위한 버전
}
