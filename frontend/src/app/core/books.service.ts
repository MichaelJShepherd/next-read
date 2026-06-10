import { Injectable } from '@angular/core';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  page_count: number | null;
  avg_rating: number | null;
  genres: string[] | null;
  synopsis: string | null;
  isbn: string | null;
}

export type NewBook = Omit<Book, 'id'>;

const STORAGE_KEY = 'nr_books';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  getAll(): Promise<Book[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return Promise.resolve(raw ? (JSON.parse(raw) as Book[]) : []);
    } catch {
      return Promise.resolve([]);
    }
  }

  saveMany(books: NewBook[]): Promise<void> {
    const rows: Book[] = books.map((b) => ({ ...b, id: generateId() }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    return Promise.resolve();
  }

  clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve();
  }
}
