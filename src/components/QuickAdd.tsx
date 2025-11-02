import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, Flag, FolderKanban, Sparkles, FileText } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useTemplateStore } from '../store/templateStore';
import { generateId } from '../lib/utils';
import { parseNaturalLanguage } from '../lib/nlp';
import { Priority, Task, RepeatType } from '../types';
import toast from 'react-hot-toast';

interface QuickAddProps {
  onClose: () => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onClose }) => {
  const { addTask, projects, tags } = useTaskStore();
  const { templates, useTemplate } = useTemplateStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [useNLP, setUseNLP] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [nlpPreview, setNlpPreview] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (useNLP && title) {
      const parsed = parseNaturalLanguage(title);
      let preview = parsed.title;
      if (parsed.dueDate) preview += ` | Due: ${parsed.dueDate.toLocaleDateString()}`;
      if (parsed.priority) preview += ` | Priority: ${parsed.priority}`;
      if (parsed.tags?.length) preview += ` | Tags: ${parsed.tags.join(', ')}`;
      setNlpPreview(preview);
    } else {
      setNlpPreview('');
    }
  }, [title, useNLP]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: Task = {
      id: generateId(),
      status: 'todo' as const,
      tags: [],
      subtasks: [],
      attachments: [],
      comments: [],
      timeEntries: [],
      repeatType: 'none' as RepeatType,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: '',
      priority: 'none' as Priority,
    };

    if (useNLP) {
      const parsed = parseNaturalLanguage(title);
      taskData.title = parsed.title;
      taskData.priority = parsed.priority || priority;
      taskData.dueDate = parsed.dueDate || (dueDate ? new Date(dueDate) : undefined);
      taskData.repeatType = parsed.repeatType || 'none';
      taskData.repeatInterval = parsed.repeatInterval;
      taskData.estimatedTime = parsed.estimatedTime;
      
      // Find project by name
      if (parsed.projectName) {
        const project = projects.find(p => 
          p.name.toLowerCase() === parsed.projectName?.toLowerCase()
        );
        taskData.projectId = project?.id || projectId;
      } else {
        taskData.projectId = projectId || undefined;
      }
      
      // Convert tag names to tag objects
      if (parsed.tags?.length) {
        taskData.tags = parsed.tags.map(tagName => {
          const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          return existingTag || { 
            id: generateId(), 
            name: tagName, 
            color: '#3b82f6' 
          };
        });
      }
    } else {
      taskData.title = title.trim();
      taskData.priority = priority;
      taskData.dueDate = dueDate ? new Date(dueDate) : undefined;
      taskData.projectId = projectId || undefined;
    }

    taskData.description = description.trim() || undefined;

    addTask(taskData);
    toast.success('Task created!');
    onClose();
  };

  const handleTemplateSelect = (templateId: string) => {
    const taskTemplate = useTemplate(templateId);
    if (taskTemplate) {
      setTitle(taskTemplate.title || '');
      setDescription(taskTemplate.description || '');
      setPriority(taskTemplate.priority || 'none');
      if (taskTemplate.dueDate) {
        setDueDate(new Date(taskTemplate.dueDate).toISOString().split('T')[0]);
      }
      setProjectId(taskTemplate.projectId || '');
      setShowTemplates(false);
      toast.success('Template applied');
    }
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
          {/* NLP and Template toggles */}
          <div className="flex items-center gap-3 pb-2">
            <button
              type="button"
              onClick={() => setUseNLP(!useNLP)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                useNLP
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-accent/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Smart Input
            </button>
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                showTemplates
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-accent/20'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Templates
            </button>
          </div>

          {/* Template selector */}
          {showTemplates && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-secondary rounded-lg border border-border">
              {templates.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  className="text-left px-3 py-2 rounded-lg bg-card hover:bg-accent/20 transition-colors border border-border"
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.category}</div>
                </button>
              ))}
            </div>
          )}

          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={useNLP ? "e.g., 'Buy groceries tomorrow at 5pm #shopping p1'" : "Task title..."}
              className="w-full text-lg px-0 py-2 bg-transparent border-b-2 border-border focus:border-primary focus:outline-none transition-colors"
            />
            {nlpPreview && (
              <div className="mt-2 text-sm text-accent flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preview: {nlpPreview}</span>
              </div>
            )}
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
