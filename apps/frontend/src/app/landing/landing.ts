import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../event/services/event-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements OnInit{
	eventService = inject(EventService);

	ngOnInit(): void {
		this.eventService.getAllEvents().subscribe();
	}

  currentNewsIndex: number = 0;
  totalNews: number = 3;

  // Jobbra nyíl
  nextNews() {
    this.currentNewsIndex = (this.currentNewsIndex + 1) % this.totalNews;
  }

  // Balra nyíl
  prevNews() {
    this.currentNewsIndex = (this.currentNewsIndex - 1 + this.totalNews) % this.totalNews;
  }

  // Pöttyre kattintás
  setNews(index: number) {
    this.currentNewsIndex = index;
  }
}