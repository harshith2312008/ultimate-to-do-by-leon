import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template, Task } from '../types';

interface TemplateState {
  templates: Template[];
  
  // Actions
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  useTemplate: (id: string) => Partial<Task> | null;
  getTemplatesByCategory: (category: string) => Template[];
  incrementUsage: (id: string) => void;
}

// Default templates for common tasks
const defaultTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Daily Standup',
    description: 'Daily team standup meeting',
    category: 'Work',
    usageCount: 0,
    taskTemplate: {
      title: 'Daily Standup',
      priority: 'medium',
      repeatType: 'daily',
      estimatedTime: 15,
      tags: [{ id: 'work', name: 'work', color: '#3b82f6' }],
    },
  },
  {
    id: 'template-2',
    name: 'Weekly Review',
    description: 'Review weekly progress and plan next week',
    category: 'Productivity',
    usageCount: 0,
    taskTemplate: {
      title: 'Weekly Review',
      priority: 'high',
      repeatType: 'weekly',
      estimatedTime: 60,
      tags: [{ id: 'review', name: 'review', color: '#8b5cf6' }],
    },
  },
  {
    id: 'template-3',
    name: 'Grocery Shopping',
    description: 'Weekly grocery shopping trip',
    category: 'Personal',
    usageCount: 0,
    taskTemplate: {
      title: 'Grocery Shopping',
      priority: 'medium',
      repeatType: 'weekly',
      estimatedTime: 45,
      tags: [{ id: 'shopping', name: 'shopping', color: '#10b981' }],
    },
  },
  {
    id: 'template-4',
    name: 'Exercise',
    description: 'Daily workout routine',
    category: 'Health',
    usageCount: 0,
    taskTemplate: {
      title: 'Exercise',
      priority: 'high',
      repeatType: 'daily',
      estimatedTime: 30,
      tags: [{ id: 'health', name: 'health', color: '#ef4444' }],
    },
  },
  {
    id: 'template-5',
    name: 'Code Review',
    description: 'Review pull requests',
    category: 'Work',
    usageCount: 0,
    taskTemplate: {
      title: 'Code Review',
      priority: 'high',
      estimatedTime: 30,
      tags: [{ id: 'development', name: 'development', color: '#f59e0b' }],
    },
  },
  {
    id: 'template-6',
    name: 'Call Family',
    description: 'Weekly family check-in',
    category: 'Personal',
    usageCount: 0,
    taskTemplate: {
      title: 'Call Family',
      priority: 'medium',
      repeatType: 'weekly',
      estimatedTime: 20,
      tags: [{ id: 'family', name: 'family', color: '#ec4899' }],
    },
  },
];

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: defaultTemplates,
      
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template],
      })),
      
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map((template) =>
          template.id === id ? { ...template, ...updates } : template
        ),
      })),
      
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
      })),
      
      useTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) return null;
        
        // Increment usage count
        get().incrementUsage(id);
        
        // Return task template with new ID
        return {
          ...template.taskTemplate,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
      
      getTemplatesByCategory: (category) => {
        return get().templates.filter((template) => template.category === category);
      },
      
      incrementUsage: (id) => set((state) => ({
        templates: state.templates.map((template) =>
          template.id === id
            ? { ...template, usageCount: template.usageCount + 1 }
            : template
        ),
      })),
    }),
    {
      name: 'template-storage',
    }
  )
);
