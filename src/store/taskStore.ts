import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Project, Tag, Filter, SortOption, ViewMode } from '../types';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  selectedTask: Task | null;
  filter: Filter;
  sortOption: SortOption;
  viewMode: ViewMode;
  searchQuery: string;
  
  // Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  setSelectedTask: (task: Task | null) => void;
  setFilter: (filter: Partial<Filter>) => void;
  clearFilter: () => void;
  setSortOption: (sortOption: SortOption) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  
  getFilteredTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByTag: (tagId: string) => Task[];
  getOverdueTasks: () => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
}

const defaultFilter: Filter = {};
const defaultSort: SortOption = { field: 'createdAt', direction: 'desc' };

// Get current user ID for user-specific storage
const getUserStorageKey = () => {
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      const userId = parsed.state?.user?.id;
      return userId ? `tasks-${userId}` : 'tasks-default';
    } catch (e) {
      return 'tasks-default';
    }
  }
  return 'tasks-default';
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      tags: [],
      selectedTask: null,
      filter: defaultFilter,
      sortOption: defaultSort,
      viewMode: 'list',
      searchQuery: '',
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task],
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    ),
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),
  
  duplicateTask: (id) => set((state) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return state;
    
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      title: `${task.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'todo',
      completedAt: undefined,
    };
    
    return { tasks: [...state.tasks, newTask] };
  }),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project],
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project
    ),
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== id),
  })),
  
  addTag: (tag) => set((state) => ({
    tags: [...state.tags, tag],
  })),
  
  updateTag: (id, updates) => set((state) => ({
    tags: state.tags.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag)),
  })),
  
  deleteTag: (id) => set((state) => ({
    tags: state.tags.filter((tag) => tag.id !== id),
  })),
  
  setSelectedTask: (task) => set({ selectedTask: task }),
  
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter },
  })),
  
  clearFilter: () => set({ filter: defaultFilter }),
  
  setSortOption: (sortOption) => set({ sortOption }),
  
  setViewMode: (viewMode) => set({ viewMode }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getFilteredTasks: () => {
    const { tasks, filter, sortOption, searchQuery } = get();
    
    let filtered = [...tasks];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (filter.status?.length) {
      filtered = filtered.filter((task) => filter.status!.includes(task.status));
    }
    
    if (filter.priority?.length) {
      filtered = filtered.filter((task) => filter.priority!.includes(task.priority));
    }
    
    if (filter.tags?.length) {
      filtered = filtered.filter((task) =>
        task.tags.some((tag) => filter.tags!.includes(tag.id))
      );
    }
    
    if (filter.projects?.length) {
      filtered = filtered.filter((task) =>
        task.projectId && filter.projects!.includes(task.projectId)
      );
    }
    
    if (filter.isOverdue) {
      const now = new Date();
      filtered = filtered.filter(
        (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
      );
    }
    
    if (filter.dateRange) {
      filtered = filtered.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= filter.dateRange!.start && dueDate < filter.dateRange!.end;
      });
    }
    
    if (filter.hasDueDate !== undefined) {
      filtered = filtered.filter((task) => {
        return filter.hasDueDate ? task.dueDate !== undefined : task.dueDate === undefined;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortOption.field];
      const bVal = b[sortOption.field];
      
      if (aVal === undefined || bVal === undefined) return 0;
      
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortOption.direction === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  },
  
  getTasksByProject: (projectId) => {
    return get().tasks.filter((task) => task.projectId === projectId);
  },
  
  getTasksByTag: (tagId) => {
    return get().tasks.filter((task) => task.tags.some((tag) => tag.id === tagId));
  },
  
  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    );
  },
  
  getTodayTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return get().tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  },
  
  getUpcomingTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return get().tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= nextWeek && task.status !== 'completed';
    });
  },
    }),
    {
      name: getUserStorageKey(),
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        tags: state.tags,
      }),
    }
  )
);
