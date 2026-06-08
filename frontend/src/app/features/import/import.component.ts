import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BooksService, NewBook } from '../../core/books.service';
import { ImportService, ScrapedBook } from './import.service';

type Status = 'idle' | 'loading' | 'confirm' | 'saving' | 'error';

@Component({
  selector: 'app-import',
  imports: [FormsModule],
  templateUrl: './import.component.html',
})
export class ImportComponent {
  private readonly importService = inject(ImportService);
  private readonly booksService = inject(BooksService);
  private readonly router = inject(Router);

  protected url = '';
  protected readonly status = signal<Status>('idle');
  protected readonly books = signal<ScrapedBook[]>([]);
  protected readonly errorMsg = signal('');

  protected async submit(): Promise<void> {
    const trimmed = this.url.trim();
    if (!trimmed) return;
    this.status.set('loading');
    this.errorMsg.set('');
    try {
      const scraped = await this.importService.importFromUrl(trimmed);
      this.books.set(scraped);
      this.status.set('confirm');
    } catch (e) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      this.status.set('error');
    }
  }

  protected async confirm(): Promise<void> {
    this.status.set('saving');
    try {
      await this.booksService.clearAll();
      const newBooks: NewBook[] = this.books().map(b => ({
        title: b.title,
        author: b.author,
        cover_url: b.cover_url,
        page_count: b.page_count,
        avg_rating: b.avg_rating,
        genres: b.genres,
        synopsis: null,
      }));
      await this.booksService.saveMany(newBooks);
      this.router.navigate(['/quiz']);
    } catch (e) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Could not save books. Please try again.');
      this.status.set('error');
    }
  }

  protected retry(): void {
    this.status.set('idle');
  }

  protected goBack(): void {
    this.router.navigate(['/']);
  }
}
