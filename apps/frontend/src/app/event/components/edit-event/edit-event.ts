import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EventService } from '../../services/event-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../../auth/services/auth';
import { forkJoin } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';

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

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { invalidDate: true };
  }

  if (date.getTime() < Date.now()) {
    return { pastDate: true };
  }

  return null;
}

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    TextareaModule,
    CommonModule,
    FormsModule,
    ToastModule,
    RouterLink,
	MultiSelectModule
  ],
  providers: [MessageService],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.css',
})
export class EditEvent implements OnInit {
  isSaving = false;
  isLoading = false;
  eventId: number | null = null;
  imageError: string | null = null;
  imagePreviewUrl: string | null = null;
  selectedImageName = '';

  private messageService = inject(MessageService);
  private eventService = inject(EventService);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  interestOptions = [
    { label: 'Academic', value: 'Academic' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Music', value: 'Music' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Social', value: 'Social' },
    { label: '333', value: '333' },
    { label: '4444', value: '4444' }
  ];

  eventForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(250)]],
    date: ['', [Validators.required, futureDateValidator]],
    location: ['', Validators.required],
    category: ['', Validators.required],
	interests: [[]],
    imageUrl: ['']
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
        const ev = eventRes;


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
          date: toDatetimeLocalValue(ev.startsAt),
          location: ev.location,
          category: ev.category,
          imageUrl: ev.imageUrl || ''
        });
        this.interests = interestsFromApi(ev.interests);
        this.imagePreviewUrl = ev.imageUrl || null;
        this.selectedImageName = '';

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
    if (this.isSaving || this.isLoading) return;

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation error',
        detail: 'Please fix the highlighted fields.',
        life: 4000
      });
      return;
    }

    if (this.imageError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid image',
        detail: this.imageError,
        life: 4000
      });
      return;
    }

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
          this.imageError = null;
          this.imagePreviewUrl = null;
          this.selectedImageName = '';
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

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.imageError = null;
      this.selectedImageName = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Only .jpg, .png and .webp files are allowed.';
      this.selectedImageName = '';
      this.eventForm.patchValue({ imageUrl: '' });
      input.value = '';
      return;
    }

    const maxFileSizeBytes = 4 * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      this.imageError = 'Image is too large. Maximum allowed size is 4 MB.';
      this.selectedImageName = '';
      this.eventForm.patchValue({ imageUrl: '' });
      input.value = '';
      return;
    }

    this.imageError = null;
    this.selectedImageName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.eventForm.patchValue({ imageUrl: result });
      this.imagePreviewUrl = result || null;
    };
    reader.onerror = () => {
      this.imageError = 'Failed to read selected image.';
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageError = null;
    this.selectedImageName = '';
    this.imagePreviewUrl = null;
    this.eventForm.patchValue({ imageUrl: '' });
  }

  get descriptionLength(): number {
    const value = this.eventForm.get('description')?.value;
    return typeof value === 'string' ? value.length : 0;
  }

  fieldError(fieldName: string): string | null {
    const control = this.eventForm.get(fieldName);
    if (!control || !(control.touched || control.dirty) || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      if (fieldName === 'title') return 'Title is required';
      if (fieldName === 'description') return 'Description is required';
      if (fieldName === 'date') return 'Date and time is required';
      if (fieldName === 'location') return 'Location is required';
      if (fieldName === 'category') return 'Category is required';
    }

    if (control.errors['pastDate']) {
      return 'Event date must be in the future';
    }

    if (control.errors['maxlength']) {
      return 'Description must be at most 250 characters';
    }

    return 'Invalid value';
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
