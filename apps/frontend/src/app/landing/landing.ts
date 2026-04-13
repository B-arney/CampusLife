import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../auth/services/auth';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing {
  private readonly authService = inject(Auth);
  currentNewsIndex: number = 0;
  totalNews: number = 3;

  // Jobbra nyíl
  nextNews() {
    this.currentNewsIndex = (this.currentNewsIndex + 1) % this.totalNews;
  }

  // Balra nyíl
  prevNews() {
    this.currentNewsIndex = (this.currentNewsIndex - 1 + this.totalNews) % this.totalNews;
  }

  // Pöttyre kattintás
  setNews(index: number) {
    this.currentNewsIndex = index;
  }

  logout(): void {
    this.authService.logout();
  }
}