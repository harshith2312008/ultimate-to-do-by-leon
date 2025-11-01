import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../../store/taskStore';
import { TaskStatus, Task } from '../../types';
import { cn } from '../../lib/utils';
import { Calendar, Flag, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all',
        `priority-${task.priority}`
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        {task.status === 'completed' && (
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
        )}
        <h4 className={cn(
          'font-medium flex-1',
          task.status === 'completed' && 'line-through text-muted-foreground'
        )}>
          {task.title}
        </h4>
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {task.priority !== 'none' && (
          <div className="flex items-center gap-1">
            <Flag className="w-3 h-3" />
            <span className="capitalize">{task.priority}</span>
          </div>
        )}
      </div>
      
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map(tag => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const KanbanView: React.FC = () => {
  const { getFilteredTasks, updateTask, setSelectedTask } = useTaskStore();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  
  const tasks = getFilteredTasks();

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-500/10' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500/10' },
    { id: 'completed', label: 'Completed', color: 'bg-green-500/10' },
    { id: 'blocked', label: 'Blocked', color: 'bg-red-500/10' },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    
    // Check if over is a column
    if (columns.some(col => col.id === newStatus)) {
      updateTask(taskId, { 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : undefined,
      });
    }
    
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.id);
            
            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <SortableContext items={columnTasks.map(t => t.id)}>
                  <div className={cn('glass rounded-lg p-4 h-full flex flex-col', column.color)}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{column.label}</h3>
                      <span className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                        {columnTasks.length}
                      </span>
                    </div>
                    
                    <div
                      id={column.id}
                      className="flex-1 space-y-2 overflow-y-auto min-h-[200px]"
                    >
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => setSelectedTask(task)}
                        />
                      ))}
                      
                      {columnTasks.length === 0 && (
                        <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className="w-80">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanView;
