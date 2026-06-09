import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../core/supabase.service';
import { AuthService } from '../../core/auth.service';
import type { Book } from '../../core/books.service';
import type { QuizAnswers, ScoredBook } from './quiz.service';

type PickSnapshot = {
  title: string;
  author: string | null;
  isbn: string | null;
  score: number;
};

type BookSnapshot = {
  title: string;
  author: string | null;
  isbn: string | null;
};

// Persists recommendation sessions and the user's final selection against
// their anonymous session. Every method is best-effort — tracking must never
// interrupt the reading flow, so failures resolve quietly.
@Injectable({ providedIn: 'root' })
export class RecommendationsService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  /** Records the books shown for a set of quiz answers. Returns the row id, or null on failure. */
  async record(answers: QuizAnswers, picks: ScoredBook[]): Promise<string | null> {
    const userId = await this.auth.ensureSession();
    if (!userId) return null;

    const snapshot: PickSnapshot[] = picks.map(p => ({
      title: p.book.title,
      author: p.book.author,
      isbn: p.book.isbn,
      score: p.score,
    }));

    try {
      const { data, error } = await this.supabase.client
        .from('recommendations')
        .insert({ user_id: userId, quiz_answers: answers, picks: snapshot })
        .select('id')
        .single();

      if (error || !data) return null;
      return data.id as string;
    } catch {
      return null;
    }
  }

  /** Marks which book the user accepted for a previously recorded recommendation. */
  async markSelected(id: string, book: Book): Promise<void> {
    const selected: BookSnapshot = { title: book.title, author: book.author, isbn: book.isbn };
    try {
      await this.supabase.client
        .from('recommendations')
        .update({ accepted: true, selected_book: selected })
        .eq('id', id);
    } catch {
      // Best-effort — a missed selection write must not surface to the user.
    }
  }
}
