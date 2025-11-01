import React from 'react';
import { CheckCircle2, Circle, Calendar, Flag, MoreHorizontal } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { cn, formatDate, getPriorityColor } from '../../lib/utils';

const ListView: React.FC = () => {
  const { getFilteredTasks, updateTask, setSelectedTask } = useTaskStore();
  const tasks = getFilteredTasks();

  const handleToggleComplete = (taskId: string, currentStatus: string) => {
    updateTask(taskId, {
      status: currentStatus === 'completed' ? 'todo' : 'completed',
      completedAt: currentStatus === 'completed' ? undefined : new Date(),
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No tasks found</p>
            <p className="text-sm">Create a new task to get started</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'glass rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group',
                `priority-${task.priority}`
              )}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(task.id, task.status);
                  }}
                  className="mt-0.5"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      'font-medium',
                      task.status === 'completed' && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    {task.priority !== 'none' && (
                      <div className="flex items-center gap-1">
                        <Flag className={`w-3 h-3 text-${getPriorityColor(task.priority)}-500`} />
                        <span className="capitalize">{task.priority}</span>
                      </div>
                    )}
                    {task.subtasks.length > 0 && (
                      <span>
                        {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListView;
