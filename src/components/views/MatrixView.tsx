import React from 'react';
import { AlertCircle, Target, Clock, Archive } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { cn } from '../../lib/utils';
import { Task } from '../../types';

const MatrixView: React.FC = () => {
  const { getFilteredTasks, setSelectedTask } = useTaskStore();
  const tasks = getFilteredTasks();

  // Categorize tasks based on priority and due date
  const categorizeTask = (task: Task): 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important' => {
    const isUrgent = task.dueDate ? new Date(task.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 : false; // Due within 3 days
    const isImportant = task.priority === 'critical' || task.priority === 'high';

    if (isUrgent && isImportant) return 'urgent-important';
    if (!isUrgent && isImportant) return 'not-urgent-important';
    if (isUrgent && !isImportant) return 'urgent-not-important';
    return 'not-urgent-not-important';
  };

  const quadrants = {
    'urgent-important': {
      title: 'Do First',
      subtitle: 'Urgent & Important',
      icon: AlertCircle,
      color: 'red',
      tasks: tasks.filter(t => categorizeTask(t) === 'urgent-important' && t.status !== 'completed'),
    },
    'not-urgent-important': {
      title: 'Schedule',
      subtitle: 'Not Urgent & Important',
      icon: Target,
      color: 'blue',
      tasks: tasks.filter(t => categorizeTask(t) === 'not-urgent-important' && t.status !== 'completed'),
    },
    'urgent-not-important': {
      title: 'Delegate',
      subtitle: 'Urgent & Not Important',
      icon: Clock,
      color: 'yellow',
      tasks: tasks.filter(t => categorizeTask(t) === 'urgent-not-important' && t.status !== 'completed'),
    },
    'not-urgent-not-important': {
      title: 'Eliminate',
      subtitle: 'Not Urgent & Not Important',
      icon: Archive,
      color: 'gray',
      tasks: tasks.filter(t => categorizeTask(t) === 'not-urgent-not-important' && t.status !== 'completed'),
    },
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Eisenhower Matrix</h2>
          <p className="text-muted-foreground mt-1">Prioritize tasks by urgency and importance</p>
        </div>

        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-220px)]">
          {/* Urgent & Important */}
          <div className={cn(
            'glass rounded-lg p-4 border-2',
            'border-red-500/50 bg-red-500/5'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{quadrants['urgent-important'].title}</h3>
                <p className="text-xs text-muted-foreground">{quadrants['urgent-important'].subtitle}</p>
              </div>
              <span className="ml-auto text-sm text-muted-foreground">
                {quadrants['urgent-important'].tasks.length}
              </span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100%-80px)]">
              {quadrants['urgent-important'].tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <h4 className="font-medium mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                </div>
              ))}
              {quadrants['urgent-important'].tasks.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No urgent & important tasks</p>
              )}
            </div>
          </div>

          {/* Not Urgent & Important */}
          <div className={cn(
            'glass rounded-lg p-4 border-2',
            'border-blue-500/50 bg-blue-500/5'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{quadrants['not-urgent-important'].title}</h3>
                <p className="text-xs text-muted-foreground">{quadrants['not-urgent-important'].subtitle}</p>
              </div>
              <span className="ml-auto text-sm text-muted-foreground">
                {quadrants['not-urgent-important'].tasks.length}
              </span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100%-80px)]">
              {quadrants['not-urgent-important'].tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <h4 className="font-medium mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                </div>
              ))}
              {quadrants['not-urgent-important'].tasks.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No scheduled tasks</p>
              )}
            </div>
          </div>

          {/* Urgent & Not Important */}
          <div className={cn(
            'glass rounded-lg p-4 border-2',
            'border-yellow-500/50 bg-yellow-500/5'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{quadrants['urgent-not-important'].title}</h3>
                <p className="text-xs text-muted-foreground">{quadrants['urgent-not-important'].subtitle}</p>
              </div>
              <span className="ml-auto text-sm text-muted-foreground">
                {quadrants['urgent-not-important'].tasks.length}
              </span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100%-80px)]">
              {quadrants['urgent-not-important'].tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <h4 className="font-medium mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                </div>
              ))}
              {quadrants['urgent-not-important'].tasks.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No tasks to delegate</p>
              )}
            </div>
          </div>

          {/* Not Urgent & Not Important */}
          <div className={cn(
            'glass rounded-lg p-4 border-2',
            'border-gray-500/50 bg-gray-500/5'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{quadrants['not-urgent-not-important'].title}</h3>
                <p className="text-xs text-muted-foreground">{quadrants['not-urgent-not-important'].subtitle}</p>
              </div>
              <span className="ml-auto text-sm text-muted-foreground">
                {quadrants['not-urgent-not-important'].tasks.length}
              </span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100%-80px)]">
              {quadrants['not-urgent-not-important'].tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <h4 className="font-medium mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                </div>
              ))}
              {quadrants['not-urgent-not-important'].tasks.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No tasks to eliminate</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixView;
