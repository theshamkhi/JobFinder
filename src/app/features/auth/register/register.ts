import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  isInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  getError(field: string): string {
    const c = this.registerForm.get(field);
    if (!c?.errors) return '';
    if (c.errors['required']) return 'This field is required';
    if (c.errors['email']) return 'Please enter a valid email';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters`;
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  hasPasswordMismatch(): boolean {
    return this.registerForm.hasError('passwordMismatch') &&
      !!this.registerForm.get('confirmPassword')?.touched;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { firstName, lastName, email, password } = this.registerForm.value;
    const payload = { firstName: firstName!, lastName: lastName!, email: email!, password: password! };

    // Check email uniqueness then create
    this.http.get<any[]>(`${environment.jsonServerUrl}/users?email=${encodeURIComponent(email!)}`).subscribe({
      next: (users) => {
        if (users.length > 0) {
          this.loading.set(false);
          this.errorMessage.set('This email is already registered');
          return;
        }

        this.http.post<any>(`${environment.jsonServerUrl}/users`, payload).subscribe({
          next: () => {
            this.loading.set(false);
            this.notificationService.success('Account created! Please sign in.');
            this.router.navigate(['/auth/login']);
          },
          error: () => {
            this.loading.set(false);
            this.errorMessage.set('Registration failed. Please try again.');
          }
        });
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Registration failed. Is JSON Server running?');
      }
    });
  }
}
