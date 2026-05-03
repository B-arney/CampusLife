import { Component, OnInit, signal, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, News } from '../../services/news.service';

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
  
  // Track which news item is currently visible in the widget
  currentIndex = signal(0);

  // Helper to get only the current item for the widget view
  currentItem = computed(() => this.newsItems()[this.currentIndex()]);

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    const fetch$ = this.viewMode() === 'latest' 
      ? this.newsService.getLatestNews() 
      : this.newsService.getAllNews();

    fetch$.subscribe(data => this.newsItems.set(data));
  }

  nextItem() {
    if (this.currentIndex() < this.newsItems().length - 1) {
      this.currentIndex.update(val => val + 1);
    } else {
      this.currentIndex.set(0); // Loop back to start
    }
  }

  prevItem() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(val => val - 1);
    } else {
      this.currentIndex.set(this.newsItems().length - 1); // Loop to end
    }
  }
}