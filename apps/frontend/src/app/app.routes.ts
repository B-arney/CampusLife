import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registration } from './auth/registration/registration';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Landing } from './landing/landing';
import { EventComponent } from './event/event';
import { EventDetailComponent } from './auth/event-detail/event-detail';
import { Profile } from './auth/profile/profile';
import { authGuard } from './auth/guards/auth-guard';
import { EventListComponent } from './auth/event/event-list/event-list';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'landing', component: Landing },
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventComponent },
  { path: 'events/:id/edit', component: EventComponent },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
];
