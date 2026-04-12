import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from './services/event.service';
import { Auth } from '../services/auth';

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function interestsFromApi(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    TextareaModule,
    CommonModule,
    FormsModule,
    ToastModule,
    RouterLink
  ],
  templateUrl: './event.html',
  styleUrls: ['./event.css'],
  providers: [MessageService]
})
export class EventComponent implements OnInit {
  isSaving = false;
  isLoading = false;
  eventId: number | null = null;

  private messageService = inject(MessageService);
  private eventService = inject(EventService);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr =inject(ChangeDetectorRef);

  eventForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    category: ['', Validators.required]
  });

  get isEditMode(): boolean {
    return this.eventId != null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }
    const id = Number(idParam);
    if (!Number.isInteger(id) || id < 1) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid event',
        detail: 'Bad link.',
        life: 4000
      });
      void this.router.navigate(['/events']);
      return;
    }
    this.loadEventForEdit(id);
  }

  interests: string[] = [];
  newInterest = '';

  private loadEventForEdit(id: number): void {
  const token = this.auth.getToken();
  if (!token) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Sign in required',
      detail: 'Log in to edit an event.',
      life: 4000
    });
    void this.router.navigate(['/login']);
    return;
  }

  this.isLoading = true;

  forkJoin({
    eventRes: this.eventService.getEvent(id),
    meRes: this.auth.me()
  }).subscribe({
    next: ({ eventRes, meRes }) => {
      const ev = eventRes.event;

      
      if (meRes.user.id !== ev.hostId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Not allowed',
          detail: 'You can only edit your own events.',
          life: 4000
        });
        void this.router.navigate(['/events']);
        return;
      }

      
      this.eventId = id;
      this.eventForm.patchValue({
        title: ev.title,
        description: ev.description,
        date: toDatetimeLocalValue(ev.startAt),
        location: ev.location,
        category: ev.category
      });
      this.interests = interestsFromApi(ev.interests);
      
      this.isLoading = false;
      
      
      this.cdr.detectChanges(); 
    },
    error: (err) => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Also trigger here to hide the loading text
      const msg = err?.error?.error || 'Could not load event.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 });
      void this.router.navigate(['/events']);
    }
  });
}

  saveEvent(): void {
    if (this.eventForm.invalid || this.isSaving || this.isLoading) return;

    this.isSaving = true;
    const payload = {
      ...this.eventForm.value,
      interests: this.interests
    };

    const req = this.isEditMode && this.eventId != null
      ? this.eventService.updateEvent(this.eventId, payload)
      : this.eventService.createEvent(payload);

    req.subscribe({
      next: () => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Event updated' : 'Event created',
          detail: this.isEditMode ? 'Changes saved.' : 'Your event has been published.',
          life: 3000
        });
        if (!this.isEditMode) {
          this.eventForm.reset();
          this.interests = [];
          this.newInterest = '';
        }
        void this.router.navigate(['/events']);
      },
      error: (err) => {
        this.isSaving = false;
        const apiErrors = err?.error?.errors;
        if (Array.isArray(apiErrors) && apiErrors.length) {
          for (const e of apiErrors) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validation error',
              detail: `${e.field || 'field'}: ${e.message || 'Invalid'}`,
              life: 5000
            });
          }
          return;
        }
        const errorMessage = err?.error?.error || 'Request failed.';
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  deleteEvent(): void {
    if (this.eventId == null || this.isSaving) return;
    if (!globalThis.confirm('Delete this event? This cannot be undone.')) return;

    this.isSaving = true;
    this.eventService.deleteEvent(this.eventId).subscribe({
      next: () => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'The event was removed.',
          life: 3000
        });
        void this.router.navigate(['/events']);
      },
      error: (err) => {
        this.isSaving = false;
        const errorMessage = err?.error?.error || 'Could not delete event.';
        this.messageService.add({
          severity: 'error',
          summary: 'Delete failed',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  addInterest(): void {
    const value = this.newInterest.trim();
    if (value && !this.interests.includes(value)) {
      this.interests.push(value);
      this.newInterest = '';
    }
  }

  removeInterest(index: number): void {
    this.interests.splice(index, 1);
  }
}
