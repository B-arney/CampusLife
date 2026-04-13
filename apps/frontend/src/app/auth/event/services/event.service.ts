import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EventSummary {
  id: number;
  title: string;
  description: string;
  startAt: string;
  location: string;
  category: string;
  imageUrl: string | null;
  interests: unknown;
  hostId: number;
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  interests?: string[];
  imageUrl?: string;
}

export type UpdateEventRequest = CreateEventRequest;

export interface SingleEventResponse {
  event: EventSummary;
}

export interface ListEventsResponse {
  events: EventSummary[];
}

@Injectable({ providedIn: 'root' })
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
}
