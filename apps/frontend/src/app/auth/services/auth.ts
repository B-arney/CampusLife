import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RegisterRequest, LoginRequest, AuthResponse, User } from '../interfaces/auth';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  isLoggedIn = signal<boolean>(!!localStorage.getItem('jwt_token'));
  currentUser = signal<User | null>(null);

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          this.setToken(response.token);
          this.isLoggedIn.set(true);
          this.currentUser.set(response.user);
        }
      })
    );
  }

  private setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  /**
   * Get the user's JWT token if awailable to check if logged in status.
   * @returns The user' JWT token
   */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession(): void {
    localStorage.removeItem('jwt_token');
    this.isLoggedIn.set(false); 
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }


   me(): Observable<{ user: { id: number; username: string; email: string; displayName: string | null; isVerified: boolean } }> {
    return this.http.get<{ user: { id: number; username: string; email: string; displayName: string | null; isVerified: boolean } }>(
      `${this.apiUrl}/me`
    );
  }
  
}
