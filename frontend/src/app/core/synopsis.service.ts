import { Injectable } from '@angular/core';

export interface BookDetails {
  synopsis: string | null;
  genres: string[] | null;
}

const CACHE_PREFIX = 'nr_syn_';
const MAX_GENRES = 5;
const BASE = 'https://openlibrary.org';

@Injectable({ providedIn: 'root' })
export class SynopsisService {
  private readonly memory = new Map<string, BookDetails>();

  async fetchDetails(isbn: string | null, title: string, author: string | null): Promise<BookDetails> {
    const key = isbn ?? `${title}__${author ?? ''}`;

    if (this.memory.has(key)) return this.memory.get(key)!;

    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (stored) {
      const parsed = JSON.parse(stored) as BookDetails;
      this.memory.set(key, parsed);
      return parsed;
    }

    const workKey =
      (isbn ? await this.workKeyFromIsbn(isbn) : null) ??
      await this.workKeyFromSearch(title, author);

    const result = workKey ? await this.fetchWork(workKey) : { synopsis: null, genres: null };

    this.memory.set(key, result);
    try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(result)); } catch { /* quota */ }
    return result;
  }

  private async workKeyFromIsbn(isbn: string): Promise<string | null> {
    const normalised = isbn.replace(/[\s-]/g, '');
    try {
      const res = await fetch(`${BASE}/isbn/${normalised}.json`);
      if (!res.ok) return null;
      const ed = await res.json() as { works?: { key: string }[] };
      return ed.works?.[0]?.key ?? null;
    } catch { return null; }
  }

  private async workKeyFromSearch(title: string, author: string | null): Promise<string | null> {
    try {
      const params = new URLSearchParams({ title, limit: '1' });
      if (author) params.set('author', author);
      const res = await fetch(`${BASE}/search.json?${params}`);
      if (!res.ok) return null;
      const data = await res.json() as { docs?: { key: string }[] };
      return data.docs?.[0]?.key ?? null;
    } catch { return null; }
  }

  private async fetchWork(key: string): Promise<BookDetails> {
    try {
      const res = await fetch(`${BASE}${key}.json`);
      if (!res.ok) return { synopsis: null, genres: null };
      const work = await res.json() as OlWork;
      return {
        synopsis: extractDescription(work.description),
        genres: work.subjects?.slice(0, MAX_GENRES) ?? null,
      };
    } catch { return { synopsis: null, genres: null }; }
  }
}

type OlWork = {
  description?: string | { value: string };
  subjects?: string[];
};

function extractDescription(raw: OlWork['description']): string | null {
  if (!raw) return null;
  return typeof raw === 'string' ? raw : raw.value;
}
