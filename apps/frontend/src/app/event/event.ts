import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { CampusEvent, CreateEventRequest, Interest } from './interfaces/event';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, TextareaModule, CommonModule, FormsModule, DatePickerModule, MultiSelectModule],
  templateUrl: './event.html',
  styleUrls: ['./event.css']
})
export class EventComponent implements OnInit {

  events$: Observable<CampusEvent[]> | undefined;
  eventForm;

  interests: Interest[] = [];
  selectedInterests: Interest[] = [];
  ngOnInit() {
      this.interests = [
          { name: 'Programming', code: 'programming' },
          { name: 'Culture', code: 'culture' },
          { name: 'Shopping', code: 'shopping' },
          { name: 'Budapest', code: 'budapest' },
          { name: 'Night Life', code: 'nightLife' }
      ];
  }

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      selectedInterests: [[]]
    });
  }

  createEvent() {
    if (this.eventForm.valid) {
      // this.events.push(this.eventForm.value);
      this.eventForm.reset();
    }
  }
}
