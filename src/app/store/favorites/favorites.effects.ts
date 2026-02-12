import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FavoritesActions } from './favorites.actions';
import { FavoritesService } from '../../core/services/favorites.service';

@Injectable()
export class FavoritesEffects {
  private actions$ = inject(Actions);
  private favoritesService = inject(FavoritesService);

  loadFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.loadFavorites),
      switchMap(({ userId }) =>
        this.favoritesService.getFavoritesByUser(userId).pipe(
          map((favorites) => FavoritesActions.loadFavoritesSuccess({ favorites })),
          catchError((error) =>
            of(FavoritesActions.loadFavoritesFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.addFavorite),
      mergeMap(({ favorite }) =>
        this.favoritesService.addFavorite(favorite).pipe(
          map((savedFavorite) => FavoritesActions.addFavoriteSuccess({ favorite: savedFavorite })),
          catchError((error) =>
            of(FavoritesActions.addFavoriteFailure({ error: error.message }))
          )
        )
      )
    )
  );

  removeFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.removeFavorite),
      mergeMap(({ id }) =>
        this.favoritesService.removeFavorite(id).pipe(
          map(() => FavoritesActions.removeFavoriteSuccess({ id })),
          catchError((error) =>
            of(FavoritesActions.removeFavoriteFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
