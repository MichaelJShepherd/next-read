import { TestBed } from '@angular/core/testing';
import { QuizService, QuizAnswers, ScoredBook } from './quiz.service';
import { Book, BooksService } from '../../core/books.service';

function makeBook(overrides: Partial<Book> & { id: string }): Book {
  return {
    title: `Book ${overrides.id}`,
    author: null,
    cover_url: null,
    page_count: null,
    avg_rating: null,
    genres: null,
    synopsis: null,
    isbn: null,
    ...overrides,
  };
}

function answers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return { moods: ['cozy'], commitment: 'any', avoid: [], ...overrides };
}

describe('QuizService', () => {
  let service: QuizService;
  let books: Book[];

  beforeEach(() => {
    books = [];
    TestBed.configureTestingModule({
      providers: [{ provide: BooksService, useValue: { getAll: () => Promise.resolve(books) } }],
    });
    service = TestBed.inject(QuizService);
  });

  function pickFor(picks: ScoredBook[], id: string): ScoredBook {
    const found = picks.find((p) => p.book.id === id);
    if (!found) throw new Error(`book ${id} not in picks`);
    return found;
  }

  it('returns no picks for an empty shelf', async () => {
    const picks = await service.computePicks(answers());
    expect(picks).toEqual([]);
    expect(service.picks()).toEqual([]);
  });

  it('excludes books matching an avoided genre', async () => {
    books = [
      makeBook({ id: 'kept', genres: ['romance'] }),
      makeBook({ id: 'avoided', genres: ['horror'] }),
    ];
    const picks = await service.computePicks(answers({ avoid: ['horror'] }));
    expect(picks.map((p) => p.book.id)).toEqual(['kept']);
  });

  it('scores mood-genre matches and explains them', async () => {
    books = [
      makeBook({ id: 'match', genres: ['romance'] }),
      makeBook({ id: 'miss', genres: ['horror'] }),
    ];
    const picks = await service.computePicks(answers({ moods: ['cozy'] }));
    const match = pickFor(picks, 'match');
    const miss = pickFor(picks, 'miss');
    expect(match.score).toBe(2);
    expect(match.reasons).toContain('Matches your cozy mood');
    expect(miss.score).toBe(0);
    expect(miss.reasons).toEqual([]);
  });

  it('matches spicy and nostalgic moods against their genres', async () => {
    books = [
      makeBook({ id: 'steamy', genres: ['dark romance'] }),
      makeBook({ id: 'period-piece', genres: ['historical fiction'] }),
      makeBook({ id: 'unrelated', genres: ['business'] }),
    ];
    const picks = await service.computePicks(answers({ moods: ['spicy', 'nostalgic'] }));
    expect(pickFor(picks, 'steamy').reasons).toContain('Matches your spicy mood');
    expect(pickFor(picks, 'period-piece').reasons).toContain('Matches your nostalgic mood');
    expect(pickFor(picks, 'unrelated').score).toBe(0);
  });

  it('matches escapist, dark, romantic and curious moods against their genres', async () => {
    books = [
      makeBook({ id: 'dragons', genres: ['fantasy'] }),
      makeBook({ id: 'gothic', genres: ['gothic'] }),
      makeBook({ id: 'meet-cute', genres: ['romantic comedy'] }),
      makeBook({ id: 'pop-sci', genres: ['nonfiction'] }),
    ];
    const picks = await service.computePicks(
      answers({ moods: ['escapist', 'dark', 'romantic', 'curious'] }),
    );
    expect(pickFor(picks, 'dragons').reasons).toContain('Matches your escapist mood');
    expect(pickFor(picks, 'gothic').reasons).toContain('Matches your dark mood');
    expect(pickFor(picks, 'meet-cute').reasons).toContain('Matches your romantic mood');
    expect(pickFor(picks, 'pop-sci').reasons).toContain('Matches your curious mood');
  });

  it('matches Open Library style subjects from a real TBR', async () => {
    // Subjects as Open Library returns them: capitalised and often oddly phrased.
    books = [
      makeBook({ id: 'achilles', genres: ['Greek Mythology', 'Historical Fiction'] }),
      makeBook({ id: 'far-north', genres: ['Post-Apocalyptic Fiction', 'Science Fiction'] }),
      makeBook({ id: 'hidden-things', genres: ['Magical Realism', 'Fantasy'] }),
      makeBook({ id: 'everlasting', genres: ['Time Travel', 'Romance'] }),
      makeBook({ id: 'practical-magic', genres: ['Witches', 'Magic', 'Sisters'] }),
      makeBook({ id: 'bright-haven', genres: ['Dark Academia', 'Fantasy'] }),
      makeBook({ id: 'becoming', genres: ['Biography', 'Memoir'] }),
    ];
    const picks = await service.computePicks(
      answers({ moods: ['nostalgic', 'escapist', 'dark', 'inspiring'] }),
    );
    expect(pickFor(picks, 'achilles').reasons).toContain('Matches your nostalgic mood');
    expect(pickFor(picks, 'far-north').reasons).toContain('Matches your escapist mood');
    expect(pickFor(picks, 'far-north').reasons).toContain('Matches your dark mood');
    expect(pickFor(picks, 'hidden-things').reasons).toContain('Matches your escapist mood');
    expect(pickFor(picks, 'everlasting').reasons).toContain('Matches your escapist mood');
    expect(pickFor(picks, 'practical-magic').reasons).toContain('Matches your escapist mood');
    expect(pickFor(picks, 'bright-haven').reasons).toContain('Matches your dark mood');
    expect(pickFor(picks, 'becoming').reasons).toContain('Matches your inspiring mood');
  });

  it('rewards a commitment fit and penalises a mismatch', async () => {
    books = [
      makeBook({ id: 'fits', page_count: 250 }),
      makeBook({ id: 'too-long', page_count: 800 }),
      makeBook({ id: 'unknown', page_count: null }),
    ];
    const picks = await service.computePicks(answers({ moods: [], commitment: 'short' }));
    expect(pickFor(picks, 'fits').score).toBe(3);
    expect(pickFor(picks, 'fits').reasons).toContain('A quick read, like you asked for');
    expect(pickFor(picks, 'too-long').score).toBe(-2);
    expect(pickFor(picks, 'too-long').reasons).toEqual([]);
    expect(pickFor(picks, 'unknown').score).toBe(0);
  });

  it('does not score length when the user is not fussed', async () => {
    books = [makeBook({ id: 'long', page_count: 900 })];
    const picks = await service.computePicks(answers({ moods: [], commitment: 'any' }));
    expect(pickFor(picks, 'long').score).toBe(0);
    expect(pickFor(picks, 'long').reasons).toEqual([]);
  });

  it('gives highly rated books a bonus and a reason', async () => {
    books = [makeBook({ id: 'loved', avg_rating: 4.3 }), makeBook({ id: 'fine', avg_rating: 3.9 })];
    const picks = await service.computePicks(answers({ moods: [] }));
    expect(pickFor(picks, 'loved').score).toBe(1);
    expect(pickFor(picks, 'loved').reasons).toContain('Loved by readers');
    expect(pickFor(picks, 'fine').score).toBe(0);
  });

  it('stores answers and picks, and resets the recommendation id', async () => {
    books = [makeBook({ id: 'a', genres: ['romance'] })];
    service.recommendationId.set('stale-id');
    const quizAnswers = answers({ moods: ['cozy'], commitment: 'short', avoid: ['horror'] });
    const picks = await service.computePicks(quizAnswers);
    expect(service.answers()).toEqual(quizAnswers);
    expect(service.picks()).toEqual(picks);
    expect(service.recommendationId()).toBeNull();
  });
});
