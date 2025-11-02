import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type HabitGoalType = 'completion' | 'count' | 'duration';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  frequency: HabitFrequency;
  goalType: HabitGoalType;
  goalValue: number; // for count or duration (in minutes)
  daysOfWeek?: number[]; // 0-6, for weekly habits
  reminderTime?: string; // HH:MM format
  createdAt: Date;
  archived: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number; // for count or duration tracking
  note?: string;
  completedAt?: Date;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // percentage
  lastCompletedDate?: string;
}

interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];
  
  // Habit CRUD
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  
  // Completion tracking
  markHabitComplete: (habitId: string, date: Date, value?: number, note?: string) => void;
  markHabitIncomplete: (habitId: string, date: Date) => void;
  getHabitCompletion: (habitId: string, date: Date) => HabitCompletion | undefined;
  
  // Stats
  getHabitStats: (habitId: string) => HabitStats;
  getTodayHabits: () => Habit[];
  getActiveHabits: () => Habit[];
}

const dateToString = (date: Date): string => format(date, 'yyyy-MM-dd');

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],
      
      addHabit: (habit) => set((state) => ({
        habits: [...state.habits, habit],
      })),
      
      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id ? { ...habit, ...updates } : habit
        ),
      })),
      
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== id),
        completions: state.completions.filter((c) => c.habitId !== id),
      })),
      
      archiveHabit: (id) => set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id ? { ...habit, archived: true } : habit
        ),
      })),
      
      markHabitComplete: (habitId, date, value, note) => {
        const dateStr = dateToString(date);
        const existing = get().completions.find(
          (c) => c.habitId === habitId && c.date === dateStr
        );
        
        if (existing) {
          set((state) => ({
            completions: state.completions.map((c) =>
              c.id === existing.id
                ? { ...c, completed: true, value, note, completedAt: new Date() }
                : c
            ),
          }));
        } else {
          const newCompletion: HabitCompletion = {
            id: crypto.randomUUID(),
            habitId,
            date: dateStr,
            completed: true,
            value,
            note,
            completedAt: new Date(),
          };
          set((state) => ({
            completions: [...state.completions, newCompletion],
          }));
        }
      },
      
      markHabitIncomplete: (habitId, date) => {
        const dateStr = dateToString(date);
        set((state) => ({
          completions: state.completions.filter(
            (c) => !(c.habitId === habitId && c.date === dateStr)
          ),
        }));
      },
      
      getHabitCompletion: (habitId, date) => {
        const dateStr = dateToString(date);
        return get().completions.find(
          (c) => c.habitId === habitId && c.date === dateStr && c.completed
        );
      },
      
      getHabitStats: (habitId): HabitStats => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) {
          return {
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            completionRate: 0,
          };
        }
        
        const completions = get().completions.filter(
          (c) => c.habitId === habitId && c.completed
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const totalCompletions = completions.length;
        
        // Calculate current streak
        let currentStreak = 0;
        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        
        while (true) {
          const dateStr = dateToString(checkDate);
          const completed = completions.find((c) => c.date === dateStr);
          
          if (completed) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            // Allow one day grace period for today
            if (currentStreak === 0 && dateToString(new Date()) === dateStr) {
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
            break;
          }
        }
        
        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        let prevDate: Date | null = null;
        
        completions.forEach((c) => {
          const cDate = new Date(c.date);
          if (!prevDate) {
            tempStreak = 1;
          } else {
            const dayDiff = Math.abs(
              (prevDate.getTime() - cDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (dayDiff === 1) {
              tempStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
          prevDate = cDate;
        });
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // Calculate completion rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCompletions = completions.filter(
          (c) => new Date(c.date) >= thirtyDaysAgo
        ).length;
        const completionRate = Math.round((recentCompletions / 30) * 100);
        
        const lastCompletedDate = completions[0]?.date;
        
        return {
          currentStreak,
          longestStreak,
          totalCompletions,
          completionRate,
          lastCompletedDate,
        };
      },
      
      getTodayHabits: () => {
        const today = new Date().getDay();
        return get().habits.filter((habit) => {
          if (habit.archived) return false;
          if (habit.frequency === 'daily') return true;
          if (habit.frequency === 'weekly' && habit.daysOfWeek) {
            return habit.daysOfWeek.includes(today);
          }
          return false;
        });
      },
      
      getActiveHabits: () => {
        return get().habits.filter((habit) => !habit.archived);
      },
    }),
    {
      name: 'habit-storage',
    }
  )
);
