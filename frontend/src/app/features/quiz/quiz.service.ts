import { inject, Injectable, signal } from '@angular/core';
import { Book, BooksService } from '../../core/books.service';

export type Mood = 'adventurous' | 'cozy' | 'emotional' | 'thrilling' | 'funny' | 'inspiring';
export type Commitment = 'short' | 'medium' | 'long' | 'any';

export interface QuizAnswers {
  moods: Mood[];
  commitment: Commitment;
  avoid: string[];
}

export interface ScoredBook {
  book: Book;
  score: number;
}

const MOOD_GENRES: Record<Mood, string[]> = {
  adventurous: ['adventure', 'fantasy', 'historical fiction', 'action', 'travel'],
  cozy: ['cozy', 'romance', 'contemporary fiction', 'slice of life', 'literary fiction'],
  emotional: ['literary fiction', 'contemporary fiction', 'romance', 'memoir', 'drama'],
  thrilling: ['thriller', 'mystery', 'horror', 'suspense', 'crime'],
  funny: ['humor', 'comedy', 'satire', 'contemporary fiction', 'comic'],
  inspiring: ['biography', 'memoir', 'self-help', 'historical fiction', 'inspirational'],
};

const PAGE_RANGES: Record<Commitment, [number, number] | null> = {
  short: [0, 299],
  medium: [300, 500],
  long: [501, Infinity],
  any: null,
};

function scoreBook(book: Book, answers: QuizAnswers): number {
  const genres = (book.genres ?? []).map(g => g.toLowerCase());
  let score = 0;

  for (const mood of answers.moods) {
    const related = MOOD_GENRES[mood];
    for (const g of genres) {
      if (related.some(r => g.includes(r) || r.includes(g))) score += 2;
    }
  }

  const range = PAGE_RANGES[answers.commitment];
  if (range && book.page_count !== null) {
    if (book.page_count >= range[0] && book.page_count <= range[1]) score += 3;
    else score -= 2;
  }

  for (const tag of answers.avoid) {
    if (genres.some(g => g.includes(tag.toLowerCase()))) score -= 999;
  }

  if ((book.avg_rating ?? 0) >= 4.0) score += 1;

  return score;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly booksService = inject(BooksService);

  readonly answers = signal<QuizAnswers | null>(null);
  readonly picks = signal<ScoredBook[]>([]);

  async computePicks(answers: QuizAnswers): Promise<ScoredBook[]> {
    this.answers.set(answers);
    const books = await this.booksService.getAll();
    const scored: ScoredBook[] = books
      .map(b => ({ book: b, score: scoreBook(b, answers) }))
      .filter(s => s.score > -900)
      .sort((a, b) => b.score - a.score);
    this.picks.set(scored);
    return scored;
  }
}
