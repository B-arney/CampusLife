import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, map, finalize } from 'rxjs';
import { CampusEvent } from '../interfaces/event';
import { EventService } from '../services/event-service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  private readonly eventSubject = new BehaviorSubject<CampusEvent | undefined>(undefined);
  selectedEvent$: Observable<CampusEvent | undefined> = this.eventSubject.asObservable();

  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  hasUserRsvped$: Observable<boolean> = this.selectedEvent$.pipe(map(e => !!e?.hasUserRsvped));
  isPastEvent$: Observable<boolean> = this.selectedEvent$.pipe(map(e => e ? new Date(e.startsAt).getTime() < Date.now() : false));

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idStr = params.get('id');
      const eventId = idStr ? parseInt(idStr, 10) : null;

      if (eventId === null || isNaN(eventId)) {
        this.eventSubject.next(undefined);
        this.loadingSubject.next(false);
        return;
      }

      this.loadEvent(eventId);
    });
  }

  loadEvent(id: number): void {
    this.loadingSubject.next(true);
    this.eventService.getEventById(id).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (event) => {
        this.eventSubject.next(event);
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.eventSubject.next(undefined);
      }
    });
  }

  onRsvp(): void {
    const event = this.eventSubject.value;
    if (!event) return;

    this.eventService.rsvp(event.id).subscribe({
      next: () => {
        this.loadEvent(event.id);
      },
      error: (err) => {
        console.error('RSVP failed', err);
        if (err.status === 401) {
          alert('Be kell jelentkezned a jelentkezéshez!');
        }
      }
    });
  }
}
