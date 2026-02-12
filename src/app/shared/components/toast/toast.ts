import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 flex flex-col gap-3 z-50 max-w-sm w-full px-4 sm:px-0">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div
          class="flex items-start gap-3 p-4 rounded-xl shadow-2xl shadow-black/50 border animate-slide-up"
          [class]="getClasses(notification.type)">

          <!-- Icon -->
          <div class="flex-shrink-0 w-5 h-5 mt-0.5">
            @switch (notification.type) {
              @case ('success') {
                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              @case ('error') {
                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              }
              @case ('warning') {
                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              }
              @default {
                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              }
            }
          </div>

          <p class="text-sm font-medium flex-1 leading-relaxed">{{ notification.message }}</p>

          <button
            (click)="notificationService.remove(notification.id)"
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  notificationService = inject(NotificationService);

  getClasses(type: string): string {
    const base = 'backdrop-blur-sm';
    switch (type) {
      case 'success': return `${base} bg-emerald-950/90 border-emerald-500/30 text-emerald-300`;
      case 'error': return `${base} bg-red-950/90 border-red-500/30 text-red-300`;
      case 'warning': return `${base} bg-amber-950/90 border-amber-500/30 text-amber-300`;
      default: return `${base} bg-primary-950/90 border-primary-500/30 text-primary-300`;
    }
  }
}
