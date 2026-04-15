import { Component, inject, OnInit } from '@angular/core';
import { CampusEvent } from '../../interfaces/event';
import { EventService } from '../../services/event-service';
import { RouterLink } from '@angular/router';
import { DatePipe, CommonModule, AsyncPipe } from '@angular/common';
import { Observable, finalize, catchError, of } from 'rxjs';

@Component({
  selector: 'app-event-page',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule, AsyncPipe],
  templateUrl: './event-page.html',
  styleUrl: './event-page.css',
})
export class EventPage implements OnInit {
  private readonly eventService = inject(EventService);

  events$: Observable<CampusEvent[] | null> | undefined;
  error: string | null = null;

  ngOnInit(): void {
    console.log('EventComponent: ngOnInit');
    this.events$ = this.eventService.getEvents().pipe(
      catchError((err) => {
        console.error('Error fetching events:', err);
        this.error = 'Failed to load events. Please try again later.';
        return of(null);
      })
    );
  }
}
