import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService, Mood, Commitment } from './quiz.service';

type Step = 'mood' | 'commitment' | 'avoid';

const MOODS: { id: Mood; label: string; emoji: string }[] = [
  { id: 'adventurous', label: 'Adventurous', emoji: '🗺️' },
  { id: 'cozy', label: 'Cozy', emoji: '🧸' },
  { id: 'emotional', label: 'Emotional', emoji: '💛' },
  { id: 'thrilling', label: 'Thrilling', emoji: '⚡' },
  { id: 'funny', label: 'Funny', emoji: '😄' },
  { id: 'inspiring', label: 'Inspiring', emoji: '✨' },
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
];

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
})
export class QuizComponent {
  private readonly quiz = inject(QuizService);
  private readonly router = inject(Router);

  protected readonly moods = MOODS;
  protected readonly commitmentOptions = COMMITMENT_OPTIONS;
  protected readonly avoidOptions = AVOID_OPTIONS;

  protected readonly step = signal<Step>('mood');
  protected readonly selectedMoods = signal<Set<Mood>>(new Set());
  protected readonly selectedCommitment = signal<Commitment | null>(null);
  protected readonly selectedAvoid = signal<Set<string>>(new Set());
  protected readonly loading = signal(false);
  protected readonly errorMsg = signal('');

  protected readonly moodValid = computed(() => this.selectedMoods().size > 0);
  protected readonly commitmentValid = computed(() => this.selectedCommitment() !== null);

  protected toggleMood(id: Mood): void {
    const next = new Set(this.selectedMoods());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedMoods.set(next);
  }

  protected toggleAvoid(id: string): void {
    const next = new Set(this.selectedAvoid());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedAvoid.set(next);
  }

  protected selectCommitment(id: Commitment): void {
    this.selectedCommitment.set(id);
  }

  protected nextStep(): void {
    if (this.step() === 'mood' && this.moodValid()) this.step.set('commitment');
    else if (this.step() === 'commitment' && this.commitmentValid()) this.step.set('avoid');
  }

  protected prevStep(): void {
    if (this.step() === 'commitment') this.step.set('mood');
    else if (this.step() === 'avoid') this.step.set('commitment');
  }

  protected async findMyBook(): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await this.quiz.computePicks({
        moods: Array.from(this.selectedMoods()),
        commitment: this.selectedCommitment()!,
        avoid: Array.from(this.selectedAvoid()),
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
