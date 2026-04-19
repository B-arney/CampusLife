import { Component, inject } from '@angular/core';
import { Auth} from '../../../auth/services/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
	authService = inject(Auth);
  isMenuOpen = false;

  constructor(public authService: AuthService) {} // Feltételezem, a logout miatt ez itt van

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
}
