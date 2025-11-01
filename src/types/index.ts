export type Priority = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'blocked' | 'archived';
export type ViewMode = 'list' | 'kanban' | 'calendar' | 'timeline' | 'matrix' | 'gantt' | 'mind-map';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  tags: Tag[];
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Advanced features
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  timeEntries: TimeEntry[];
  
  // Organization
  projectId?: string;
  parentTaskId?: string;
  assignedTo?: string[];
  
  // Recurrence
  repeatType: RepeatType;
  repeatInterval?: number;
  repeatEndDate?: Date;
  
  // Productivity
  estimatedTime?: number; // in minutes
  actualTime?: number;
  pomodoroCount?: number;
  
  // AI & Smart features
  aiSuggestions?: string[];
  autoTags?: string[];
  difficulty?: number; // 1-10
  importance?: number; // 1-10
  
  // Location & context
  location?: string;
  contextTags?: string[];
  
  // Collaboration
  sharedWith?: string[];
  isPublic?: boolean;
  
  // Custom fields
  customFields?: Record<string, any>;
  
  // View specific
  position?: number;
  color?: string;
  icon?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  taskIds: string[];
  settings?: ProjectSettings;
}

export interface ProjectSettings {
  defaultPriority?: Priority;
  defaultTags?: string[];
  enableTimeTracking?: boolean;
  enableSubtasks?: boolean;
  viewMode?: ViewMode;
}

export interface Filter {
  status?: TaskStatus[];
  priority?: Priority[];
  tags?: string[];
  projects?: string[];
  assignedTo?: string[];
  dateRange?: { start: Date; end: Date };
  search?: string;
  hasSubtasks?: boolean;
  hasDueDate?: boolean;
  isOverdue?: boolean;
}

export interface SortOption {
  field: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  defaultView: ViewMode;
  notifications: NotificationSettings;
  shortcuts: Record<string, string>;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  startOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  pomodoroSettings: PomodoroSettings;
  aiSettings: AISettings;
}

export interface NotificationSettings {
  enabled: boolean;
  showDesktopNotifications: boolean;
  soundEnabled: boolean;
  dueDateReminders: boolean;
  reminderTime: number; // minutes before due
  dailyDigest: boolean;
  digestTime: string; // HH:MM
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface AISettings {
  enableAutoTags: boolean;
  enableSmartSuggestions: boolean;
  enablePriorityPrediction: boolean;
  enableDueDateSuggestion: boolean;
  enableTimeEstimation: boolean;
}

export interface Analytics {
  completedTasks: number;
  totalTimeSpent: number;
  averageCompletionTime: number;
  tasksByPriority: Record<Priority, number>;
  tasksByStatus: Record<TaskStatus, number>;
  productivityScore: number;
  streakDays: number;
  mostProductiveHour: number;
  taskCompletionRate: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  progress: number;
  taskIds: string[];
  milestones: Milestone[];
  createdAt: Date;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate?: Date;
  completed: boolean;
  taskIds: string[];
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  taskTemplate: Partial<Task>;
  category: string;
  usageCount: number;
}

export interface Workspace {
  id: string;
  name: string;
  projects: Project[];
  tasks: Task[];
  settings: UserSettings;
}
