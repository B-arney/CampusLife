import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Registration } from './registration/registration';
import { ForgotPassword } from './forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword } // új route
];
