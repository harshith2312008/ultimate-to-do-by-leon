import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task, Priority } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | undefined, format?: string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  return new Date(task.dueDate) < new Date();
}

export function isDueToday(task: Task): boolean {
  if (!task.dueDate) return false;
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return (
    today.getDate() === dueDate.getDate() &&
    today.getMonth() === dueDate.getMonth() &&
    today.getFullYear() === dueDate.getFullYear()
  );
}

export function isDueSoon(task: Task, days: number = 7): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

export function getPriorityColor(priority: Priority): string {
  const colors = {
    none: 'gray',
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    critical: 'red',
  };
  return colors[priority] || 'gray';
}

export function getPriorityValue(priority: Priority): number {
  const values = {
    none: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return values[priority] || 0;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function calculateCompletionPercentage(task: Task): number {
  if (task.status === 'completed') return 100;
  if (task.subtasks.length === 0) return 0;
  
  const completed = task.subtasks.filter((st) => st.completed).length;
  return Math.round((completed / task.subtasks.length) * 100);
}

export function getTaskDuration(task: Task): number {
  return task.timeEntries.reduce((total, entry) => total + entry.duration, 0);
}

export function exportToJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function fuzzySearch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  
  return qi === q.length;
}
