import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Login } from './auth/components/login/login';
import { Registration } from './auth/components/registration/registration';
import { ForgotPassword } from './auth/components/forgot-password/forgot-password';
import { Profile } from './auth/components/profile/profile';
import { authGuard } from './auth/guards/auth-guard';
import { EditEvent } from './event/components/edit-event/edit-event';
import { EventDetail } from './event/components/event-detail/event-detail';
import { EventPage } from './event/components/event-page/event-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'landing', component: Landing },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'events', component: EventPage },
  { path: 'events2', redirectTo: 'events', pathMatch: 'full' },
  { path: 'events/new', component: EditEvent },
  { path: 'events/:id/edit', component: EditEvent },
  { path: 'events/:id', component: EventDetail },
];
////
