import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NormalizedJob } from '../../models/job.model';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesActions } from '../../../store/favorites/favorites.actions';
import { selectFavoriteByOfferId } from '../../../store/favorites/favorites.selectors';
import { NotificationService } from '../../../core/services/notification.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterLink, RelativeDatePipe],
  template: `
    <div class="group relative bg-surface-900/60 border border-white/8 rounded-2xl overflow-hidden
                hover:border-white/15 hover:bg-surface-900/90 transition-all duration-300
                hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">

      <!-- Top hover accent line -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div class="p-5">
        <!-- Header -->
        <div class="flex items-start gap-3 mb-4">
          <div class="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-base shadow-lg"
               [style.background]="getCompanyGradient(job.company)">
            {{ job.company[0]?.toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-display font-semibold text-white text-[15px] leading-snug line-clamp-2 group-hover:text-primary-200 transition-colors">
              {{ job.title }}
            </h3>
            <p class="text-sm text-slate-400 mt-0.5 truncate font-medium">{{ job.company }}</p>
          </div>
          <span class="flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wide"
                [class]="job.apiSource === 'themuse'
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                  : 'bg-sky-500/15 text-sky-300 border border-sky-500/20'">
            {{ job.apiSource === 'themuse' ? 'Muse' : 'Arbeitnow' }}
          </span>
        </div>

        <!-- Meta -->
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <svg class="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {{ job.location }}
          </span>
          @if (job.remote) {
            <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Remote
            </span>
          }
          @if (job.level) {
            <span class="text-xs text-slate-500">· {{ job.level }}</span>
          }
          <span class="text-xs text-slate-600 ml-auto">{{ job.publicationDate | relativeDate }}</span>
        </div>

        <!-- Description -->
        @if (job.description) {
          <p class="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{{ job.description }}</p>
        }

        <!-- Tags -->
        @if (job.tags && job.tags.length > 0) {
          <div class="flex flex-wrap gap-1.5 mb-4">
            @for (tag of job.tags.slice(0, 4); track tag) {
              <span class="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/8">{{ tag }}</span>
            }
            @if (job.tags.length > 4) {
              <span class="text-[11px] px-2 py-0.5 rounded-md text-slate-600">+{{ job.tags.length - 4 }}</span>
            }
          </div>
        }

        <!-- ── Action bar ── -->
        <div class="flex items-center gap-2 pt-3 border-t border-white/6">

          <!-- VIEW JOB -->
          <a [href]="job.url" target="_blank" rel="noopener noreferrer"
             class="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                    bg-primary-600 hover:bg-primary-500 active:scale-95
                    text-white text-sm font-semibold transition-all duration-150
                    shadow-md shadow-primary-900/40 hover:shadow-lg hover:shadow-primary-900/50">
            View Job
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>

          @if (isAuthenticated()) {

            <!-- FAVOURITE -->
            <button
              (click)="toggleFavorite()"
              [title]="isFavorite() ? 'Remove from favorites' : 'Save to favorites'"
              class="group/fav relative inline-flex flex-col items-center justify-center w-14 h-10 rounded-xl border
                     transition-all duration-200 active:scale-95"
              [class]="isFavorite()
                ? 'bg-rose-500/15 border-rose-500/35 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/50'
                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-rose-500/10 hover:border-rose-500/25 hover:text-rose-400'">
              <svg class="w-4 h-4 transition-all duration-200 group-hover/fav:scale-110"
                   [attr.fill]="isFavorite() ? 'currentColor' : 'none'"
                   viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span class="text-[9px] font-medium leading-none mt-0.5">
                {{ isFavorite() ? 'Saved' : 'Save' }}
              </span>
            </button>

            <!-- TRACK APPLICATION -->
            <button
              (click)="trackApplication()"
              [disabled]="isTracked() || trackingInProgress()"
              [title]="isTracked() ? 'Already tracking' : 'Track application'"
              class="group/track relative inline-flex flex-col items-center justify-center w-14 h-10 rounded-xl border
                     transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
              [class]="isTracked()
                ? 'bg-emerald-500/12 border-emerald-500/30 text-emerald-400'
                : trackingInProgress()
                  ? 'bg-white/5 border-white/10 text-slate-600 opacity-70'
                  : 'bg-white/5 border-white/10 text-slate-500 hover:bg-primary-500/10 hover:border-primary-500/25 hover:text-primary-400'">

              @if (trackingInProgress()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
                  <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              } @else if (isTracked()) {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } @else {
                <svg class="w-4 h-4 transition-transform duration-200 group-hover/track:scale-110"
                     fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              }
              <span class="text-[9px] font-medium leading-none mt-0.5">
                {{ isTracked() ? 'Tracked' : 'Track' }}
              </span>
            </button>

          }
        </div>

        @if (!isAuthenticated()) {
          <p class="text-center text-[11px] text-slate-600 mt-3">
            <a routerLink="/auth/login" class="text-primary-400/60 hover:text-primary-400 transition-colors underline underline-offset-2">Sign in</a>
            to save & track this job
          </p>
        }

      </div>
    </div>
  `,
})
export class JobCardComponent implements OnInit {
  @Input({ required: true }) job!: NormalizedJob;
  @Output() applicationTracked = new EventEmitter<void>();

