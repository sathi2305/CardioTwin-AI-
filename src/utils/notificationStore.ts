import { AppNotification } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'cardiotwin_notifications_list';

class NotificationStore {
  private notifications: AppNotification[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (data) {
        this.notifications = JSON.parse(data);
      }
    } catch (_) {}

    if (this.notifications.length === 0) {
      this.notifications = [
        {
          id: 'notif-1',
          title: 'Digital Twin Synchronized',
          message: 'EHR records and streaming wearable window successfully fused for CT-1001 Eleanor Vance.',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          severity: 'info',
          patientId: 'CT-1001',
          read: false,
          category: 'Twin',
        },
        {
          id: 'notif-2',
          title: 'Autonomic Strain Warning',
          message: 'Simulated photoplethysmography telemetry indicates depressed HRV RMSSD (<22ms).',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          severity: 'warning',
          patientId: 'CT-1001',
          read: false,
          category: 'Risk',
        },
      ];
      this.save();
    }
  }

  private save() {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications.slice(0, 30)));
    } catch (_) {}
    this.notify();
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getAll(): AppNotification[] {
    return this.notifications;
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public add(notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(newNotif);
    this.save();
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.save();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.save();
  }

  public clearAll() {
    this.notifications = [];
    this.save();
  }
}

export const notificationStore = new NotificationStore();
