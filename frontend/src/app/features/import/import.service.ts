import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../core/supabase.service';

export interface ScrapedBook {
  title: string;
  author: string | null;
  cover_url: string | null;
  page_count: number | null;
  avg_rating: number | null;
  genres: string[] | null;
  isbn: string | null;
}

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly client = inject(SupabaseService).client;

  async importFromUrl(profileUrl: string): Promise<ScrapedBook[]> {
    const { data, error } = await this.client.functions.invoke<{ books: ScrapedBook[] }>(
      'import-goodreads',
      { body: { profileUrl } },
    );
    if (error) throw new Error(error.message);
    return data?.books ?? [];
  }
}
