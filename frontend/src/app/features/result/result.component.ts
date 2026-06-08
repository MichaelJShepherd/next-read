import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService, ScoredBook } from '../quiz/quiz.service';
import { Book } from '../../core/books.service';
import { SupabaseService } from '../../core/supabase.service';
import { AuthService } from '../../core/auth.service';

type Phase = 'spinning' | 'reveal';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {
  private readonly quiz = inject(QuizService);
  private readonly router = inject(Router);
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  private remainingPicks: ScoredBook[] = [];
  protected readonly phase = signal<Phase>('spinning');
  protected readonly currentBook = signal<Book | null>(null);
  protected readonly accepted = signal(false);
  protected readonly spinIndex = signal(0);
  protected readonly allPreviews = signal<Book[]>([]);

  protected readonly hasMore = computed(() => this.remainingPicks.length > 1);

  ngOnInit(): void {
    const picks = this.quiz.picks();
    if (!picks.length) {
      this.router.navigate(['/']);
      return;
    }
    this.remainingPicks = [...picks];
    this.allPreviews.set(picks.map(p => p.book));
    this.startSpin();
  }

  private startSpin(): void {
    this.phase.set('spinning');
    const duration = 2200;
    const interval = setInterval(() => {
      this.spinIndex.update(i => (i + 1) % this.allPreviews().length);
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      const winner = this.remainingPicks[0].book;
      this.currentBook.set(winner);
      this.phase.set('reveal');
    }, duration);
  }

  protected respin(): void {
    if (this.remainingPicks.length > 1) {
      this.remainingPicks = this.remainingPicks.slice(1);
    }
    this.accepted.set(false);
    this.startSpin();
  }

  protected async accept(): Promise<void> {
    const book = this.currentBook();
    if (!book) return;
    const userId = this.auth.userId;
    if (userId) {
      await this.supabase.client.from('recommendations').upsert({
        user_id: userId,
        book_id: book.id,
        score: this.remainingPicks[0]?.score ?? 0,
      });
    }
    this.accepted.set(true);
  }

  protected restart(): void {
    this.router.navigate(['/quiz']);
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
