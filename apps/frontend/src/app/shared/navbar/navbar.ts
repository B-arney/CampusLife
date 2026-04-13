import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, DrawerModule, ButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(Auth);

  visible: boolean = false;
}
