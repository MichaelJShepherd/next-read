import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api-client.service';
import { NewBook } from '../../core/books.service';

/** Book shape returned by the import-goodreads edge function — a book before it has a synopsis. */
export type ScrapedBook = Omit<NewBook, 'synopsis'>;

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly api = inject(ApiClientService);

  async importFromUrl(profileUrl: string): Promise<ScrapedBook[]> {
    const data = await this.api.invokeFunction<{ books: ScrapedBook[] }>('import-goodreads', {
      profileUrl,
    });
    return data?.books ?? [];
  }
}
