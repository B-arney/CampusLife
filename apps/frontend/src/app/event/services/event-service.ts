import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { CampusEvent, CreateEventRequest, UpdateEventRequest } from '../interfaces/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/events`;

  listEvents(): Observable<CampusEvent[]> {
    return this.http.get<CampusEvent[]>(this.apiUrl).pipe(
      tap(events => console.log('EventService: Received events:', events))
    );
  }

  getEvent(id: number): Observable<CampusEvent> {
    return this.http.get<CampusEvent>(`${this.apiUrl}/${id}`);
  }

  createEvent(payload: CreateEventRequest): Observable<CampusEvent> {
    return this.http.post<CampusEvent>(this.apiUrl, payload);
  }

  updateEvent(id: number, payload: UpdateEventRequest): Observable<CampusEvent> {
    return this.http.put<CampusEvent>(`${this.apiUrl}/${id}`, payload);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEvents(): Observable<CampusEvent[]> {
    return this.listEvents();
  }

  getEventById(id: number): Observable<CampusEvent> {
    return this.getEvent(id);
  }

  rsvp(eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/rsvp`, {});
  }
}
