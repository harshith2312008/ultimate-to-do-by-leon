import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { usePomodoroStore } from '../store/pomodoroStore';
import { formatTime } from '../lib/utils';

const PomodoroTimer: React.FC = () => {
  const { phase, timeRemaining, isRunning, startTimer, pauseTimer, resetTimer, skipPhase } = usePomodoroStore();

  const phaseLabels = {
    idle: 'Ready',
    work: 'Work',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  };

  return (
    <div className="fixed bottom-4 right-4 glass rounded-lg p-4 shadow-lg w-64 z-40">
      <div className="text-center mb-3">
        <div className="text-sm text-muted-foreground mb-1">{phaseLabels[phase]}</div>
        <div className="text-3xl font-bold font-mono">{formatTime(timeRemaining)}</div>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        {!isRunning ? (
          <button onClick={startTimer} className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            <Play className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={pauseTimer} className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            <Pause className="w-5 h-5" />
          </button>
        )}
        <button onClick={resetTimer} className="p-2 hover:bg-accent rounded-lg">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={skipPhase} className="p-2 hover:bg-accent rounded-lg">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
