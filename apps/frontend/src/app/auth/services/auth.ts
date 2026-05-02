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
	currentUser = signal<User | null>(this.getUserFromStorage());

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
					this.getLoggedInUser().subscribe(); // frissíti a currentUser-t a backendről, hogy minden adat meglegyen
				}
			})
		);
	}

	logout(): void {
		this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
			next: () => this.clearSession(),
			error: () => this.clearSession()
		});
	}

	updateProfile(formData: FormData): Observable<User> {
		return this.http.put<User>(`${this.apiUrl}/profile`, formData).pipe(
			tap((res) => {
				this.currentUser.set(res);
				this.saveUserToStorage(res);
			})
		);
	}

	/**
	 * Get the user's JWT token if awailable to check if logged in status.
	 * @returns The user' JWT token
	 */
	getToken(): string | null {
		return localStorage.getItem('jwt_token');
	}

	private getLoggedInUser(): Observable<User> {
		return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
			tap((res) => {
				this.currentUser.set(res);
				this.saveUserToStorage(res);
			})
		);
	}

	private setToken(token: string): void {
		localStorage.setItem('jwt_token', token);
	}

	private clearSession(): void {
		localStorage.removeItem('jwt_token');
		this.isLoggedIn.set(false);
		this.currentUser.set(null);
		this.saveUserToStorage(null);
		this.router.navigate(['/login']);
	}

	private getUserFromStorage(): User | null {
		const stored = localStorage.getItem('current_user');
		try {
			return stored ? JSON.parse(stored) : null;
		} catch {
			return null;
		}
	}

	private saveUserToStorage(user: User | null): void {
		if (user) {
			localStorage.setItem('current_user', JSON.stringify(user));
		} else {
			localStorage.removeItem('current_user');
		}
	}

	me(): Observable<{ user: { id: number; username: string; email: string; displayName: string | null; isVerified: boolean } }> {
		return this.http.get<{ user: { id: number; username: string; email: string; displayName: string | null; isVerified: boolean } }>(
			`${this.apiUrl}/me`
		);
	}

}
