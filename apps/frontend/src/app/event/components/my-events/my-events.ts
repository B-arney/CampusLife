import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../auth/services/auth';
import { CampusEvent } from '../../interfaces/event';
import { EventService } from '../../services/event-service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css'
})
export class MyEvents implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly auth = inject(Auth);
  private readonly cdr = inject(ChangeDetectorRef);

  myEvents: CampusEvent[] = [];
  loading = true;
  error: string | null = null;
  deletingEventId: number | null = null;

  ngOnInit(): void {
    this.loadMyEvents();
  }

  loadMyEvents(): void {
    this.loading = true;
    this.error = null;

    this.eventService.getMyEvents().subscribe({
      next: (events) => {
        if (events.length > 0) {
          this.myEvents = events;
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        // Fallback for legacy data where hostId may be missing.
        this.auth.me().subscribe({
          next: ({ user }) => {
            this.eventService.getAllEvents().subscribe({
              next: (allEvents) => {
                this.myEvents = allEvents.filter(event =>
                  event.hostId === user.id ||
                  (!event.hostId && (event.hostName === user.username || event.hostName === user.displayName))
                );
                this.loading = false;
                this.cdr.detectChanges();
              },
              error: () => {
                this.loading = false;
                this.error = 'Failed to load your events.';
                this.cdr.detectChanges();
              }
            });
          },
          error: () => {
            this.loading = false;
            this.error = 'Failed to load your events.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Failed to load your events.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteEvent(eventId: number): void {
    if (this.deletingEventId != null) {
      return;
    }

    if (!globalThis.confirm('Cancel this event? This action cannot be undone.')) {
      return;
    }

    this.deletingEventId = eventId;

    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.myEvents = this.myEvents.filter(event => event.id !== eventId);
        this.deletingEventId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to cancel event.';
        this.deletingEventId = null;
        this.cdr.detectChanges();
      }
    });
  }
}
