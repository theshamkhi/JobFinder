import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application, ApplicationStatus } from '../../shared/models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {
  private http = inject(HttpClient);
  private readonly BASE_URL = `${environment.jsonServerUrl}/applications`;

  getApplicationsByUser(userId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.BASE_URL}?userId=${userId}`).pipe(
      map(apps =>
        [...apps].sort((a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        )
      )
    );
  }

  addApplication(application: Omit<Application, 'id'>): Observable<Application> {
    return this.http.post<Application>(this.BASE_URL, application);
  }

  updateStatus(id: number, status: ApplicationStatus): Observable<Application> {
    return this.http.patch<Application>(`${this.BASE_URL}/${id}`, { status });
  }

  updateNotes(id: number, notes: string): Observable<Application> {
    return this.http.patch<Application>(`${this.BASE_URL}/${id}`, { notes });
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`);
  }

  checkAlreadyApplied(userId: number, offerId: string): Observable<Application[]> {
    return this.http.get<Application[]>(
      `${this.BASE_URL}?userId=${userId}&offerId=${encodeURIComponent(offerId)}`
    );
  }
}
