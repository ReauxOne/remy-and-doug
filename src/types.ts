export type Effort = 'low' | 'medium' | 'high';
export type Energy = 'low' | 'medium' | 'full';

export type ContextId = 'work' | 'home' | 'errands' | 'people' | 'anything';

export interface Item {
  id: string;
  text: string;
  /** A task is something to do; a note is something to remember for an event. */
  kind: 'task' | 'note';
  context: ContextId;
  effort: Effort;
  /** Kind of place this belongs to, e.g. "auto parts store" (location reminders come in Stage 2). */
  place?: string;
  eventId?: string;
  createdAt: number;
  doneAt?: number;
  snoozedUntil?: number;
  /** How many times Doug suggested it and you said "not now". */
  skips: number;
  /** Set on Doug's getting-started tasks, which finish themselves when you do the thing. */
  setup?: SetupId;
}

export type SetupId = 'workHours' | 'firstThought' | 'tidy';

export interface BBEvent {
  id: string;
  title: string;
  /** ISO date, e.g. 2026-11-04 */
  date: string;
  /** Left over from early versions; no longer shown. */
  emoji?: string;
}

export interface WorkHours {
  /** 0 = Sunday … 6 = Saturday */
  days: number[];
  startHour: number;
  endHour: number;
}

export interface Settings {
  workHours: WorkHours;
  reviewEveryDays: number;
  lastReviewAt: number;
  /** True once Doug's getting-started tasks have been added. */
  setupSeeded?: boolean;
}

export interface BBState {
  items: Item[];
  events: BBEvent[];
  settings: Settings;
}
