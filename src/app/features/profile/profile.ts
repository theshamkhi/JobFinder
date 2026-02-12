import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from '../../core/services/auth.service';
import {NotificationService} from '../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  readonly saving = signal(false);
  readonly savingPassword = signal(false);
  readonly successMessage = signal('');
  readonly confirmDelete = signal(false);

  readonly initials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  });

  profileForm = this.fb.group({
    firstName: [this.authService.currentUser()?.firstName || '', [Validators.required, Validators.minLength(2)]],
    lastName: [this.authService.currentUser()?.lastName || '', [Validators.required, Validators.minLength(2)]],
    email: [this.authService.currentUser()?.email || '', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, {
    validators: (control) => {
      const pw = control.get('newPassword');
      const cf = control.get('confirmPassword');
      if (pw && cf && pw.value !== cf.value) return { passwordMismatch: true };
      return null;
    }
  });

  isInvalid(field: string): boolean {
    const c = this.profileForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  hasPasswordMismatch(): boolean {
    return this.passwordForm.hasError('passwordMismatch') &&
      !!this.passwordForm.get('confirmPassword')?.touched;
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.authService.updateProfile(this.profileForm.value as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Profile updated successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => this.saving.set(false),
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword.set(true);
    const { newPassword } = this.passwordForm.value;
    this.authService.updateProfile({ password: newPassword! }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.notificationService.success('Password updated!');
        this.passwordForm.reset();
      },
      error: () => this.savingPassword.set(false),
    });
  }

  deleteAccount(): void {
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.notificationService.info('Account deleted');
        this.router.navigate(['/']);
      },
    });
  }

  cancelDelete(): void {
    this.confirmDelete.set(false);
  }

  confirmDeleteAccount(): void {
    this.confirmDelete.set(true);
  }
}
