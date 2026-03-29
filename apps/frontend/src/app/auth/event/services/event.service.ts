import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string; // matches current form (`datetime-local`)
  location: string;
  category: string;
  interests?: string[];
  imageUrl?: string;
}

export interface CreateEventResponse {
  event: {
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
  };
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createEvent(payload: CreateEventRequest): Observable<CreateEventResponse> {
    return this.http.post<CreateEventResponse>(`${this.apiUrl}/events`, payload);
  }
}

