import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { cn } from '../../lib/utils';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

const TimelineView: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { getFilteredTasks, setSelectedTask } = useTaskStore();
  const tasks = getFilteredTasks().filter(t => t.dueDate || t.startDate);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const previousWeek = () => setCurrentWeek(addDays(currentWeek, -7));
  const nextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
  const goToToday = () => setCurrentWeek(new Date());

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : task.startDate ? new Date(task.startDate) : null;
      return taskDate && isSameDay(taskDate, day);
    });
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Timeline View</h2>
          <div className="flex items-center gap-2">
            <button onClick={previousWeek} className="p-2 hover:bg-accent rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToToday} className="px-4 py-2 hover:bg-accent rounded-lg transition-colors text-sm">
              Today
            </button>
            <button onClick={nextWeek} className="p-2 hover:bg-accent rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="ml-4 text-sm text-muted-foreground">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="glass rounded-lg overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
            {days.map(day => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={cn(
                  'p-4 text-center border-r border-border last:border-r-0',
                  isToday && 'bg-primary/10'
                )}>
                  <div className={cn(
                    'text-xs text-muted-foreground mb-1',
                    isToday && 'text-primary font-semibold'
                  )}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    'text-2xl font-bold',
                    isToday && 'text-primary'
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Content */}
          <div className="grid grid-cols-7 min-h-[500px]">
            {days.map(day => {
              const dayTasks = getTasksForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'border-r border-border last:border-r-0 p-3 space-y-2',
                    isToday && 'bg-primary/5'
                  )}
                >
                  {dayTasks.map((task, index) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        'p-3 rounded-lg cursor-pointer transition-all hover:shadow-md',
                        task.status === 'completed' ? 'bg-green-500/10 border border-green-500/30' :
                        task.priority === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
                        task.priority === 'high' ? 'bg-orange-500/10 border border-orange-500/30' :
                        task.priority === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                        'bg-blue-500/10 border border-blue-500/30'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-2">
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            'text-sm font-medium truncate',
                            task.status === 'completed' && 'line-through text-muted-foreground'
                          )}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {task.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag.id}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length === 0 && !isToday && (
                    <div className="text-center text-muted-foreground text-xs py-8 opacity-30">
                      No tasks
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/30" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500/30" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500/30" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/30" />
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
