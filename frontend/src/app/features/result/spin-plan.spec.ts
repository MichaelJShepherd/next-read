import { buildSpinPlan } from './spin-plan';

describe('buildSpinPlan', () => {
  it('lands on the target index', () => {
    for (let count = 2; count <= 5; count++) {
      for (let target = 0; target < count; target++) {
        const plan = buildSpinPlan(count, target);
        expect(plan.at(-1)?.index).toBe(target);
      }
    }
  });

  it('lands on the target when starting from a previous highlight', () => {
    for (let start = 0; start < 5; start++) {
      const plan = buildSpinPlan(5, 2, start);
      expect(plan.at(-1)?.index).toBe(2);
    }
  });

  it('advances the highlight one pick at a time', () => {
    const count = 4;
    const plan = buildSpinPlan(count, 1);
    let previous = 0;
    for (const step of plan) {
      expect(step.index).toBe((previous + 1) % count);
      previous = step.index;
    }
  });

  it('decelerates: delays never decrease', () => {
    const plan = buildSpinPlan(5, 3);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].delay).toBeGreaterThanOrEqual(plan[i - 1].delay);
    }
  });

  it('keeps the total duration inside the 2–4s brand window', () => {
    for (let count = 2; count <= 5; count++) {
      for (let target = 0; target < count; target++) {
        const total = buildSpinPlan(count, target).reduce((sum, s) => sum + s.delay, 0);
        expect(total).toBeGreaterThanOrEqual(2000);
        expect(total).toBeLessThanOrEqual(4000);
      }
    }
  });

  it('returns an empty plan for fewer than two picks', () => {
    expect(buildSpinPlan(0, 0)).toEqual([]);
    expect(buildSpinPlan(1, 0)).toEqual([]);
  });

  it('returns an empty plan for an out-of-range target', () => {
    expect(buildSpinPlan(3, -1)).toEqual([]);
    expect(buildSpinPlan(3, 3)).toEqual([]);
  });
});
