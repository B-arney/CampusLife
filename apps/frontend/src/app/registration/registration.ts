import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registration.html',
  styleUrls: ['./registration.css']
})
export class Registration {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  registerAction() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Username:', this.username);
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    alert('Registration successful (frontend only)');
  }
}