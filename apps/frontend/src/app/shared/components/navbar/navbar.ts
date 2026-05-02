import { Component, inject } from '@angular/core';
import { Auth } from '../../../auth/services/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { buildInfo } from '../../../../build-info';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(Auth);
  isMenuOpen = false;

  readonly branch = buildInfo.branch;
  readonly hash = buildInfo.hash;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
