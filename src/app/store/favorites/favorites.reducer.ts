import { createReducer, on } from '@ngrx/store';
import { FavoriteOffer } from '../../shared/models/favorite.model';
import { FavoritesActions } from './favorites.actions';

export interface FavoritesState {
  favorites: FavoriteOffer[];
  loading: boolean;
  error: string | null;
}

export const initialFavoritesState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
};

export const favoritesReducer = createReducer(
  initialFavoritesState,

  // Load
  on(FavoritesActions.loadFavorites, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(FavoritesActions.loadFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    favorites,
    loading: false,
  })),
  on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Add
  on(FavoritesActions.addFavorite, (state) => ({
    ...state,
    loading: true,
  })),
  on(FavoritesActions.addFavoriteSuccess, (state, { favorite }) => ({
    ...state,
    favorites: [...state.favorites, favorite],
    loading: false,
  })),
  on(FavoritesActions.addFavoriteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Remove
  on(FavoritesActions.removeFavorite, (state) => ({
    ...state,
    loading: true,
  })),
  on(FavoritesActions.removeFavoriteSuccess, (state, { id }) => ({
    ...state,
    favorites: state.favorites.filter(f => f.id !== id),
    loading: false,
  })),
  on(FavoritesActions.removeFavoriteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Clear
  on(FavoritesActions.clearFavorites, () => initialFavoritesState),
);
