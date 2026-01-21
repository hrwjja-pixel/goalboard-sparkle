import { useState, useEffect } from 'react';

export type ViewMode = 'normal' | 'compact' | 'list';
export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  defaultViewMode: ViewMode;
  autoRefreshInterval: number; // seconds, 0 = disabled
  showCompletedByDefault: boolean;
  enableAutoRefresh: boolean;
  theme: Theme;
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultViewMode: 'compact',
  autoRefreshInterval: 30,
  showCompletedByDefault: false,
  enableAutoRefresh: true,
  theme: 'system',
};

const STORAGE_KEY = 'goalboard_user_settings';

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_USER_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
    return DEFAULT_USER_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  }, [settings]);

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_USER_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};
