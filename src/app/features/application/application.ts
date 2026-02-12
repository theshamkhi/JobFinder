import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {LoadingSpinnerComponent} from '../../shared/components/loading-spinner/loading-spinner';
import {RelativeDatePipe} from '../../shared/pipes/relative-date.pipe';
import {ApplicationsService} from '../../core/services/applications.service';
import {AuthService} from '../../core/services/auth.service';
import {NotificationService} from '../../core/services/notification.service';
import {Application, ApplicationStatus} from '../../shared/models/application.model';


@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, RelativeDatePipe],
  templateUrl: './application.html',
  styleUrls: ['./application.css']
})
export class ApplicationsComponent implements OnInit {
  private applicationsService = inject(ApplicationsService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  readonly loading = signal(false);
  readonly applications = signal<Application[]>([]);

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.applicationsService.getApplicationsByUser(user.id).subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(id: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as ApplicationStatus;
    this.applicationsService.updateStatus(id, status).subscribe({
      next: () => {
        this.applications.update(apps =>
          apps.map(a => a.id === id ? { ...a, status } : a)
        );
        this.notificationService.success('Status updated');
      },
    });
  }

  saveNotes(id: number, event: Event): void {
    const notes = (event.target as HTMLTextAreaElement).value;
    this.applicationsService.updateNotes(id, notes).subscribe({
      next: () => this.notificationService.success('Notes saved'),
    });
  }

  deleteApp(id: number): void {
    this.applicationsService.deleteApplication(id).subscribe({
      next: () => {
        this.applications.update(apps => apps.filter(a => a.id !== id));
        this.notificationService.info('Application removed');
      },
    });
  }

  countByStatus(status: ApplicationStatus): number {
    return this.applications().filter(a => a.status === status).length;
  }

  getStatusSelectClass(status: ApplicationStatus): string {
    switch (status) {
      case 'accepte': return 'border-emerald-500/30 text-emerald-300';
      case 'refuse': return 'border-red-500/30 text-red-300';
      default: return 'border-amber-500/30 text-amber-300';
    }
  }

  getGradient(company: string): string {
    const gradients = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #f97316, #ec4899)',
      'linear-gradient(135deg, #06b6d4, #6366f1)',
      'linear-gradient(135deg, #10b981, #06b6d4)',
    ];
    return gradients[company.charCodeAt(0) % gradients.length];
  }

  trackByApplicationId(index: number, app: Application): number | undefined {
    return app.id;
  }
}
