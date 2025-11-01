import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { cn } from '../../lib/utils';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const GanttView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { getFilteredTasks, setSelectedTask } = useTaskStore();
  const tasks = getFilteredTasks().filter(t => t.startDate && t.dueDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getTaskBarPosition = (task: any) => {
    const start = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
    const end = task.dueDate ? new Date(task.dueDate) : addDays(start, 3);
    
    const startDay = days.findIndex(day => isSameDay(day, start));
    const endDay = days.findIndex(day => isSameDay(day, end));
    
    if (startDay === -1 || endDay === -1) return null;
    
    return {
      left: `${(startDay / days.length) * 100}%`,
      width: `${((endDay - startDay + 1) / days.length) * 100}%`,
    };
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Gantt Chart</h2>
            <p className="text-muted-foreground text-sm mt-1">Visual project timeline</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={previousMonth} className="p-2 hover:bg-accent rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-accent rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="glass rounded-lg overflow-hidden">
          {/* Timeline Header */}
          <div className="flex border-b border-border bg-muted/50">
            <div className="w-64 p-3 border-r border-border font-semibold">Task</div>
            <div className="flex-1 relative">
              <div className="flex h-full">
                {days.map((day, index) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex-1 min-w-[30px] border-r border-border last:border-r-0 p-1 text-center',
                        isToday && 'bg-primary/10'
                      )}
                    >
                      <div className={cn(
                        'text-xs',
                        isToday ? 'text-primary font-semibold' : 'text-muted-foreground'
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="min-h-[400px]">
            {tasks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p>No tasks with start and due dates</p>
                <p className="text-sm mt-2">Add dates to your tasks to see them here</p>
              </div>
            ) : (
              tasks.map((task) => {
                const barPosition = getTaskBarPosition(task);
                
                return (
                  <div key={task.id} className="flex border-b border-border hover:bg-accent/30 transition-colors group">
                    <div className="w-64 p-3 border-r border-border">
                      <div
                        className="cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="font-medium text-sm truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(task.startDate!), 'MMM d')} - {format(new Date(task.dueDate!), 'MMM d')}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative p-2">
                      {barPosition && (
                        <div
                          className={cn(
                            'absolute h-8 rounded cursor-pointer transition-all hover:opacity-80',
                            task.status === 'completed' ? 'bg-green-500' :
                            task.priority === 'critical' ? 'bg-red-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          )}
                          style={{
                            left: barPosition.left,
                            width: barPosition.width,
                            top: '50%',
                            transform: 'translateY(-50%)',
                          }}
                          onClick={() => setSelectedTask(task)}
                          title={task.title}
                        >
                          <div className="flex items-center h-full px-2 text-white text-xs font-medium truncate">
                            {task.title}
                          </div>
                        </div>
                      )}
                      {/* Today marker */}
                      {(() => {
                        const todayIndex = days.findIndex(day => isSameDay(day, new Date()));
                        if (todayIndex !== -1) {
                          return (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-primary/50"
                              style={{ left: `${(todayIndex / days.length) * 100}%` }}
                            />
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>Low/None</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttView;
