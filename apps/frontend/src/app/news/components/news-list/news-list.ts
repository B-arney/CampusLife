import { Component, OnInit, signal, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, News } from '../../services/news.service';
import { Auth } from '../../../auth/services/auth';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-list.html',
  styleUrl: './news-list.css'
})

export class NewsList implements OnInit {
  viewMode = input<'latest' | 'all'>('all'); 
  newsItems = signal<News[]>([]);
  
  // widget trackin
  currentIndex = signal(0);

  //only the current item for the widget view
  currentItem = computed(() => this.newsItems()[this.currentIndex()]);

  //constructor(private newsService: NewsService) {}

  showCreateModal = signal(false);
  createTitle = signal('');
  createContent = signal('');
  createExpiresAt = signal('');
  createError = signal<string | null>(null);
  isSaving = signal(false);

  isAdmin = computed(() => !!this.auth.currentUser()?.isAdmin);

  constructor(private newsService: NewsService, private auth: Auth) {}

  ngOnInit(): void {
    const fetch$ = this.viewMode() === 'latest' 
      ? this.newsService.getLatestNews() 
      : this.newsService.getAllNews();

    fetch$.subscribe(data => this.newsItems.set(data));
  }


   openCreate() {
    this.createError.set(null);
    this.createTitle.set('');
    this.createContent.set('');
    this.createExpiresAt.set('');
    this.showCreateModal.set(true);
  }

  closeCreate() {
    this.showCreateModal.set(false);
  }

  saveCreate() {
    if (!this.isAdmin()) return;
    this.createError.set(null);

    const title = this.createTitle().trim();
    const content = this.createContent().trim();
    const expiresAtLocal = this.createExpiresAt().trim();
    if (!title || !content || !expiresAtLocal) {
      this.createError.set('Please fill title, content and expiration date.');
      return;
    }

    // datetime-local is local time without timezone; convert to ISO
    const expiresIso = new Date(expiresAtLocal).toISOString();

    this.isSaving.set(true);
    this.newsService.createNews({ title, content, expiresAt: expiresIso }).subscribe({
      next: (created) => {
        this.newsItems.update((items) => [created, ...items]);
        this.showCreateModal.set(false);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.isSaving.set(false);
        const message =
          err?.status === 403 ? 'Admin access required.' :
          err?.error?.error ? String(err.error.error) :
          'Failed to create news.';
        this.createError.set(message);
      }
    });
  }
  
  
  nextItem() {
    if (this.currentIndex() < this.newsItems().length - 1) {
      this.currentIndex.update(val => val + 1);
    } else {
      this.currentIndex.set(0);
    }
  }

  prevItem() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(val => val - 1);
    } else {
      this.currentIndex.set(this.newsItems().length - 1);
    }
  }
}