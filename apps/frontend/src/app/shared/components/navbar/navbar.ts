import { Component, inject } from '@angular/core';
import { Auth } from '../../../auth/services/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
	authService = inject(Auth);
}
