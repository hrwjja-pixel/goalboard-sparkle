export type GoalCategory = 'SERVICE' | 'AI' | 'OPERATIONS';

export interface SubGoal {
  id: string;
  title: string;
  description?: string;
  owner: string;
  progress: number;
  startDate?: string;
  dueDate?: string;
  statusNote?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  owner: string;
  category: GoalCategory;
  progress: number;
  startDate?: string;
  dueDate?: string;
  statusNote?: string;
  subGoals?: SubGoal[];
}
