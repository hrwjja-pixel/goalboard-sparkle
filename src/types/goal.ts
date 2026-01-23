export type GoalCategory = string;
export type GoalSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';

export interface Project {
  id: string;
  name: string;
  description?: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  parentId?: string | null;
  parent?: Project | null;
  children?: Project[];
  createdAt: string;
  updatedAt: string;
}

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
  projectId?: string; // 프로젝트 ID
  project?: { id: string; name: string }; // 프로젝트 정보 (하위 포함 모드용)
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
