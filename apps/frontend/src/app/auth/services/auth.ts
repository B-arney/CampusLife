import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RegisterRequest, LoginRequest, AuthResponse } from '../interfaces/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; 

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          this.setToken(response.token);
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
      next: () => {
        localStorage.removeItem('jwt_token');
      },
      error: () => {
        localStorage.removeItem('jwt_token');
      }
    });
  }


   me(): Observable<{ user: { id: number; username: string; email: string; displayName: string | null; isVerified: boolean } }> {
    return this.http.get<{ user: { id: number; username: string; email: string; displayName: string | null; isVerified: boolean } }>(
      `${this.apiUrl}/me`
    );
  }
  
}
