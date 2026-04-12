import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CampusEvent } from '../interfaces/event';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/events`;

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
