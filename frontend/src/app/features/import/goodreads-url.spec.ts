import { extractGoodreadsUrl } from './goodreads-url';

describe('extractGoodreadsUrl', () => {
  it('extracts the URL from the Goodreads share-sheet text', () => {
    const shared =
      'Check out my profile on Goodreads!\n https://www.goodreads.com/user/show/91576766';
    expect(extractGoodreadsUrl(shared)).toBe('https://www.goodreads.com/user/show/91576766');
  });

  it('returns a plain URL unchanged', () => {
    const url = 'https://www.goodreads.com/user/show/12345-your-name';
    expect(extractGoodreadsUrl(url)).toBe(url);
  });

  it('trims surrounding whitespace from a plain URL', () => {
    expect(extractGoodreadsUrl('  https://goodreads.com/user/show/1  ')).toBe(
      'https://goodreads.com/user/show/1',
    );
  });

  it('strips trailing sentence punctuation from a shared link', () => {
    expect(extractGoodreadsUrl('My shelf: https://www.goodreads.com/user/show/1.')).toBe(
      'https://www.goodreads.com/user/show/1',
    );
  });

  it('returns trimmed input when there is no Goodreads URL', () => {
    expect(extractGoodreadsUrl('  not a url  ')).toBe('not a url');
    expect(extractGoodreadsUrl('https://example.com/user')).toBe('https://example.com/user');
  });
});
