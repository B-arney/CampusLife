import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registration } from './auth/registration/registration';
import { ForgotPassword } from './auth/forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword } // új route
];
