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
import { MyEvents } from './event/components/my-events/my-events';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'landing', component: Landing, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'events', component: EventPage },
  { path: 'events/new', component: EditEvent, canActivate: [authGuard] },
  { path: 'events/my', component: MyEvents, canActivate: [authGuard] },
  { path: 'events/:id', component: EventDetail },
  { path: 'events/:id/edit', component: EditEvent, canActivate: [authGuard] },
];
////
