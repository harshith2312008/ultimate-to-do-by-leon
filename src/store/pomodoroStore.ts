import { create } from 'zustand';

type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak' | 'idle';

interface PomodoroState {
  phase: PomodoroPhase;
  timeRemaining: number;
  isRunning: boolean;
  sessionsCompleted: number;
  currentTaskId: string | null;
  
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  setCurrentTask: (taskId: string | null) => void;
  tick: () => void;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  phase: 'idle',
  timeRemaining: 25 * 60,
  isRunning: false,
  sessionsCompleted: 0,
  currentTaskId: null,
  
  startTimer: () => set({ isRunning: true, phase: get().phase === 'idle' ? 'work' : get().phase }),
  
  pauseTimer: () => set({ isRunning: false }),
  
  resetTimer: () => set({
    phase: 'idle',
    timeRemaining: 25 * 60,
    isRunning: false,
  }),
  
  skipPhase: () => {
    const { phase, sessionsCompleted } = get();
    let nextPhase: PomodoroPhase = 'work';
    let nextTime = 25 * 60;
    
    if (phase === 'work') {
      const newSessions = sessionsCompleted + 1;
      if (newSessions % 4 === 0) {
        nextPhase = 'longBreak';
        nextTime = 15 * 60;
      } else {
        nextPhase = 'shortBreak';
        nextTime = 5 * 60;
      }
      set({
        phase: nextPhase,
        timeRemaining: nextTime,
        sessionsCompleted: newSessions,
      });
    } else {
      set({
        phase: 'work',
        timeRemaining: 25 * 60,
      });
    }
  },
  
  setCurrentTask: (taskId) => set({ currentTaskId: taskId }),
  
  tick: () => {
    const { timeRemaining, isRunning } = get();
    if (isRunning && timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    } else if (timeRemaining === 0) {
      get().skipPhase();
    }
  },
}));
