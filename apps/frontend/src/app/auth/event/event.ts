import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CampusEvent } from '../interfaces/event';
import { EventService } from '../services/event-service';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './event.html',
  styleUrls: ['./event.css']
})
export class EventComponent implements OnInit {
  private readonly eventService = inject(EventService);

  events: CampusEvent[] = [];

  ngOnInit(): void {
    this.events = this.eventService.getEvents();
  }
}