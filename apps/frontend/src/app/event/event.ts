import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, TextareaModule, CommonModule, FormsModule],
  templateUrl: './event.html',
  styleUrls: ['./event.css']
})
export class EventComponent {

  eventForm: FormGroup;
  events: any[] = [];

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
    });
  }

  createEvent() {
    if (this.eventForm.valid) {
      this.events.push(this.eventForm.value);
      this.eventForm.reset();
    }
  }

  interests: string[] = ['Interest', 'Interest'];
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