  private store = inject(Store);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private applicationsService = inject(ApplicationsService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUser = this.authService.currentUser;

  isFavorite = signal(false);
  isTracked = signal(false);
  trackingInProgress = signal(false);
  private favoriteId = signal<number | null>(null);

  ngOnInit(): void {
    this.store.select(selectFavoriteByOfferId(this.job.id)).subscribe(fav => {
      this.isFavorite.set(!!fav);
      this.favoriteId.set(fav?.id ?? null);
    });

    const user = this.currentUser();
    if (user) {
      this.applicationsService.checkAlreadyApplied(user.id, this.job.id).subscribe(apps => {
        this.isTracked.set(apps.length > 0);
      });
    }
  }

  toggleFavorite(): void {
    const user = this.currentUser();
    if (!user) return;

    if (this.isFavorite()) {
      const id = this.favoriteId();
      if (id !== null) {
        this.store.dispatch(FavoritesActions.removeFavorite({ id }));
        this.notificationService.info('Removed from favorites');
      }
    } else {
      this.store.dispatch(FavoritesActions.addFavorite({
        favorite: {
          userId: user.id,
          offerId: this.job.id,
          title: this.job.title,
          company: this.job.company,
          location: this.job.location,
          url: this.job.url,
          apiSource: this.job.apiSource,
          dateAdded: new Date().toISOString(),
        }
      }));
      this.notificationService.success('Saved to favorites ❤️');
    }
  }

  trackApplication(): void {
    const user = this.currentUser();
    if (!user || this.isTracked() || this.trackingInProgress()) return;

    this.trackingInProgress.set(true);

    this.applicationsService.addApplication({
      userId: user.id,
      offerId: this.job.id,
      apiSource: this.job.apiSource,
      title: this.job.title,
      company: this.job.company,
      location: this.job.location,
      url: this.job.url,
      status: 'en_attente',
      notes: '',
      dateAdded: new Date().toISOString(),
    }).subscribe({
      next: () => {
        this.isTracked.set(true);
        this.trackingInProgress.set(false);
        this.notificationService.success('Application tracked! 📋');
        this.applicationTracked.emit();
      },
      error: () => {
        this.trackingInProgress.set(false);
        this.notificationService.error('Failed to track — is JSON Server running?');
      },
    });
  }

  getCompanyGradient(company: string): string {
    const gradients = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #f97316, #ec4899)',
      'linear-gradient(135deg, #06b6d4, #6366f1)',
      'linear-gradient(135deg, #10b981, #06b6d4)',
      'linear-gradient(135deg, #f59e0b, #ef4444)',
      'linear-gradient(135deg, #8b5cf6, #ec4899)',
    ];
    return gradients[company.charCodeAt(0) % gradients.length];
  }
}
