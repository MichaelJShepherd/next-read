export type SpinStep = {
  /** Index of the pick to highlight at this step. */
  index: number;
  /** Milliseconds to wait before moving the highlight to it. */
  delay: number;
};

const MIN_STEP_MS = 70;
const MAX_STEP_MS = 380;
const MIN_TRAVEL_STEPS = 14;

/**
 * Builds the step sequence for the roulette spinner: the highlight advances
 * one pick at a time with ease-in cubic delays, so it starts fast and
 * decelerates until it lands on `targetIndex`. Step counts and delays are
 * tuned so the total duration stays inside the brand's 2–4s spinner window
 * for the 2–5 picks the result page can show.
 */
export function buildSpinPlan(count: number, targetIndex: number, startIndex = 0): SpinStep[] {
  if (count < 2 || targetIndex < 0 || targetIndex >= count) return [];

  const cycles = Math.ceil(MIN_TRAVEL_STEPS / count);
  const offset = (((targetIndex - startIndex) % count) + count) % count;
  const total = cycles * count + offset;

  const steps: SpinStep[] = [];
  for (let i = 0; i < total; i++) {
    const progress = i / (total - 1);
    steps.push({
      index: (startIndex + i + 1) % count,
      delay: Math.round(MIN_STEP_MS + (MAX_STEP_MS - MIN_STEP_MS) * progress ** 3),
    });
  }
  return steps;
}
