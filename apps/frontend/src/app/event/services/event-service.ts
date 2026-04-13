import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { CampusEvent, CreateEventRequest, ListEventsResponse, SingleEventResponse, UpdateEventRequest } from '../interfaces/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  listEvents(): Observable<ListEventsResponse> {
    return this.http.get<ListEventsResponse>(`${this.apiUrl}/events`);
  }

  getEvent(id: number): Observable<SingleEventResponse> {
    return this.http.get<SingleEventResponse>(`${this.apiUrl}/events/${id}`);
  }

  createEvent(payload: CreateEventRequest): Observable<SingleEventResponse> {
    return this.http.post<SingleEventResponse>(`${this.apiUrl}/events`, payload);
  }

  updateEvent(id: number, payload: UpdateEventRequest): Observable<SingleEventResponse> {
    return this.http.put<SingleEventResponse>(`${this.apiUrl}/events/${id}`, payload);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`);
  }



  getEvents(): Observable<CampusEvent[]> {
    return this.http.get<CampusEvent[]>(this.apiUrl).pipe(
      tap(events => console.log('EventService: Received events:', events))
    );
  }

  getEventById(id: number): Observable<CampusEvent> {
    return this.http.get<CampusEvent>(`${this.apiUrl}/${id}`);
  }

  rsvp(eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/rsvp`, {});
  }
}
