import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
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
  private authService = inject(Auth);

  form: FormGroup;
  isLoading: boolean = false;
  selectedFile: File | null = null;
  currentProfilePicture = signal<string | null>(null);
  removePicture: boolean = false; // backendnek jelzés, h törölni kell a profilképet

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
	const user = this.authService.currentUser()!;

	let interests: string | string[] = [];
	if (user.interests) {
		try {
			interests = typeof user.interests === 'string' ? JSON.parse(user.interests) : user.interests;
		} catch (e) {
			interests = [];
		}
	}
	
	this.currentProfilePicture.set(user.profilePicture || null);
	this.form.patchValue({
		username: user.username,
		email: user.email,
		major: user.major,
		interests: interests
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

	  // kiválasztott kép előnézete
	  const reader = new FileReader();
      reader.onload = (event: any) => {
		this.currentProfilePicture.set(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePicture() {
	this.currentProfilePicture.set(null);
	this.selectedFile = null;	// ha új képet válaztottál, de meggondoltad magad
	this.removePicture = true;
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
		this.removePicture = false;
      } else if (this.removePicture) {
		formData.append('removeProfilePicture', 'true');
	  }

      this.authService.updateProfile(formData).subscribe({
        next: (user) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated!' });
          this.currentProfilePicture.set(user.profilePicture ?? null);
          this.selectedFile = null;
          this.isLoading = false;
		  this.removePicture = false;
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
