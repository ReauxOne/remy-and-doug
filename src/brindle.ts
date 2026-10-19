import { BBEvent, BBState, Effort, Energy, Item, WorkHours } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function isWorkTime(wh: WorkHours, now: Date) {
  const h = now.getHours() + now.getMinutes() / 60;
  return wh.days.includes(now.getDay()) && h >= wh.startHour && h < wh.endHour;
}

export function daysUntil(dateIso: string, now: Date) {
  const [y, m, d] = dateIso.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / DAY);
}

export function whenLabel(days: number) {
  if (days < 0) return days === -1 ? 'yesterday' : `${-days} days ago`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 7) return `in ${days} days`;
  if (days < 14) return 'next week';
  return `in ${Math.round(days / 7)} weeks`;
}

/** Tasks that fit right now: during work hours only work, outside them everything but work. */
export function tasksForNow(state: BBState, now: Date): Item[] {
  const working = isWorkTime(state.settings.workHours, now);
  return state.items.filter(
    (i) =>
      i.kind === 'task' &&
      !i.doneAt &&
      (!i.snoozedUntil || i.snoozedUntil <= now.getTime()) &&
      (working ? i.context === 'work' : i.context !== 'work'),
  );
}

const FIT: Record<Energy, Record<Effort, number>> = {
  low: { low: 3, medium: 1, high: -2 },
  medium: { low: 2, medium: 3, high: 1 },
  full: { low: 1, medium: 2, high: 3 },
};

export type Suggestion =
  | { type: 'event'; event: BBEvent; notes: Item[]; days: number; reason: string }
  | { type: 'task'; item: Item; reason: string }
  | { type: 'empty'; reason: string };

/** Brindle: picks ONE thing to do right now. `passed` holds ids you've said "not now" to this round. */
export function brindle(state: BBState, energy: Energy, now: Date, passed: Set<string>): Suggestion {
  // An event coming up soon with notes waiting comes first.
  for (const event of [...state.events].sort((a, b) => a.date.localeCompare(b.date))) {
    const days = daysUntil(event.date, now);
    const notes = state.items.filter((i) => i.eventId === event.id && i.kind === 'note' && !i.doneAt);
    if (days >= 0 && days <= 2 && notes.length && !passed.has(event.id)) {
      return {
        type: 'event',
        event,
        notes,
        days,
        reason: `It's ${whenLabel(days)}, and you've saved ${notes.length} ${notes.length === 1 ? 'note' : 'notes'} for it. Take a minute to look them over.`,
      };
    }
  }

  const working = isWorkTime(state.settings.workHours, now);
  const candidates = tasksForNow(state, now).filter((i) => !passed.has(i.id));
  if (!candidates.length) {
    return {
      type: 'empty',
      reason: passed.size
        ? "That's everything that fits right now. Resting counts too."
        : working
          ? 'Nothing on the work list. Enjoy the breathing room.'
          : 'Your list is clear for now. Brandle something whenever it pops into your head.',
    };
  }

  const scored = candidates
    .map((item) => {
      const ageDays = (now.getTime() - item.createdAt) / DAY;
      const score = FIT[energy][item.effort] * 2 + Math.min(ageDays, 14) / 4 - item.skips * 0.5;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  const item = scored[0].item;
  return { type: 'task', item, reason: reasonFor(item, energy, working) };
}

function reasonFor(item: Item, energy: Energy, working: boolean) {
  if (working) return "You're on the clock, so here's a work one.";
  if (item.place) return `Next time you're out, swing by the ${item.place}.`;
  if (energy === 'low' && item.effort === 'low') return 'Small and doable, even on a low tank.';
  if (energy === 'full' && item.effort === 'high') return "You've got gas. Good time for a bigger one.";
  if (item.skips >= 3) return "This one keeps getting bumped. Maybe today's the day?";
  return 'A good fit for right now.';
}

export function reviewDue(state: BBState, now: Date) {
  return now.getTime() - state.settings.lastReviewAt > state.settings.reviewEveryDays * DAY;
}

export function daysSinceReview(state: BBState, now: Date) {
  return Math.floor((now.getTime() - state.settings.lastReviewAt) / DAY);
}
