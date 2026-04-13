import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateEventRequest, CreateEventResponse } from '../interfaces/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createEvent(payload: CreateEventRequest): Observable<CreateEventResponse> {
    return this.http.post<CreateEventResponse>(`${this.apiUrl}/events`, payload);
  }
}
