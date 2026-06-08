import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BooksService } from '../../core/books.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly books = inject(BooksService);

  protected readonly hasBooks = signal(false);
  protected readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const all = await this.books.getAll();
      this.hasBooks.set(all.length > 0);
    } finally {
      this.loading.set(false);
    }
  }

  protected goImport(): void {
    this.router.navigate(['/import']);
  }

  protected goQuiz(): void {
    this.router.navigate(['/quiz']);
  }
}
