import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FavoriteOffer } from '../../shared/models/favorite.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private http = inject(HttpClient);
  private readonly BASE_URL = `${environment.jsonServerUrl}/favoritesOffers`;

  getFavoritesByUser(userId: number): Observable<FavoriteOffer[]> {
    return this.http.get<FavoriteOffer[]>(`${this.BASE_URL}?userId=${userId}`);
  }

  addFavorite(favorite: Omit<FavoriteOffer, 'id'>): Observable<FavoriteOffer> {
    return this.http.post<FavoriteOffer>(this.BASE_URL, favorite);
  }

  removeFavorite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
