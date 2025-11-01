import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { cn } from '../../lib/utils';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getFilteredTasks, setSelectedTask } = useTaskStore();
  const tasks = getFilteredTasks();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getTasksForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const today = new Date();

    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-muted/20" />);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dayTasks = getTasksForDate(day);
      const isToday = today.getDate() === day && 
                      today.getMonth() === currentDate.getMonth() &&
                      today.getFullYear() === currentDate.getFullYear();

      days.push(
        <div
          key={day}
          className={cn(
            'min-h-[120px] border border-border p-2 bg-card hover:bg-accent/50 transition-colors',
            isToday && 'ring-2 ring-primary'
          )}
        >
          <div className={cn(
            'text-sm font-semibold mb-2',
            isToday && 'text-primary'
          )}>
            {day}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={cn(
                  'text-xs px-2 py-1 rounded cursor-pointer truncate',
                  task.status === 'completed' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                  task.priority === 'critical' ? 'bg-red-500/20 text-red-700 dark:text-red-300' :
                  task.priority === 'high' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                  'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                )}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-muted-foreground px-2">
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 hover:bg-accent rounded-lg transition-colors text-sm"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass rounded-lg overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-muted/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-sm border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
