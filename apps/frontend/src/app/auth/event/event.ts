import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EventService } from './services/event.service'

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, TextareaModule, CommonModule, FormsModule, ToastModule],
  templateUrl: './event.html',
  styleUrls: ['./event.css'],
  providers: [MessageService]
})
export class EventComponent {

  eventForm: FormGroup;
  isSaving = false;
  private messageService = inject(MessageService);
  private eventService = inject(EventService);

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
    });
  }

  createEvent() {
    if (this.eventForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const payload = {
      ...this.eventForm.value,
      interests: this.interests
    };

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Event created',
          detail: 'Esemény létrehozva.',
          life: 3000
        });
        this.eventForm.reset();
        this.interests = [];
        this.newInterest = '';
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

        const errorMessage = err?.error?.error || 'Nem sikerült létrehozni az eseményt!.';
        this.messageService.add({
          severity: 'error',
          summary: 'Create failed',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  interests: string[] = [];
  newInterest: string = '';

  addInterest() {
    const value = this.newInterest.trim();

    if (value && !this.interests.includes(value)) {
      this.interests.push(value);
      this.newInterest = '';
    }
  }

  removeInterest(index: number) {
    this.interests.splice(index, 1);
  }
}