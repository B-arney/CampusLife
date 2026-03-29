import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registration } from './auth/registration/registration';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import {Landing} from './auth/landing/landing';
import {EventComponent } from './auth/event/event';



export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword }, // új route
  { path: 'landing', component: Landing },
  { path: 'events', component: EventComponent }
];
