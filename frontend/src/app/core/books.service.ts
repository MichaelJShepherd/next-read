import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  page_count: number | null;
  avg_rating: number | null;
  genres: string[] | null;
  synopsis: string | null;
}

export type NewBook = Omit<Book, 'id' | 'user_id'>;

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly client = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);

  async getAll(): Promise<Book[]> {
    const { data, error } = await this.client
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Book[];
  }

  async saveMany(books: NewBook[]): Promise<void> {
    const userId = this.auth.userId;
    if (!userId) throw new Error('Not authenticated');
    const rows = books.map(b => ({ ...b, user_id: userId }));
    const { error } = await this.client.from('books').insert(rows);
    if (error) throw error;
  }

  async clearAll(): Promise<void> {
    const userId = this.auth.userId;
    if (!userId) throw new Error('Not authenticated');
    const { error } = await this.client.from('books').delete().eq('user_id', userId);
    if (error) throw error;
  }
}
