import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';

      if (error.status === 0) {
        message = 'Cannot connect to server. Is JSON Server running?';
      } else if (error.status === 404) {
        message = 'Resource not found';
      } else if (error.status === 500) {
        message = 'Server error. Please try again later.';
      } else if (error.error?.message) {
        message = error.error.message;
      }

      // Only show toast for non-API external calls
      if (req.url.includes('localhost:3000')) {
        notificationService.error(message);
      }

      return throwError(() => new Error(message));
    })
  );
};
