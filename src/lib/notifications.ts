import { Task } from '../types';
import { differenceInMinutes, isPast, isFuture, addMinutes } from 'date-fns';

export interface Notification {
  id: string;
  taskId: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  snoozedUntil?: Date;
  priority: 'low' | 'medium' | 'high';
}

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    // Check for due tasks every minute
    this.checkInterval = setInterval(() => {
      this.checkDueTasks();
    }, 60000); // Every minute
  }

  private checkDueTasks() {
    // This will be called with current tasks from the app
    // For now, it's a placeholder
  }

  public setTasks(tasks: Task[]) {
    const now = new Date();
    
    tasks.forEach(task => {
      if (!task.dueDate || task.status === 'completed') return;
      
      const dueDate = new Date(task.dueDate);
      const minutesUntilDue = differenceInMinutes(dueDate, now);
      
      // Create notification 30 minutes before due
      if (minutesUntilDue > 0 && minutesUntilDue <= 30) {
        const existingNotif = this.notifications.find(n => n.taskId === task.id);
        if (!existingNotif) {
          this.addNotification({
            id: `notif-${task.id}`,
            taskId: task.id,
            title: `Task Due Soon: ${task.title}`,
            body: `Due in ${minutesUntilDue} minutes`,
            timestamp: now,
            read: false,
            priority: task.priority === 'critical' || task.priority === 'high' ? 'high' : 'medium',
          });
        }
      }
      
      // Overdue notification
      if (isPast(dueDate)) {
        const existingNotif = this.notifications.find(
          n => n.taskId === task.id && n.title.includes('Overdue')
        );
        if (!existingNotif) {
          this.addNotification({
            id: `overdue-${task.id}`,
            taskId: task.id,
            title: `Task Overdue: ${task.title}`,
            body: `This task was due ${Math.abs(minutesUntilDue)} minutes ago`,
            timestamp: now,
            read: false,
            priority: 'high',
          });
        }
      }
    });
  }

  private addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.notifyListeners();
    
    // Show desktop notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icon.png',
        tag: notification.id,
      });
    }
  }

  public requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied' as NotificationPermission);
  }

  public getNotifications(): Notification[] {
    const now = new Date();
    // Filter out snoozed notifications
    return this.notifications.filter(n => {
      if (n.snoozedUntil && isFuture(n.snoozedUntil)) {
        return false;
      }
      return true;
    });
  }

  public getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  public markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  public markAllAsRead() {
    this.notifications.forEach(n => (n.read = true));
    this.notifyListeners();
  }

  public snooze(id: string, minutes: number) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.snoozedUntil = addMinutes(new Date(), minutes);
      this.notifyListeners();
    }
  }

  public dismiss(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  public subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const notifications = this.getNotifications();
    this.listeners.forEach(listener => listener(notifications));
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners.clear();
  }
}

export const notificationManager = new NotificationManager();
