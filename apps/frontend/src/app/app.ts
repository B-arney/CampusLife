import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './auth/services/auth';
import { Navbar } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  public authService = inject(Auth);
}
