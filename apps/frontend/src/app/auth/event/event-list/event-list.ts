import { ChangeDetectorRef } from '@angular/core';

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { EventService, EventSummary } from '../services/event.service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ToastModule],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css'],
  providers: [MessageService]
})
export class EventListComponent implements OnInit {
  private eventService = inject(EventService);
  private auth = inject(Auth);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  events: EventSummary[] = [];
  loading = true;
  currentUserId: number | null = null;

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (token) {
      this.auth.me().subscribe({
        next: (res) => {
          this.currentUserId = res.user?.id ?? null;
          this.cdr.detectChanges();
        },
        error: () => {
          this.currentUserId = null;
        }
      });
    }

    this.eventService.listEvents().subscribe({
      next: (res) => {
        console.log("Data received:", res);
        this.events = res.events;
        this.loading = false;

        this.cdr.detectChanges();

      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load events',
          detail: err?.error?.error || 'Please try again later.',
          life: 5000
        });
      }
    });
  }

  isHost(event: EventSummary): boolean {
    return this.currentUserId != null && event.hostId === this.currentUserId;
  }

  formatDate(dateStr: string | Date): string {
  if (!dateStr) return 'No date';
  try {
    const d = new Date(dateStr);
    //readable format like "2026. 04. 12. 14:30"
    return d.toLocaleString(); 
  } catch (e) {
    return 'Invalid date';
  }
}
}
