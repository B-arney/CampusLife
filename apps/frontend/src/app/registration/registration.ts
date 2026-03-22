import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registration',
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, ReactiveFormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './registration.html',
  styleUrls: ['./registration.css'],
  providers: [MessageService]
})
export class Registration {
  private http = inject(HttpClient);
  messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);
  form: FormGroup;
  formSubmitted: boolean = false;

  constructor() {
    this.form = this.formBuilder.group({
      username: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
      password2: ["", [Validators.required]]
    });
  }

 onSubmit() {
  this.formSubmitted = true;

  if (!this.form.valid) return;

  const payload = {
    username: this.form.value.username,
    email: this.form.value.email,
    password: this.form.value.password,
    passwordConfirm: this.form.value.password2
  };

  this.http.post('/api/register', payload).subscribe({
    next: (res: any) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Siker',
        detail: res.message || 'Regisztráció elküldve'
      });
      this.form.reset();
      this.formSubmitted = false;
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Hiba',
        detail: err.error?.error || err.error?.message || 'Regisztráció sikertelen'
      });
    }
  });
}

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}