import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserSession, LoginPayload, RegisterPayload } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly STORAGE_KEY = 'jobfinder_user';
  private readonly BASE_URL = environment.jsonServerUrl;

  private _currentUser = signal<UserSession | null>(this.loadFromStorage());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  private loadFromStorage(): UserSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  login(payload: LoginPayload): Observable<UserSession> {
    return this.http.get<User[]>(
      `${this.BASE_URL}/users?email=${encodeURIComponent(payload.email)}`
    ).pipe(
      map(users => {
        const user = users.find(u => u.email === payload.email && u.password === payload.password);
        if (!user) {
          throw new Error('Invalid email or password');
        }
        // Store without password
        const session: UserSession = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        };
        return session;
      }),
      tap(session => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this._currentUser.set(session);
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(payload: RegisterPayload): Observable<UserSession> {
    // Check if email already exists, then create user
    return this.http.get<User[]>(
      `${this.BASE_URL}/users?email=${encodeURIComponent(payload.email)}`
    ).pipe(
      switchMap(users => {
        if (users.length > 0) {
          throw new Error('This email is already in use');
        }
        // Create the user
        return this.http.post<User>(`${this.BASE_URL}/users`, payload);
      }),
      map(user => {
        // Convert User to UserSession (without password)
        const session: UserSession = {
          id: user.id!,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        };
        return session;
      }),
      tap(session => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this._currentUser.set(session);
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/']);
  }

  updateProfile(updates: Partial<User>): Observable<UserSession> {
    const user = this._currentUser();
    if (!user) return throwError(() => new Error('Not authenticated'));

    return this.http.patch<User>(`${this.BASE_URL}/users/${user.id}`, updates).pipe(
      map(updated => {
        const session: UserSession = {
          id: updated.id!,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this._currentUser.set(session);
        return session;
      }),
      catchError(err => throwError(() => err))
    );
  }

  deleteAccount(): Observable<void> {
    const user = this._currentUser();
    if (!user) return throwError(() => new Error('Not authenticated'));

    return this.http.delete<void>(`${this.BASE_URL}/users/${user.id}`).pipe(
      tap(() => this.logout()),
      catchError(err => throwError(() => err))
    );
  }
}
