import {
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  signal,
  computed,
  ViewChildren,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { QuizService, Mood, Commitment, QuizAnswers } from './quiz.service';
import { RecommendationsService } from './recommendations.service';
import { BooksService } from '../../core/books.service';

type Step = 'mood' | 'commitment' | 'avoid';
type ShelfState = 'checking' | 'empty' | 'ready';

const STEPS: { id: Step; title: string }[] = [
  { id: 'mood', title: 'Mood' },
  { id: 'commitment', title: 'Commitment' },
  { id: 'avoid', title: 'Avoid' },
];

const MOODS: { id: Mood; label: string; emoji: string }[] = [
  { id: 'adventurous', label: 'Adventurous', emoji: '🗺️' },
  { id: 'cozy', label: 'Cozy', emoji: '🧸' },
  { id: 'emotional', label: 'Emotional', emoji: '💛' },
  { id: 'thrilling', label: 'Thrilling', emoji: '⚡' },
  { id: 'funny', label: 'Funny', emoji: '😄' },
  { id: 'inspiring', label: 'Inspiring', emoji: '✨' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { id: 'nostalgic', label: 'Nostalgic', emoji: '🕰️' },
  { id: 'escapist', label: 'Escapist', emoji: '🐉' },
  { id: 'dark', label: 'Dark', emoji: '🌙' },
  { id: 'curious', label: 'Curious', emoji: '🔍' },
];

const COMMITMENT_OPTIONS: { id: Commitment; label: string; sub: string }[] = [
  { id: 'short', label: 'A quick read', sub: 'Under 300 pages' },
  { id: 'medium', label: 'Something substantial', sub: '300–500 pages' },
  { id: 'long', label: 'Sink into an epic', sub: '500+ pages' },
  { id: 'any', label: "I'm not fussed", sub: 'Any length' },
];

const AVOID_OPTIONS: { id: string; label: string }[] = [
  { id: 'horror', label: 'Horror' },
  { id: 'romance', label: 'Romance' },
  { id: 'sci-fi', label: 'Sci-fi' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'non-fiction', label: 'Non-fiction' },
  { id: 'self-help', label: 'Self-help' },
  { id: 'thriller', label: 'Thriller' },
  { id: 'young adult', label: 'Young adult' },
  { id: 'historical', label: 'Historical' },
  { id: 'memoir', label: 'Memoir' },
  { id: 'erotica', label: 'Spice' },
];

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
})
export class QuizComponent implements OnInit {
  private readonly quiz = inject(QuizService);
  private readonly recommendations = inject(RecommendationsService);
  private readonly books = inject(BooksService);
  private readonly router = inject(Router);

  @ViewChildren('commitmentRadio')
  private readonly commitmentRadios!: QueryList<ElementRef<HTMLButtonElement>>;

  protected readonly steps = STEPS;
  protected readonly moods = MOODS;
  protected readonly commitmentOptions = COMMITMENT_OPTIONS;
  protected readonly avoidOptions = AVOID_OPTIONS;

  protected readonly shelfState = signal<ShelfState>('checking');
  protected readonly step = signal<Step>('mood');
  protected readonly selectedMoods = signal<Set<Mood>>(new Set());
  protected readonly selectedCommitment = signal<Commitment | null>(null);
  protected readonly selectedAvoid = signal<Set<string>>(new Set());
  protected readonly loading = signal(false);
  protected readonly errorMsg = signal('');
  protected readonly noMatches = signal(false);

  protected readonly moodValid = computed(() => this.selectedMoods().size > 0);
  protected readonly commitmentValid = computed(() => this.selectedCommitment() !== null);
  private readonly stepIndex = computed(() => STEPS.findIndex((s) => s.id === this.step()));
  protected readonly stepNumber = computed(() => this.stepIndex() + 1);
  protected readonly stepTitle = computed(() => STEPS[this.stepIndex()]?.title ?? '');

  constructor() {
    // Restore previous answers so "Try different answers" lets the user
    // refine rather than start from scratch.
    const previous = this.quiz.answers();
    if (previous) {
      this.selectedMoods.set(new Set(previous.moods));
      this.selectedCommitment.set(previous.commitment);
      this.selectedAvoid.set(new Set(previous.avoid));
    }
  }

  async ngOnInit(): Promise<void> {
    const all = await this.books.getAll();
    this.shelfState.set(all.length > 0 ? 'ready' : 'empty');
  }

  protected isStepDone(id: Step): boolean {
    return STEPS.findIndex((s) => s.id === id) < this.stepIndex();
  }

  protected toggleMood(id: Mood): void {
    this.toggleSelection(this.selectedMoods, id);
  }

  protected toggleAvoid(id: string): void {
    this.toggleSelection(this.selectedAvoid, id);
  }

  private toggleSelection<T>(selection: WritableSignal<Set<T>>, id: T): void {
    const next = new Set(selection());
    next.has(id) ? next.delete(id) : next.add(id);
    selection.set(next);
    this.noMatches.set(false);
  }

  protected selectCommitment(id: Commitment): void {
    this.selectedCommitment.set(id);
    this.noMatches.set(false);
  }

  protected commitmentTabindex(id: Commitment, index: number): number {
    const selected = this.selectedCommitment();
    if (selected !== null) return selected === id ? 0 : -1;
    return index === 0 ? 0 : -1;
  }

  protected onCommitmentKeydown(event: KeyboardEvent, index: number): void {
    let next: number;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      next = (index + 1) % COMMITMENT_OPTIONS.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      next = (index - 1 + COMMITMENT_OPTIONS.length) % COMMITMENT_OPTIONS.length;
    } else {
      return;
    }
    event.preventDefault();
    this.selectCommitment(COMMITMENT_OPTIONS[next].id);
    this.commitmentRadios.get(next)?.nativeElement.focus();
  }

  protected nextStep(): void {
    if (this.step() === 'mood' && this.moodValid()) this.step.set('commitment');
    else if (this.step() === 'commitment' && this.commitmentValid()) this.step.set('avoid');
  }

  protected prevStep(): void {
    if (this.step() === 'commitment') this.step.set('mood');
    else if (this.step() === 'avoid') this.step.set('commitment');
  }

  protected goImport(): void {
    this.router.navigate(['/import']);
  }

  protected async findMyBook(): Promise<void> {
    const commitment = this.selectedCommitment();
    if (!commitment) return;

    this.loading.set(true);
    this.errorMsg.set('');
    this.noMatches.set(false);
    try {
      const answers: QuizAnswers = {
        moods: Array.from(this.selectedMoods()),
        commitment,
        avoid: Array.from(this.selectedAvoid()),
      };
      const scored = await this.quiz.computePicks(answers);
      if (scored.length === 0) {
        this.noMatches.set(true);
        return;
      }
      // Track the recommendation without blocking navigation; the id lands
      // in shared state for the result screen to attach a selection to.
      this.recommendations
        .record(answers, scored)
        .then((id) => this.quiz.recommendationId.set(id))
        .catch(() => {
          // Best-effort tracking — never surfaces to the user.
        });
      this.router.navigate(['/result']);
    } catch {
      this.errorMsg.set('Could not load your books. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  protected handleBack(): void {
    if (this.step() === 'mood') this.router.navigate(['/']);
    else this.prevStep();
  }
}
