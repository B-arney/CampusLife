import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  event: CampusEvent | undefined;
  hasUserRsvped = false;
  isPastEvent = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const eventId = params.get('id');

      if (!eventId) {
        this.event = undefined;
        return;
      }

      this.event = this.eventService.getEventById(eventId);
      this.refreshEventState();
    });
  }

  onRsvp(): void {
    if (!this.event || this.isPastEvent || this.hasUserRsvped) {
      return;
    }

    this.eventService.rsvp(this.event.id);
    this.refreshEventState();
  }

  private refreshEventState(): void {
    if (!this.event) {
      this.hasUserRsvped = false;
      this.isPastEvent = false;
      return;
    }

    this.hasUserRsvped = this.eventService.hasUserRsvped(this.event.id);
    this.isPastEvent = new Date(this.event.startsAt).getTime() < Date.now();
  }
}
