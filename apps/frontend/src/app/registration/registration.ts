import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-registration',
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, ReactiveFormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './registration.html',
  styleUrls: ['./registration.css'],
  providers: [MessageService]
})
export class Registration {
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
    if (this.form.valid) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
      this.form.reset();
      this.formSubmitted = false;
    }
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}