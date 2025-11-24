export type GoalCategory = 'SERVICE' | 'AI' | 'OPERATIONS';
export type GoalSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';

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
  size: GoalSize; // 카드 크기 = 우선순위
  startDate?: string;
  dueDate?: string;
  statusNote?: string;
  subGoals?: SubGoal[];
  order?: number; // 드래그 앤 드롭 순서
}
