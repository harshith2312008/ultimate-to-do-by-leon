import { create } from 'zustand';
import { UserSettings, PomodoroSettings } from '../types';

interface SettingsState {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updatePomodoroSettings: (updates: Partial<PomodoroSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  accentColor: '#3b82f6',
  fontSize: 'medium',
  defaultView: 'list',
  notifications: {
    enabled: true,
    showDesktopNotifications: true,
    soundEnabled: true,
    dueDateReminders: true,
    reminderTime: 30,
    dailyDigest: false,
    digestTime: '09:00',
  },
  shortcuts: {
    newTask: 'Ctrl+N',
    search: 'Ctrl+K',
    toggleSidebar: 'Ctrl+B',
    quickAdd: 'Ctrl+Shift+A',
  },
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '24h',
  startOfWeek: 1,
  pomodoroSettings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  },
  aiSettings: {
    enableAutoTags: true,
    enableSmartSuggestions: true,
    enablePriorityPrediction: true,
    enableDueDateSuggestion: true,
    enableTimeEstimation: true,
  },
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
  })),
  
  updatePomodoroSettings: (updates) => set((state) => ({
    settings: {
      ...state.settings,
      pomodoroSettings: { ...state.settings.pomodoroSettings, ...updates },
    },
  })),
  
  resetSettings: () => set({ settings: defaultSettings }),
}));
