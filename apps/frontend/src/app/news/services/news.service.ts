import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface News {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  expiresAt?: string | null;
  createdBy?: number;
  imageUrl?: string | null;
  creator?: {
    id: number;
    username: string;
    displayName?: string | null;
    profilePicture?: string | null;
  };
}


export interface CreateNewsRequest {
  title: string;
  content: string;
  expiresAt: string;
  imageUrl?: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/news`;

  // latest 3 news for landing page
  getLatestNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/latest`);
  }
  // all news for news page
  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(this.apiUrl);
  }

  
   createNews(payload: CreateNewsRequest): Observable<News> {
    return this.http.post<News>(this.apiUrl, payload);
  }

}