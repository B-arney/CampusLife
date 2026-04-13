import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Login } from './auth/components/login/login';
import { Registration } from './auth/components/registration/registration';
import { ForgotPassword } from './auth/components/forgot-password/forgot-password';
import { Profile } from './auth/components/profile/profile';
import { authGuard } from './auth/guards/auth-guard';
import { EventPage } from './event/components/event-page/event-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'landing', component: Landing },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'events', component: EventPage },
];
