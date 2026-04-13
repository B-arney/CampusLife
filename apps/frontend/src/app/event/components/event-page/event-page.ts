import { Component, inject, OnInit } from '@angular/core';
import { CampusEvent } from '../../interfaces/event';
import { EventService } from '../../services/event-service';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './event-page.html',
  styleUrl: './event-page.css',
})
export class EventPage implements OnInit {
  private readonly eventService = inject(EventService);

  events$: Observable<CampusEvent[]> | undefined;

  ngOnInit(): void {
    console.log('EventComponent: ngOnInit');
    this.events$ = this.eventService.getEvents();
  }
}
