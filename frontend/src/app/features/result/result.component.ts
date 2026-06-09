import { Component, inject, OnDestroy, OnInit, signal, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../quiz/quiz.service';
import { RecommendationsService } from '../quiz/recommendations.service';
import { Book } from '../../core/books.service';
import { SynopsisService, BookDetails } from '../../core/synopsis.service';

const MAX_PICKS = 5;

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit, OnDestroy {
  private readonly quiz = inject(QuizService);
  private readonly recommendations = inject(RecommendationsService);
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);
  private readonly synopsisService = inject(SynopsisService);

  protected readonly picks = signal<Book[]>([]);
  protected readonly selectedBook = signal<Book | null>(null);
  protected readonly acceptedBook = signal<Book | null>(null);

  private reasonsByBookId = new Map<string, string[]>();

  protected readonly detailsLoading = signal(false);
  protected readonly details = signal<BookDetails>({ synopsis: null, genres: null });

  ngOnInit(): void {
    const scored = this.quiz.picks();
    if (!scored.length) {
      this.router.navigate(['/']);
      return;
    }
    const top = scored.slice(0, MAX_PICKS);
    this.picks.set(top.map((p) => p.book));
    this.reasonsByBookId = new Map(top.map((p) => [p.book.id, p.reasons]));
  }

  protected reasonsFor(book: Book): string[] {
    return this.reasonsByBookId.get(book.id) ?? [];
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.selectedBook()) this.closeModal();
  }

  protected openModal(book: Book): void {
    this.selectedBook.set(book);
    this.details.set({ synopsis: null, genres: null });
    this.doc.body.style.overflow = 'hidden';
    this.loadDetails(book);
  }

  private async loadDetails(book: Book): Promise<void> {
    this.detailsLoading.set(true);
    try {
      const result = await this.synopsisService.fetchDetails(book.isbn, book.title, book.author);
      // Only apply if this book's modal is still open
      if (this.selectedBook()?.id === book.id) {
        this.details.set(result);
      }
    } finally {
      if (this.selectedBook()?.id === book.id) {
        this.detailsLoading.set(false);
      }
    }
  }

  protected closeModal(): void {
    this.selectedBook.set(null);
    this.unlockScroll();
  }

  protected accept(): void {
    const book = this.selectedBook();
    this.acceptedBook.set(book);

    const id = this.quiz.recommendationId();
    if (book && id) {
      // Best-effort selection tracking; never blocks the confirmation UI.
      void this.recommendations.markSelected(id, book);
    }

    this.closeModal();
  }

  protected starsOf(rating: number): string {
    const filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(Math.max(0, 5 - filled));
  }

  protected restart(): void {
    this.router.navigate(['/quiz']);
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }

  private unlockScroll(): void {
    this.doc.body.style.overflow = '';
  }
}
