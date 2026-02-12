import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import {LoadingSpinnerComponent} from '../../shared/components/loading-spinner/loading-spinner';
import {RelativeDatePipe} from '../../shared/pipes/relative-date.pipe';
import {AuthService} from '../../core/services/auth.service';
import {NotificationService} from '../../core/services/notification.service';
import {selectAllFavorites, selectFavoritesLoading} from '../../store/favorites/favorites.selectors';
import {FavoritesActions} from '../../store/favorites/favorites.actions';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, RelativeDatePipe],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {
  private store = inject(Store);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  favorites$ = this.store.select(selectAllFavorites);
  loading$ = this.store.select(selectFavoritesLoading);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.store.dispatch(FavoritesActions.loadFavorites({ userId: user.id }));
    }
  }

  removeFavorite(id: number): void {
    this.store.dispatch(FavoritesActions.removeFavorite({ id }));
    this.notificationService.info('Removed from favorites');
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

  trackByFavoriteId(index: number, fav: any): number {
    return fav.id;
  }
}
