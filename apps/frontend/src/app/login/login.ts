import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';

  loginAction() {
    console.log('Login clicked!');
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    alert(`Logged in as: ${this.email} (frontend only)`);
  }
}