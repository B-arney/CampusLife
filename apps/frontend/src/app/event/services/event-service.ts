import { inject, Injectable, signal } from '@angular/core';
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

  private events = signal<CampusEvent[]>([]);
  readonly eventsList = this.events.asReadonly();

  getAllEvents(): Observable<CampusEvent[]> {
    return this.http.get<CampusEvent[]>(this.apiUrl).pipe(
      tap((events) => this.events.set(events))
    );
  }

  getEvents(): Observable<CampusEvent[]> {
    return this.getAllEvents();
  }

  getEventById(id: number): Observable<CampusEvent> {
    return this.http.get<CampusEvent>(`${this.apiUrl}/${id}`);
  }

  getEvent(id: number): Observable<CampusEvent> {
	return this.getEventById(id);
  }

  createEvent(event: CreateEventRequest): Observable<CampusEvent> {
    return this.http.post<CampusEvent>(this.apiUrl, event).pipe(
      tap((newEvent) => {
        this.events.update((currentEvents) => [newEvent,...currentEvents]);
      })
    );
  }

  updateEvent(id: number, event: UpdateEventRequest): Observable<CampusEvent> {
    return this.http.put<CampusEvent>(`${this.apiUrl}/${id}`, event).pipe(
      tap((updatedEvent) => {
        this.events.update((currentEvents) =>
          currentEvents.map((e) => (e.id === id ? { ...e, ...updatedEvent } : e))
        );
      })
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.events.update((currentEvents) => 
          currentEvents.filter((e) => e.id !== id)
        );
      })
    );
  }

  getMyRSVPs(): Observable<CampusEvent[]> {
    return this.http.get<CampusEvent[]>(`${this.apiUrl}/me/rsvps`);
  }

  rsvp(eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/rsvp`, {});
  }

  cancelRsvp(eventId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${eventId}/rsvp`);
  }
}
