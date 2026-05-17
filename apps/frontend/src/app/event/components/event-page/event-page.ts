import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CampusEvent, CategoryOption } from '../../interfaces/event';
import { EventService } from '../../services/event-service';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ScrollerModule } from 'primeng/scroller';
import { SkeletonModule } from 'primeng/skeleton';
import { Auth } from '../../../auth/services/auth';

@Component({
  selector: 'app-event-page',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe, FormsModule, MultiSelectModule, ButtonModule, BadgeModule, FloatLabelModule, ScrollerModule, SkeletonModule],
  templateUrl: './event-page.html',
  styleUrl: './event-page.css',
})
export class EventPage implements OnInit {
  eventService = inject(EventService);
  authService = inject(Auth);

  // ngModel változóját csak így lehet hozzákötni egy signalhoz
  private _selectedCategories = signal<CategoryOption[]>([]);
  get selectedCategories(): CategoryOption[] {
	return this._selectedCategories();
  }
  set selectedCategories(val: CategoryOption[]) {
	this._selectedCategories.set(val);
  }

  filteredEvents = computed<CampusEvent[]>(() => {
    const events = this.eventService.eventsList().filter(e => new Date(e.startsAt) > new Date()); // csak a jövőbeli események;
    const selected = this._selectedCategories();

    if (!selected.length) return events; // szűrés nélkül
    
	const names = new Set(selected.map(c => c.name));
	return events.filter(e => names.has(e.category)); // egyébként szűrt lista
  });

  ngOnInit(): void {
    this.eventService.getAllEvents().subscribe(() => {
      this.preselectUserInterests();
    });
  }

  // count autómatikusan frissül és rendezve lesz
  categoryOptions = computed<CategoryOption[]>(() => {
    const countMap = new Map<string, number>();
    for (const event of this.eventService.eventsList()) {
      if (event.category) {
        countMap.set(event.category, (countMap.get(event.category) ?? 0) + 1);
      }
    }
    return Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count })) // CategoryOption-re alakítás
      .sort((a, b) => a.name.localeCompare(b.name)); // abc sorrend
  });

  private preselectUserInterests(): void {
    const user = this.authService.currentUser();
    if (!user?.interests) return;

    let userInterests: string[] = [];
    try {
      userInterests = typeof user.interests === 'string'
        ? JSON.parse(user.interests)
        : user.interests;
    } catch { return; }

    const preSelected = this.categoryOptions().filter(o => userInterests.includes(o.name));
    this._selectedCategories.set(preSelected);
  }

  clearFilters(): void {
    this._selectedCategories.set([]);
  }

  get hasActiveFilters(): boolean {
    return this._selectedCategories().length > 0;
  }


  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }
}
