import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, Flag, Tag, FolderKanban } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { generateId } from '../lib/utils';

interface QuickAddProps {
  onClose: () => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onClose }) => {
  const { addTask, projects } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'none' | 'low' | 'medium' | 'high' | 'critical'>('none');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'todo' as const,
      priority,
      tags: [],
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId: projectId || undefined,
      subtasks: [],
      attachments: [],
      comments: [],
      timeEntries: [],
      repeatType: 'none' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32 z-50 animate-fade-in">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-2xl border border-border animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Quick Add Task</h3>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full text-lg px-0 py-2 bg-transparent border-b-2 border-border focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-2">
                <Flag className="w-3 h-3" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-2">
              <FolderKanban className="w-3 h-3" />
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-accent rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAdd;
