import type { WorkHours } from './types';

/**
 * Settings people can just say to Remy, e.g. "my work hours are Monday through Friday from 5am to 3pm".
 * Plain rules for now; AI sorting will take over the harder phrasings later.
 */
export type SpokenSetting =
  | { type: 'workHours'; workHours: WorkHours; summary: string }
  | { type: 'review'; days: number; summary: string };

const DAY_NAMES: [RegExp, number][] = [
  [/^sun(day)?s?$/, 0],
  [/^mon(day)?s?$/, 1],
  [/^tue(s|sday)?s?$/, 2],
  [/^wed(s|nesday)?s?$/, 3],
  [/^thu(r|rs|rsday)?s?$/, 4],
  [/^fri(day)?s?$/, 5],
  [/^sat(urday)?s?$/, 6],
];
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayIndex(word: string) {
  return DAY_NAMES.find(([re]) => re.test(word))?.[1];
}

/** Finds which days are meant: "weekdays", "Monday through Friday", "Mon, Wed and Fri". */
export function parseDays(text: string): number[] | undefined {
  const lower = text.toLowerCase();
  if (/\b(every ?day|daily|7 days)\b/.test(lower)) return [0, 1, 2, 3, 4, 5, 6];
  if (/\bweekdays?\b/.test(lower)) return [1, 2, 3, 4, 5];
  if (/\bweekends?\b/.test(lower)) return [0, 6];

  const words = lower.split(/[^a-z]+/).filter(Boolean);
  const days = new Set<number>();
  for (let i = 0; i < words.length; i++) {
    const a = dayIndex(words[i]);
    if (a === undefined) continue;
    const joiner = words[i + 1];
    const b = joiner && /^(through|thru|to|till|until)$/.test(joiner) ? dayIndex(words[i + 2] ?? '') : undefined;
    if (b !== undefined) {
      for (let d = a; ; d = (d + 1) % 7) {
        days.add(d);
        if (d === b) break;
      }
      i += 2;
    } else days.add(a);
  }
  // "Mon-Fri" splits into "mon" and "fri" with no joiner word, so treat a dash between two days as a range.
  const dash = lower.match(/\b([a-z]{3,9})\s*[-–]\s*([a-z]{3,9})\b/);
  if (dash) {
    const a = dayIndex(dash[1]), b = dayIndex(dash[2]);
    if (a !== undefined && b !== undefined) for (let d = a; ; d = (d + 1) % 7) { days.add(d); if (d === b) break; }
  }
  return days.size ? [...days].sort((x, y) => x - y) : undefined;
}

interface Clock { h: number; m: number; ampm?: 'am' | 'pm' }

function readClock(s: string): Clock | undefined {
  const w = s.trim().toLowerCase();
  if (w === 'noon') return { h: 12, m: 0, ampm: 'pm' };
  if (w === 'midnight') return { h: 12, m: 0, ampm: 'am' };
  const m = w.match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/);
  if (!m) return undefined;
  const ampm = m[3] ? (m[3][0] === 'a' ? 'am' : 'pm') : undefined;
  return { h: Number(m[1]), m: Number(m[2] ?? 0), ampm };
}

function to24(c: Clock, ampm: 'am' | 'pm') {
  if (c.h > 12) return c.h + c.m / 60; // already 24-hour, like 17:00
  const h = (c.h % 12) + (ampm === 'pm' ? 12 : 0);
  return h + c.m / 60;
}

