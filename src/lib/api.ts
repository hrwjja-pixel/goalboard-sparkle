import { Goal, GoalCategory, Attachment, Project } from '@/types/goal';

// API 기본 URL 설정
const getApiBaseUrl = () => {
  // 환경변수로 API URL이 지정된 경우
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // VITE_BASE_URL을 고려하여 API 경로 설정
  const baseUrl = import.meta.env.BASE_URL || '/';

  // 개발 모드: Vite proxy 사용 (BASE_URL 고려)
  if (import.meta.env.DEV) {
    return baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
  }

  // 프로덕션: 현재 브라우저와 같은 호스트/포트 사용 (BASE_URL 고려)
  return baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

interface CategoryWithId {
  id: string;
  name: string;
  color: string;
}

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async createProject(project: { name: string; description?: string; dashboardTitle?: string; dashboardSubtitle?: string; parentId?: string | null }): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  async deleteProject(id: string, adminPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminPassword }),
    });
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Invalid admin password');
      }
      throw new Error('Failed to delete project');
    }
  },

  // Categories
  async getCategories(projectId: string): Promise<CategoryWithId[]> {
    const response = await fetch(`${API_BASE_URL}/api/categories?projectId=${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createCategory(name: string, color: string, projectId: string): Promise<CategoryWithId> {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, color, projectId }),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  async updateCategoryColor(id: string, color: string): Promise<CategoryWithId> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ color }),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  async updateCategoryName(id: string, name: string): Promise<CategoryWithId> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
  },

  // Goals
  async getGoals(projectId: string, showCompleted: boolean = false, includeDescendants: boolean = false): Promise<Goal[]> {
    const url = `${API_BASE_URL}/api/goals?projectId=${projectId}&showCompleted=${showCompleted}&includeDescendants=${includeDescendants}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch goals');
    return response.json();
  },

  async getGoal(id: string): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`);
    if (!response.ok) throw new Error('Failed to fetch goal');
    return response.json();
  },

  async createGoal(goal: Goal): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(goal),
    });
    if (!response.ok) throw new Error('Failed to create goal');
    return response.json();
  },

  async updateGoal(id: string, goal: Goal): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(goal),
    });
    if (!response.ok) {
      const error: any = new Error('Failed to update goal');
      error.response = { status: response.status, data: await response.json() };
      throw error;
    }
    return response.json();
  },

  async deleteGoal(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete goal');
  },

  async reorderGoals(goals: { id: string; order: number }[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/goals/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ goals }),
    });
    if (!response.ok) throw new Error('Failed to reorder goals');
  },

  async toggleGoalCompletion(id: string, completed: boolean): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Failed to toggle goal completion');
    return response.json();
  },

  // Settings
  async getSettings(): Promise<{ dashboardTitle: string; dashboardSubtitle: string }> {
    const response = await fetch(`${API_BASE_URL}/api/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async updateSettings(settings: { dashboardTitle?: string; dashboardSubtitle?: string }): Promise<Record<string, string>> {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  // Attachments
  async uploadAttachment(goalId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/attachments`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload attachment');
    return response.json();
  },

  async getAttachments(goalId: string): Promise<Attachment[]> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/attachments`);
    if (!response.ok) throw new Error('Failed to fetch attachments');
    return response.json();
  },

  async downloadAttachment(attachmentId: string): Promise<void> {
    window.open(`${API_BASE_URL}/api/attachments/${attachmentId}/download`, '_blank');
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete attachment');
  },
};
