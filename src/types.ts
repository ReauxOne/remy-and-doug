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
  /** How many times Brindle suggested it and you said "not now". */
  skips: number;
}

export interface BBEvent {
  id: string;
  title: string;
  /** ISO date, e.g. 2026-11-04 */
  date: string;
  emoji: string;
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
}

export interface BBState {
  items: Item[];
  events: BBEvent[];
  settings: Settings;
}