/** Reads "5am to 3pm", "9 to 5", "8:30-4:30", "noon until 8pm". Returns hours as decimals, e.g. 8.5. */
export function parseTimeRange(text: string): { start: number; end: number } | undefined {
  const T = '(noon|midnight|\\d{1,2}(?::\\d{2})?\\s*(?:a\\.?m\\.?|p\\.?m\\.?)?)';
  const m = text.toLowerCase().match(new RegExp(`${T}\\s*(?:to|till|til|until|through|thru|-|–)\\s*${T}`));
  if (!m) return undefined;
  const a = readClock(m[1]), b = readClock(m[2]);
  if (!a || !b || a.h > 23 || b.h > 23 || a.m > 59 || b.m > 59) return undefined;

  // Try every am/pm the person could have meant and keep the shift that looks most like a workday.
  let best: { start: number; end: number; score: number } | undefined;
  for (const pa of a.ampm ? [a.ampm] : (['am', 'pm'] as const)) {
    for (const pb of b.ampm ? [b.ampm] : (['am', 'pm'] as const)) {
      const start = to24(a, pa), end = to24(b, pb);
      const length = end - start;
      if (length < 1 || length > 16) continue;
      const score = -Math.abs(length - 8) - (pa === 'pm' && !a.ampm ? 2 : 0);
      if (!best || score > best.score) best = { start, end, score };
    }
  }
  return best && { start: best.start, end: best.end };
}

export function clockLabel(h: number) {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  const suffix = hh < 12 || hh === 24 ? 'am' : 'pm';
  const n = hh % 12 === 0 ? 12 : hh % 12;
  return `${n}${mm ? `:${String(mm).padStart(2, '0')}` : ''}${suffix}`;
}

export function daysLabel(days: number[]) {
  const key = days.join(',');
  if (key === '1,2,3,4,5') return 'Mon–Fri';
  if (key === '0,1,2,3,4,5,6') return 'every day';
  if (key === '0,6') return 'weekends';
  // Collapse runs like Mon, Tue, Wed into Mon–Wed.
  const out: string[] = [];
  for (let i = 0; i < days.length; i++) {
    let j = i;
    while (j + 1 < days.length && days[j + 1] === days[j] + 1) j++;
    out.push(j - i >= 2 ? `${SHORT[days[i]]}–${SHORT[days[j]]}` : days.slice(i, j + 1).map((d) => SHORT[d]).join(', '));
    i = j;
  }
  return out.join(', ');
}

const WORK_HINT = /\b(work hours|working hours|work ?days|hours are|i work|my shift|i'm at work|work schedule|work from|on the clock)\b/i;
const REVIEW_HINT = /\b(check[- ]?in|tidy|review|look over my list)\b/i;

/** Returns a setting if the thought is really about how Remy & Doug should behave. */
export function parseSpokenSetting(raw: string, current: WorkHours): SpokenSetting | undefined {
  const text = raw.trim().replace(/^(hey |ok |okay )?(remy|doug)[,:]?\s*/i, '');

  if (WORK_HINT.test(text)) {
    const range = parseTimeRange(text);
    const days = parseDays(text);
    // Days alone ("I work from home on Tuesdays") aren't enough unless they clearly mean the schedule.
    if (range || (days && /\b(work(ing)? (hours|days|schedule)|my shift)\b/i.test(text))) {
      const workHours: WorkHours = {
        days: days ?? current.days,
        startHour: range?.start ?? current.startHour,
        endHour: range?.end ?? current.endHour,
      };
      return {
        type: 'workHours',
        workHours,
        summary: `Work hours: ${daysLabel(workHours.days)}, ${clockLabel(workHours.startHour)} to ${clockLabel(workHours.endHour)}.`,
      };
    }
  }

  if (REVIEW_HINT.test(text) && /\b(remind|ask|every|daily|weekly)\b/i.test(text)) {
    const lower = text.toLowerCase();
    const days = /\b(daily|every ?day)\b/.test(lower) ? 1 : /\b(weekly|every week|once a week)\b/.test(lower) ? 7 : Number(lower.match(/every (\d+) days/)?.[1]);
    if (days && days > 0 && days <= 60) {
      return { type: 'review', days, summary: `List check-in: ${days === 1 ? 'every day' : days === 7 ? 'every week' : `every ${days} days`}.` };
    }
  }
  return undefined;
}
