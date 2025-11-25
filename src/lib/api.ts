import { Goal, GoalCategory } from '@/types/goal';

// API 기본 URL 설정
const getApiBaseUrl = () => {
  // 환경변수로 API URL이 지정된 경우
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 개발 모드: Vite proxy 사용 (같은 호스트로 요청)
  if (import.meta.env.DEV) {
    return '';  // 상대 경로 사용, Vite proxy가 /api를 localhost:3001로 전달
  }

  // 프로덕션: 현재 브라우저 호스트의 3001 포트 사용
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001`;
};

const API_BASE_URL = getApiBaseUrl();

interface CategoryWithId {
  id: string;
  name: string;
  color: string;
}

export const api = {
  // Categories
  async getCategories(): Promise<CategoryWithId[]> {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createCategory(name: string, color: string): Promise<CategoryWithId> {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  async updateCategoryColor(id: string, color: string): Promise<CategoryWithId> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color }),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  async updateCategoryName(id: string, name: string): Promise<CategoryWithId> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
  async getGoals(): Promise<Goal[]> {
    const response = await fetch(`${API_BASE_URL}/api/goals`);
    if (!response.ok) throw new Error('Failed to fetch goals');
    return response.json();
  },

  async createGoal(goal: Goal): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    if (!response.ok) throw new Error('Failed to create goal');
    return response.json();
  },

  async updateGoal(id: string, goal: Goal): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    if (!response.ok) throw new Error('Failed to update goal');
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goals }),
    });
    if (!response.ok) throw new Error('Failed to reorder goals');
  },
};
