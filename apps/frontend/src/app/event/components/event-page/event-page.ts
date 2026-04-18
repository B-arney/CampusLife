import { Component, inject, OnInit } from '@angular/core';
import { CampusEvent } from '../../interfaces/event';
import { EventService } from '../../services/event-service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../auth/services/auth';

@Component({
  selector: 'app-event-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './event-page.html',
  styleUrl: './event-page.css',
})
export class EventPage implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly authService = inject(Auth);

  allEvents: CampusEvent[] = [];
  upcomingEvents: CampusEvent[] = [];
  pastEvents: CampusEvent[] = [];
  visibleEvents: CampusEvent[] = [];

  activeTab: 'upcoming' | 'past' = 'upcoming';
  loading = true;
  error: string | null = null;
  private readonly pageSize = 7;
  private visibleCount = 7;

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.loading = false;
        this.error = null;

        const sorted = [...events].sort((a, b) => {
          return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
        });

        this.allEvents = sorted;
        const now = Date.now();
        this.upcomingEvents = sorted.filter((event) => new Date(event.startsAt).getTime() >= now);
        this.pastEvents = sorted
          .filter((event) => new Date(event.startsAt).getTime() < now)
          .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

        this.resetVisibleEvents();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching events:', err);
        this.error = 'Failed to load events. Please try again later.';
      }
    });
  }

  get emptyStateMessage(): string {
    if (this.activeTab === 'upcoming') {
      return 'No upcoming events. Check back later!';
    }
    return 'No past events yet.';
  }

  get canLoadMore(): boolean {
    return this.visibleCount < this.getActiveSource().length;
  }

  setTab(tab: 'upcoming' | 'past'): void {
    if (this.activeTab === tab) {
      return;
    }
    this.activeTab = tab;
    this.resetVisibleEvents();
  }

  onListScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 80;
    if (nearBottom) {
      this.loadMore();
    }
  }

  loadMore(): void {
    if (!this.canLoadMore) {
      return;
    }
    this.visibleCount += this.pageSize;
    this.applyVisibleSlice();
  }

  trackByEventId(_index: number, event: CampusEvent): number {
    return event.id;
  }

  formatMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }

  formatDay(dateStr: string): string {
    return String(new Date(dateStr).getDate());
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  logout(): void {
    this.authService.logout();
  }

  private resetVisibleEvents(): void {
    this.visibleCount = this.pageSize;
    this.applyVisibleSlice();
  }

  private applyVisibleSlice(): void {
    this.visibleEvents = this.getActiveSource().slice(0, this.visibleCount);
  }

  private getActiveSource(): CampusEvent[] {
    return this.activeTab === 'upcoming' ? this.upcomingEvents : this.pastEvents;
  }
}
