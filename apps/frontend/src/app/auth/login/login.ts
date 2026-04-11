import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Auth } from '../services/auth';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, ReactiveFormsModule, RouterLink, NgOptimizedImage, PasswordModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  providers: [MessageService]
})
export class Login implements OnInit {
  messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  form: FormGroup;
  isLoading: boolean = false;

  constructor() {
    this.form = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['verified'] === 'true') { // /login?verified=true
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Activation successful', 
          detail: 'You have successfully verified your email address! You can now log in.', 
          life: 3000 
        });
        
        // update URL to not get the toast message every time
        this.router.navigate([], { replaceUrl: true });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Login successful', detail: 'Welcome back!', life: 3000 });
        this.router.navigate(['/landing']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.error || 'Error during login.';
        this.messageService.add({ severity: 'error', summary: 'Login failed', detail: errorMessage, life: 5000 });
      }
    });
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched || this.isLoading);
  }
}