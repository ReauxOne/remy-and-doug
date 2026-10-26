import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ParsedThought } from './parse';
import { BBEvent, BBState, Item, Settings } from './types';

// Kept from the BrindleBrandle days so existing lists carry over.
const KEY = 'brindlebrandle/state/v1';
const DAY = 24 * 60 * 60 * 1000;

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function isoInDays(days: number) {
  const d = new Date(Date.now() + days * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Starter data so the app has something to show on first open. */
export function sampleState(): BBState {
  const now = Date.now();
  const conference: BBEvent = { id: newId(), title: 'Parent-teacher conference', date: isoInDays(12), emoji: '🍎' };
  const item = (text: string, extra: Partial<Item>): Item => ({
    id: newId(),
    text,
    kind: 'task',
    context: 'anything',
    effort: 'low',
    createdAt: now - Math.random() * 6 * DAY,
    skips: 0,
    ...extra,
  });
  return {
    events: [conference],
    items: [
      item('Pick up washer fluid', { context: 'errands', place: 'auto parts store' }),
      item('Reply to the vendor email', { context: 'work' }),
      item('Draft the Q4 project plan', { context: 'work', effort: 'high' }),
      item('Switch the laundry', { context: 'home' }),
      item('Declutter the hall closet', { context: 'home', effort: 'high' }),
      item('Text Mom back about Sunday', { context: 'people' }),
      item('Ask about the reading level', { kind: 'note', eventId: conference.id, context: 'people', createdAt: now - 120 * DAY }),
      item('Mention the bus pickup mix-up', { kind: 'note', eventId: conference.id, context: 'people', createdAt: now - 40 * DAY }),
      item('Ask how group work is going', { kind: 'note', eventId: conference.id, context: 'people', createdAt: now - 9 * DAY }),
    ],
    settings: {
      workHours: { days: [1, 2, 3, 4, 5], startHour: 6, endHour: 16 },
      reviewEveryDays: 3,
      lastReviewAt: now - 5 * DAY,
    },
  };
}

interface Store {
  state: BBState;
  ready: boolean;
  addThought: (t: ParsedThought) => Item;
  updateItem: (id: string, patch: Partial<Item>) => void;
  removeItem: (id: string) => void;
  addEvent: (e: Omit<BBEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markReviewed: () => void;
  reset: (to: 'samples' | 'empty') => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BBState>(sampleState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setState(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const store = useMemo<Store>(
    () => ({
      state,
      ready,
      addThought: (t) => {
        const item: Item = { id: newId(), createdAt: Date.now(), skips: 0, ...t };
        setState((s) => ({ ...s, items: [item, ...s.items] }));
        return item;
      },
      updateItem: (id, patch) =>
        setState((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      removeItem: (id) => setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) })),
      addEvent: (e) => setState((s) => ({ ...s, events: [...s.events, { id: newId(), ...e }] })),
      removeEvent: (id) =>
        setState((s) => ({
          ...s,
          events: s.events.filter((e) => e.id !== id),
          items: s.items.map((i) => (i.eventId === id ? { ...i, eventId: undefined, kind: 'task' } : i)),
        })),
      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      markReviewed: () => setState((s) => ({ ...s, settings: { ...s.settings, lastReviewAt: Date.now() } })),
      reset: (to) =>
        setState(
          to === 'samples'
            ? sampleState()
            : { items: [], events: [], settings: { ...sampleState().settings, lastReviewAt: Date.now() } },
        ),
    }),
    [state, ready],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be inside StoreProvider');
  return s;
}
