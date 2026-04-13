import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Auth } from '../../services/auth';
import { passwordMatchValidator, passwordStrengthValidator } from '../../../shared/validators/password.validator';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-registration',
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, ReactiveFormsModule, RouterLink, NgOptimizedImage, PasswordModule],
  templateUrl: './registration.html',
  styleUrls: ['./registration.css'],
  providers: [MessageService]
})
export class Registration {
  messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);

  form: FormGroup;
  isLoading: boolean = false;

  constructor() {
    this.form = this.formBuilder.group({
      username: ["", [Validators.required, Validators.minLength(3)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, passwordStrengthValidator()]],
      passwordConfirm: ["", [Validators.required]]
    },
    {
      validators: passwordMatchValidator('password', 'passwordConfirm')
    });
  }

  onSubmit() {
    this.isLoading = true;

    if (this.form.valid) {
      this.authService.register(this.form.value).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Registration successfu', detail: response.message || 'Please, confirm your email!', life: 3000 });
          this.form.reset();
          this.isLoading = false;
        },
        error: (err) => {
          const errorMessage = err.error?.error || 'An unexpected error occurred while communicating with the server.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched || this.isLoading);
  }

  hasPasswordMismatch(): boolean {
    const hasError = this.form.hasError('passwordMismatch');
    const isTouchedOrSubmitted = this.form.get('passwordConfirm')?.touched || this.isLoading;

    return hasError && isTouchedOrSubmitted;
  }

  get passwordStrengthErrors() {
    return this.form.get('password')?.errors?.['passwordStrength'];
  }
}