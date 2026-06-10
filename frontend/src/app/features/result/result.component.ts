import { Component, inject, OnDestroy, OnInit, signal, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../quiz/quiz.service';
import { RecommendationsService } from '../quiz/recommendations.service';
import { Book } from '../../core/books.service';
import { SynopsisService, BookDetails, EMPTY_DETAILS } from '../../core/synopsis.service';
import { buildSpinPlan, SpinStep } from './spin-plan';

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
  protected readonly details = signal<BookDetails>(EMPTY_DETAILS);

  protected readonly spinning = signal(false);
  protected readonly highlightIndex = signal<number | null>(null);
  protected readonly spunBook = signal<Book | null>(null);
  private spinTimer: ReturnType<typeof setTimeout> | null = null;

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
    if (this.spinTimer !== null) clearTimeout(this.spinTimer);
    this.unlockScroll();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.selectedBook()) this.closeModal();
  }

  protected openModal(book: Book): void {
    this.selectedBook.set(book);
    this.details.set(EMPTY_DETAILS);
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
    if (book) this.acceptBook(book);
    this.closeModal();
  }

  /** Lets the roulette spinner randomly land on one of the picks. */
  protected spin(): void {
    const books = this.picks();
    if (this.spinning() || books.length < 2) return;

    this.spunBook.set(null);
    const target = Math.floor(Math.random() * books.length);

    // Reduced motion: skip the roulette and reveal the result instantly.
    if (this.prefersReducedMotion()) {
      this.highlightIndex.set(target);
      this.spunBook.set(books[target]);
      return;
    }

    this.spinning.set(true);
    const plan = buildSpinPlan(books.length, target, this.highlightIndex() ?? 0);
    this.runSpinSteps(plan, 0, target);
  }

  private runSpinSteps(plan: SpinStep[], step: number, target: number): void {
    if (step >= plan.length) {
      this.spinning.set(false);
      this.spunBook.set(this.picks()[target] ?? null);
      return;
    }
    this.spinTimer = setTimeout(() => {
      this.highlightIndex.set(plan[step].index);
      this.runSpinSteps(plan, step + 1, target);
    }, plan[step].delay);
  }

  protected acceptSpun(): void {
    const book = this.spunBook();
    if (book) this.acceptBook(book);
  }

  private acceptBook(book: Book): void {
    this.acceptedBook.set(book);

    const id = this.quiz.recommendationId();
    if (id) {
      // Best-effort selection tracking; never blocks the confirmation UI.
      void this.recommendations.markSelected(id, book);
    }
  }

  private prefersReducedMotion(): boolean {
    return this.doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
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
