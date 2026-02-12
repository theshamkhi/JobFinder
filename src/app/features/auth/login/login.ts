import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import { FavoritesActions } from '../../../store/favorites/favorites.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  getError(field: string): string {
    const control = this.loginForm.get(field);
    if (!control?.errors) return '';
    if (control.errors['required']) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    if (control.errors['email']) return 'Please enter a valid email';
    if (control.errors['minlength']) return 'Password must be at least 6 characters';
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (user) => {
        this.loading.set(false);
        // Load favorites after login
        this.store.dispatch(FavoritesActions.loadFavorites({ userId: user.id }));
        this.notificationService.success(`Welcome back, ${user.firstName}! 👋`);

        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/jobs';
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Login failed. Please try again.');
      },
    });
  }
}
