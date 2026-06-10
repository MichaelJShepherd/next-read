import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ImportComponent } from './import.component';
import { ImportService } from './import.service';
import { BooksService } from '../../core/books.service';

function pasteEvent(text: string): Event {
  const event = new Event('paste', { cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: { getData: (): string => text },
  });
  return event;
}

describe('ImportComponent', () => {
  let fixture: ComponentFixture<ImportComponent>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportComponent],
      providers: [
        provideRouter([]),
        {
          provide: ImportService,
          useValue: { importFromUrl: (): Promise<never[]> => Promise.resolve([]) },
        },
        { provide: BooksService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = (fixture.nativeElement as HTMLElement).querySelector('input#gr-url');
    if (!(el instanceof HTMLInputElement)) throw new Error('URL input not rendered');
    input = el;
  });

  it('keeps a link pasted below a line of share text', async () => {
    const event = pasteEvent(
      'Check out my profile on Goodreads!\nhttps://www.goodreads.com/user/show/91576766',
    );
    input.dispatchEvent(event);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(input.value).toBe('https://www.goodreads.com/user/show/91576766');
  });

  it('takes over pasting a plain URL so the browser cannot truncate it', async () => {
    const event = pasteEvent('https://www.goodreads.com/user/show/12345-your-name\n');
    input.dispatchEvent(event);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(input.value).toBe('https://www.goodreads.com/user/show/12345-your-name');
  });

  it('leaves non-text pastes to the browser', () => {
    const event = pasteEvent('');
    input.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
