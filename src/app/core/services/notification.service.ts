import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  show(message: string, type: NotificationType = 'info', duration = 3000): void {
    const id = Math.random().toString(36).substring(2);
    const notification: Notification = { id, type, message, duration };

    this._notifications.update(n => [...n, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error', 5000); }
  info(message: string): void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  remove(id: string): void {
    this._notifications.update(n => n.filter(notif => notif.id !== id));
  }
}
