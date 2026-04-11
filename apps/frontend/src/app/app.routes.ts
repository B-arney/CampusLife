import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registration } from './auth/registration/registration';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Landing } from './auth/landing/landing';
import { EventComponent } from './auth/event/event';
import { EventDetailComponent } from './auth/event-detail/event-detail';
import { Profile } from './auth/profile/profile';
import { authGuard } from './auth/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'landing', component: Landing },
  { path: 'events', component: EventComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
];
