import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FavoriteOffer } from '../../shared/models/favorite.model';

export const FavoritesActions = createActionGroup({
  source: 'Favorites',
  events: {
    // Load favorites
    'Load Favorites': props<{ userId: number }>(),
    'Load Favorites Success': props<{ favorites: FavoriteOffer[] }>(),
    'Load Favorites Failure': props<{ error: string }>(),

    // Add favorite
    'Add Favorite': props<{ favorite: Omit<FavoriteOffer, 'id'> }>(),
    'Add Favorite Success': props<{ favorite: FavoriteOffer }>(),
    'Add Favorite Failure': props<{ error: string }>(),

    // Remove favorite
    'Remove Favorite': props<{ id: number }>(),
    'Remove Favorite Success': props<{ id: number }>(),
    'Remove Favorite Failure': props<{ error: string }>(),

    // Clear all (on logout)
    'Clear Favorites': emptyProps(),
  }
});
