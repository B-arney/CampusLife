import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { UserService } from '../../services/user-service';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MultiSelectModule, InputTextModule, ButtonModule, MessageModule, ToastModule],
  providers: [MessageService],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(Auth);

  form: FormGroup;
  isLoading: boolean = false;
  selectedFile: File | null = null;
  currentProfilePicture: string | null = null;

  interestOptions = [
    { label: 'Academic', value: 'Academic' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Music', value: 'Music' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Social', value: 'Social' }
  ];

  constructor() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      major: [''],
      interests: [[]]
    });
  }

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        let interests = [];
        if (user.interests) {
          try {
            interests = JSON.parse(user.interests);
          } catch (e) {
            interests = [];
          }
        }
        
        this.currentProfilePicture = user.profilePicture;

        this.form.patchValue({
          username: user.username,
          email: user.email,
          major: user.major,
          interests: interests
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load profile data' });
		console.error('Error loading profile:', err);
      }
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Only JPEG, PNG and WebP image is allowed.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'The image size must not exceed 5 MB.' });
        return;
      }
      this.selectedFile = file;
    }
  }

  onSubmit() {
    this.isLoading = true;

    if (this.form.valid) {
      const formData = new FormData();
      formData.append('username', this.form.get('username')?.value);
      formData.append('major', this.form.get('major')?.value || '');
      formData.append('interests', JSON.stringify(this.form.get('interests')?.value));

      if (this.selectedFile) {
        formData.append('profilePicture', this.selectedFile);
      }

      this.userService.updateProfile(formData).subscribe({
        next: (user) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated!' });
          this.currentProfilePicture = user.profilePicture;
          this.selectedFile = null;
          this.isLoading = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Could not save' });
          this.isLoading = false;
        }
      });
    }
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched || this.isLoading);
  }
}
