import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { SettingsState } from '../core/types';

interface SettingsActions {
  setTheme: (theme: 'dark' | 'light') => void;
  setOfflineCapHours: (hours: number) => void;
  setAutoSaveInterval: (ms: number) => void;
  setShowNotifications: (show: boolean) => void;
}

type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'dark',
  offlineCapHours: 12,
  autoSaveInterval: 30_000,
  showNotifications: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({
      ...DEFAULT_SETTINGS,

      setTheme(theme) {
        set((state) => {
          state.theme = theme;
        });
      },

      setOfflineCapHours(hours) {
        set((state) => {
          state.offlineCapHours = Math.max(1, Math.min(24, hours));
        });
      },

      setAutoSaveInterval(ms) {
        set((state) => {
          state.autoSaveInterval = Math.max(10_000, ms);
        });
      },

      setShowNotifications(show) {
        set((state) => {
          state.showNotifications = show;
        });
      },
    })),
    { name: 'lord_of_cultivation_settings' },
  ),
);
