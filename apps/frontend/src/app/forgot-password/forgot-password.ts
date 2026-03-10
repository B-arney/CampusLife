import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  email: string = '';

  sendResetLink() {
    if (!this.email) {
      alert('Kérlek, add meg az email címed!');
      return;
    }
    alert(`Jelszó reset link elküldve erre az emailre: ${this.email} (frontend only)`);
    console.log('Password reset requested for:', this.email);
  }
}
