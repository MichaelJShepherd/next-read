import { inject, Injectable, signal } from '@angular/core';
import { Book, BooksService } from '../../core/books.service';

export type Mood =
  | 'adventurous'
  | 'cozy'
  | 'emotional'
  | 'thrilling'
  | 'funny'
  | 'inspiring'
  | 'romantic'
  | 'spicy'
  | 'nostalgic'
  | 'escapist'
  | 'dark'
  | 'curious';
export type Commitment = 'short' | 'medium' | 'long' | 'any';

export interface QuizAnswers {
  moods: Mood[];
  commitment: Commitment;
  avoid: string[];
}

export interface ScoredBook {
  book: Book;
  score: number;
  /** Human-readable reasons this book was recommended, in scoring order. */
  reasons: string[];
}

const MOOD_GENRES: Record<Mood, string[]> = {
  adventurous: ['adventure', 'fantasy', 'historical fiction', 'action', 'travel'],
  cozy: [
    'cozy',
    'romance',
    'contemporary fiction',
    'slice of life',
    'literary fiction',
    'found family',
  ],
  emotional: ['literary fiction', 'contemporary fiction', 'romance', 'memoir', 'drama'],
  thrilling: ['thriller', 'mystery', 'horror', 'suspense', 'crime'],
  funny: ['humor', 'comedy', 'satire', 'contemporary fiction', 'comic'],
  inspiring: ['biography', 'memoir', 'self-help', 'historical fiction', 'inspirational'],
  romantic: ['romance', 'romantic comedy', 'love story', 'chick lit', 'contemporary romance'],
  spicy: ['romance', 'erotica', 'romantasy', 'new adult', 'dark romance'],
  nostalgic: [
    'historical fiction',
    'historical romance',
    'classics',
    'history',
    'mythology',
    'retelling',
  ],
  escapist: [
    'fantasy',
    'science fiction',
    'sci-fi',
    'paranormal',
    'dystopia',
    'romantasy',
    'magical realism',
    'mythology',
    'post-apocalyptic',
    'time travel',
    'witches',
  ],
  dark: [
    'horror',
    'gothic',
    'dark fantasy',
    'dark romance',
    'true crime',
    'dystopia',
    'post-apocalyptic',
    'dark academia',
  ],
  curious: ['non-fiction', 'nonfiction', 'science', 'history', 'psychology', 'philosophy'],
};

const PAGE_RANGES: Record<Commitment, [number, number] | null> = {
  short: [0, 299],
  medium: [300, 500],
  long: [501, Infinity],
  any: null,
};

const COMMITMENT_REASONS: Record<Commitment, string | null> = {
  short: 'A quick read, like you asked for',
  medium: 'A substantial read, like you asked for',
  long: 'An epic, like you asked for',
  any: null,
};

function scoreBook(book: Book, answers: QuizAnswers): { score: number; reasons: string[] } {
  const genres = (book.genres ?? []).map((g) => g.toLowerCase());
  let score = 0;
  const reasons: string[] = [];

  for (const mood of answers.moods) {
    const related = MOOD_GENRES[mood];
    let matched = false;
    for (const g of genres) {
      if (related.some((r) => g.includes(r) || r.includes(g))) {
        score += 2;
        matched = true;
      }
    }
    if (matched) reasons.push(`Matches your ${mood} mood`);
  }

  const range = PAGE_RANGES[answers.commitment];
  if (range && book.page_count !== null) {
    if (book.page_count >= range[0] && book.page_count <= range[1]) {
      score += 3;
      const reason = COMMITMENT_REASONS[answers.commitment];
      if (reason) reasons.push(reason);
    } else {
      score -= 2;
    }
  }

  for (const tag of answers.avoid) {
    if (genres.some((g) => g.includes(tag.toLowerCase()))) score -= 999;
  }

  if ((book.avg_rating ?? 0) >= 4.0) {
    score += 1;
    reasons.push('Loved by readers');
  }

  return { score, reasons };
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly booksService = inject(BooksService);

  readonly answers = signal<QuizAnswers | null>(null);
  readonly picks = signal<ScoredBook[]>([]);
  /** Id of the persisted recommendation row, set once tracking resolves. */
  readonly recommendationId = signal<string | null>(null);

  async computePicks(answers: QuizAnswers): Promise<ScoredBook[]> {
    this.answers.set(answers);
    this.recommendationId.set(null);
    const books = await this.booksService.getAll();
    const scored: ScoredBook[] = books
      .map((b) => ({ book: b, ...scoreBook(b, answers) }))
      .filter((s) => s.score > -900)
      // Jitter near-ties so closely-scored books vary between runs.
      .map((s) => ({ ...s, sort: s.score + (Math.random() - 0.5) * 3 }))
      .sort((a, b) => b.sort - a.sort)
      .map(({ book, score, reasons }) => ({ book, score, reasons }));
    this.picks.set(scored);
    return scored;
  }
}
