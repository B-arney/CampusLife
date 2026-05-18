import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event-service';
import { CampusEvent, EventReminder } from '../../interfaces/event';
import { BehaviorSubject, finalize, firstValueFrom, map, Observable } from 'rxjs';
import { Auth } from '../../../auth/services/auth';
import { FormsModule } from '@angular/forms';
import { BrowserNotificationService } from '../../../shared/services/browser-notification.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, AsyncPipe, FormsModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly browserNotificationService = inject(BrowserNotificationService);
  readonly auth = inject(Auth);

  private readonly eventSubject = new BehaviorSubject<CampusEvent | undefined>(undefined);
  selectedEvent$: Observable<CampusEvent | undefined> = this.eventSubject.asObservable();

  private readonly remindersSubject = new BehaviorSubject<EventReminder[]>([]);
  reminders$: Observable<EventReminder[]> = this.remindersSubject.asObservable();

  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$: Observable<boolean> = this.loadingSubject.asObservable();
  isDeleting = false;
  isLoadingReminders = false;
  isAddingReminder = false;
  deletingReminderId: number | null = null;
  reminderMessage: string | null = null;
  selectedReminderOffsetMinutes = 1440;

  readonly reminderOptions = [
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 60 * 24 },
    { label: '3 days before', value: 60 * 24 * 3 },
  ];

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
        this.loadReminders(event.id);
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.eventSubject.next(undefined);
        this.remindersSubject.next([]);
      }
    });
  }

  loadReminders(eventId: number): void {
    if (!this.auth.getToken()) {
      this.remindersSubject.next([]);
      return;
    }

    this.isLoadingReminders = true;
    this.eventService.getEventReminders(eventId).pipe(
      finalize(() => this.isLoadingReminders = false)
    ).subscribe({
      next: (reminders) => {
        this.remindersSubject.next(reminders);
      },
      error: (err) => {
        console.error('Failed to load reminders', err);
        this.reminderMessage = err?.error?.error || 'Failed to load reminders.';
        this.remindersSubject.next([]);
      }
    });
  }

  async onAddReminder(): Promise<void> {
    const event = this.eventSubject.value;
    if (!event || this.isAddingReminder) return;

    if (!this.auth.getToken()) {
      this.reminderMessage = 'Sign in to save reminders.';
      return;
    }

    const reminderExists = this.remindersSubject.value.some((reminder) => reminder.offsetMinutes === this.selectedReminderOffsetMinutes);
    if (reminderExists) {
      this.reminderMessage = 'That reminder already exists for this event.';
      return;
    }

    this.isAddingReminder = true;
    this.reminderMessage = null;

    try {
      const permissionGranted = await this.browserNotificationService.ensureNotificationPermission();
      if (!permissionGranted) {
        this.reminderMessage = 'Please allow browser notifications to save reminders.';
        return;
      }

      const reminder = await firstValueFrom(this.eventService.addEventReminder(event.id, this.selectedReminderOffsetMinutes));
      this.remindersSubject.next([...this.remindersSubject.value, reminder].sort((a, b) => b.offsetMinutes - a.offsetMinutes));
      this.reminderMessage = 'Reminder saved.';

      void this.browserNotificationService.ensurePushSubscription().catch((err) => {
        console.error('Background push subscription setup failed', err);
      });
    } catch (err: any) {
      console.error('Add reminder failed', err);
      this.reminderMessage = err?.error?.error || 'Failed to save reminder.';
    } finally {
      this.isAddingReminder = false;
    }
  }

  onDeleteReminder(reminderId: number): void {
    const event = this.eventSubject.value;
    if (!event || this.deletingReminderId !== null) return;

    this.deletingReminderId = reminderId;
    this.reminderMessage = null;

    this.eventService.deleteEventReminder(event.id, reminderId).subscribe({
      next: () => {
        this.remindersSubject.next(this.remindersSubject.value.filter((reminder) => reminder.id !== reminderId));
        this.deletingReminderId = null;
        this.reminderMessage = 'Reminder removed.';
      },
      error: (err) => {
        console.error('Delete reminder failed', err);
        this.deletingReminderId = null;
        this.reminderMessage = err?.error?.error || 'Failed to remove reminder.';
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

  onCancelRsvp(): void {
    const event = this.eventSubject.value;
    if (!event) return;

    this.eventService.cancelRsvp(event.id).subscribe({
      next: () => {
        this.loadEvent(event.id);
      },
      error: (err) => {
        console.error('Cancel RSVP failed', err);
        alert('Hiba történt a jelentkezés lemondásakor');
      }
    });
  }

  onDeleteEvent(): void {
    const event = this.eventSubject.value;

    if (!event || !this.isCreator(event) || this.isDeleting) {
      return;
    }

    if (!globalThis.confirm('Delete this event? This action cannot be undone.')) {
      return;
    }

    this.isDeleting = true;
    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.isDeleting = false;
        void this.router.navigate(['/events/my']);
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Delete event failed', err);
        alert(err?.error?.error || 'Failed to delete event');
      }
    });
  }

  isCreator(event: CampusEvent): boolean {
    const currentUserId = Number(this.auth.currentUser()?.id);
    return Number.isInteger(currentUserId) && event.hostId === currentUserId;
  }

  formatReminderOffset(offsetMinutes: number): string {
    if (offsetMinutes % (60 * 24) === 0) {
      const days = offsetMinutes / (60 * 24);
      return `${days} day${days === 1 ? '' : 's'} before`;
    }

    if (offsetMinutes % 60 === 0) {
      const hours = offsetMinutes / 60;
      return `${hours} hour${hours === 1 ? '' : 's'} before`;
    }

    return `${offsetMinutes} minutes before`;
  }

  formatReminderTime(startsAt: string, offsetMinutes: number): string {
    const reminderTime = new Date(new Date(startsAt).getTime() - (offsetMinutes * 60 * 1000));
    return reminderTime.toLocaleString();
  }
}
