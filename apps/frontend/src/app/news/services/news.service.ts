import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface News {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  // mock data 
  private mockNews: News[] = [
    { id: 1, title: 'Campus Concert', content: 'Join us tonight at 8 PM!', createdAt: '2026-05-01T10:00:00Z' },
    { id: 2, title: 'Library Hours', content: 'Extended for finals week.', createdAt: '2026-05-02T08:30:00Z' },
    { id: 3, title: 'New Gym Equipment', content: 'Fresh weights arrived today.', createdAt: '2026-05-03T12:00:00Z' },
    { id: 4, title: 'Old News', content: 'This should be hidden from the widget.', createdAt: '2026-04-20T09:00:00Z' },
    { id: 5, title: 'test5', content: 'data y no show', createdAt: '2026-04-20T09:00:00Z' }
  ];

  constructor() { }

  // latest 3 news for landing page
  getLatestNews(): Observable<News[]> {
    const latest = [...this.mockNews]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    return of(latest).pipe(delay(500)); // Simulates network delay
  }
  // all news for news page
  getAllNews(): Observable<News[]> {
    return of(this.mockNews).pipe(delay(500));
  }

  // admin delete
  deleteNews(id: number): Observable<boolean> {
    console.log(`Simulating deletion of news ID: ${id}`);
    return of(true);
  }
}