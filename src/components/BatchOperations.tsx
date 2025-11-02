import { useState } from 'react';
import { Check, Trash2, Archive, Tag, FolderOpen, Calendar, X } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Task, Priority, TaskStatus } from '../types';
import toast from 'react-hot-toast';

interface BatchOperationsProps {
  selectedTasks: Task[];
  onClose: () => void;
  onClearSelection: () => void;
}

export default function BatchOperations({ selectedTasks, onClose, onClearSelection }: BatchOperationsProps) {
  const { updateTask, deleteTask, projects, tags } = useTaskStore();
  const [showActions, setShowActions] = useState(false);

  if (selectedTasks.length === 0) return null;

  const handleBatchDelete = () => {
    if (confirm(`Delete ${selectedTasks.length} tasks? This cannot be undone.`)) {
      selectedTasks.forEach(task => deleteTask(task.id));
      toast.success(`Deleted ${selectedTasks.length} tasks`);
      onClearSelection();
      onClose();
    }
  };

  const handleBatchComplete = () => {
    selectedTasks.forEach(task => {
      updateTask(task.id, { 
        status: 'completed' as TaskStatus,
        completedAt: new Date()
      });
    });
    toast.success(`Marked ${selectedTasks.length} tasks as complete`);
    onClearSelection();
    onClose();
  };

  const handleBatchArchive = () => {
    selectedTasks.forEach(task => {
      updateTask(task.id, { status: 'archived' as TaskStatus });
    });
    toast.success(`Archived ${selectedTasks.length} tasks`);
    onClearSelection();
    onClose();
  };

  const handleBatchPriority = (priority: Priority) => {
    selectedTasks.forEach(task => {
      updateTask(task.id, { priority });
    });
    toast.success(`Updated priority for ${selectedTasks.length} tasks`);
    onClearSelection();
    onClose();
  };

  const handleBatchProject = (projectId: string) => {
    selectedTasks.forEach(task => {
      updateTask(task.id, { projectId });
    });
    const project = projects.find(p => p.id === projectId);
    toast.success(`Moved ${selectedTasks.length} tasks to ${project?.name}`);
    onClearSelection();
    onClose();
  };

  const handleBatchAddTag = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;

    selectedTasks.forEach(task => {
      if (!task.tags.some(t => t.id === tagId)) {
        updateTask(task.id, { 
          tags: [...task.tags, tag]
        });
      }
    });
    toast.success(`Added tag "${tag.name}" to ${selectedTasks.length} tasks`);
    onClearSelection();
    onClose();
  };

  const handleBatchDueDate = () => {
    const dateStr = prompt('Enter due date (YYYY-MM-DD):');
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      toast.error('Invalid date format');
      return;
    }

    selectedTasks.forEach(task => {
      updateTask(task.id, { dueDate: date });
    });
    toast.success(`Set due date for ${selectedTasks.length} tasks`);
    onClearSelection();
    onClose();
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass rounded-2xl shadow-2xl p-4 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Check className="w-4 h-4" />
            <span className="font-medium">{selectedTasks.length} selected</span>
          </div>

          <div className="h-6 w-px bg-white/20" />

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchComplete}
              className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Mark as complete"
            >
              <Check className="w-4 h-4" />
              Complete
            </button>

            <button
              onClick={handleBatchArchive}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>

            <button
              onClick={() => setShowActions(!showActions)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              More Actions
            </button>

            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <button
              onClick={onClearSelection}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Extended Actions Menu */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3">
            {/* Priority */}
            <div>
              <label className="text-xs text-white/60 mb-2 block">Set Priority</label>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleBatchPriority('critical')}
                  className="px-2 py-1 rounded text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                >
                  Critical
                </button>
                <button
                  onClick={() => handleBatchPriority('high')}
                  className="px-2 py-1 rounded text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-colors"
                >
                  High
                </button>
                <button
                  onClick={() => handleBatchPriority('medium')}
                  className="px-2 py-1 rounded text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors"
                >
                  Medium
                </button>
                <button
                  onClick={() => handleBatchPriority('low')}
                  className="px-2 py-1 rounded text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                >
                  Low
                </button>
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="text-xs text-white/60 mb-2 block flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                Move to Project
              </label>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleBatchProject(project.id)}
                    className="px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 text-white text-left transition-colors truncate"
                    style={{ borderLeft: `3px solid ${project.color}` }}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs text-white/60 mb-2 block flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Add Tag
              </label>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleBatchAddTag(tag.id)}
                    className="px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 text-white text-left transition-colors truncate"
                    style={{ 
                      backgroundColor: `${tag.color}20`,
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="col-span-3">
              <button
                onClick={handleBatchDueDate}
                className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Set Due Date
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
