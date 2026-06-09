/**
 * Pulls the first Goodreads URL out of arbitrary pasted text, so share-sheet
 * blurbs like "Check out my profile on Goodreads!\n https://www.goodreads.com/…"
 * resolve to just the URL. Returns the trimmed input unchanged when it
 * contains no Goodreads URL — the server still validates it.
 */
export function extractGoodreadsUrl(text: string): string {
  const match = text.match(/https?:\/\/\S*goodreads\.com\S*/i);
  if (!match) return text.trim();
  // Strip sentence punctuation that can trail a shared link.
  return match[0].replace(/[.,!?)\]]+$/, '');
}
