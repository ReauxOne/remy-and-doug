import { BBEvent, ContextId, Effort } from './types';

export interface ParsedThought {
  text: string;
  kind: 'task' | 'note';
  context: ContextId;
  effort: Effort;
  place?: string;
  eventId?: string;
}

const CONTEXT_WORDS: Record<Exclude<ContextId, 'anything'>, string[]> = {
  work: ['work', 'meeting', 'email', 'report', 'boss', 'client', 'deck', 'spreadsheet', 'invoice', 'timesheet', 'project', 'coworker', 'manager', 'standup', 'deadline', 'slack', 'proposal'],
  errands: ['pick up', 'buy', 'grab', 'store', 'shop', 'groceries', 'pharmacy', 'prescription', 'return', 'drop off', 'post office', 'gas', 'washer fluid', 'oil change', 'bank'],
  home: ['clean', 'laundry', 'dishes', 'vacuum', 'fix', 'garage', 'yard', 'mow', 'trash', 'bills', 'closet', 'fridge', 'sheets', 'organize'],
  people: ['call', 'text', 'mom', 'dad', 'kid', 'kids', 'birthday', 'friend', 'teacher', 'doctor', 'dentist', 'appointment', 'thank', 'invite'],
};

// Kinds of places, matched to words that hint at them.
const PLACES: { place: string; words: string[] }[] = [
  { place: 'auto parts store', words: ['washer fluid', 'wiper', 'motor oil', 'car battery', 'antifreeze', 'auto'] },
  { place: 'grocery store', words: ['groceries', 'milk', 'eggs', 'bread', 'produce', 'snacks', 'coffee'] },
  { place: 'pharmacy', words: ['pharmacy', 'prescription', 'medicine', 'vitamins'] },
  { place: 'hardware store', words: ['hardware', 'screws', 'light bulb', 'paint', 'batteries', 'filter'] },
  { place: 'post office', words: ['post office', 'mail', 'package', 'stamps'] },
];

const LOW_WORDS = ['quick', 'text', 'reply', 'email', 'call', 'buy', 'grab', 'pick up', 'order', 'pay', 'sign', 'send', 'book', 'schedule', 'check'];
const HIGH_WORDS = ['plan', 'write', 'research', 'organize', 'deep clean', 'garage', 'taxes', 'build', 'redo', 'overhaul', 'prepare', 'presentation', 'declutter'];

const NOTE_STARTERS = ['ask ', 'mention ', 'remember to ask', 'bring up', 'note:', 'question:'];

function has(text: string, word: string) {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
}

const STOP = new Set(['the', 'a', 'an', 'and', 'for', 'with', 'at', 'to', 'of', 'my', 'on', 'in']);

function significantWords(s: string) {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));
}

/** Finds an upcoming event the thought is about, e.g. "ask about reading level at the conference". */
export function matchEvent(text: string, events: BBEvent[]): BBEvent | undefined {
  const words = new Set(significantWords(text));
  let best: { ev: BBEvent; score: number } | undefined;
  for (const ev of events) {
    const score = significantWords(ev.title).filter((w) => words.has(w) || words.has(w.replace(/s$/, ''))).length;
    if (score > 0 && (!best || score > best.score)) best = { ev, score };
  }
  return best?.ev;
}

/** Sorts a raw thought into context, effort and place, so capturing never needs a form. */
export function parseThought(raw: string, events: BBEvent[]): ParsedThought {
  const text = raw.trim().replace(/^brandle[,:]?\s*/i, '');
  const lower = text.toLowerCase();

  const event = matchEvent(text, events);
  const looksLikeNote = NOTE_STARTERS.some((s) => lower.startsWith(s)) || /\?$/.test(text);
  const kind: 'task' | 'note' = event && looksLikeNote ? 'note' : event && /\b(for|at|during)\b/i.test(text) ? 'note' : 'task';

  let context: ContextId = 'anything';
  let bestHits = 0;
  for (const [ctx, words] of Object.entries(CONTEXT_WORDS) as [ContextId, string[]][]) {
    const hits = words.filter((w) => has(lower, w)).length;
    if (hits > bestHits) {
      bestHits = hits;
      context = ctx;
    }
  }

  const place = PLACES.find((p) => p.words.some((w) => has(lower, w)))?.place;
  if (place && context !== 'work') context = 'errands';

  let effort: Effort = 'medium';
  if (HIGH_WORDS.some((w) => has(lower, w))) effort = 'high';
  else if (LOW_WORDS.some((w) => has(lower, w)) || place || text.split(/\s+/).length <= 4) effort = 'low';

  return { text, kind, context, effort, place, eventId: event?.id };
}
