import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { pickOne, daysSinceReview, isWorkTime, reviewDue, Suggestion, whenLabel } from '../doug';
import { useStore } from '../store';
import { Energy } from '../types';
import { Button, Card, Chip, CONTEXTS, EFFORTS, H, Label, P, useTheme } from '../ui';
import type { Go } from '../../App';

const ENERGY: { id: Energy; label: string }[] = [
  { id: 'low', label: 'Running low' },
  { id: 'medium', label: 'Some' },
  { id: 'full', label: 'Full tank' },
];

const CHEERS = ["Nice. That's one off your plate.", 'Done! Your brain just got a little quieter.', 'Look at you go.', 'Checked off. Proud of you.'];

function greeting(now: Date) {
  const h = now.getHours();
  if (h < 5) return 'Up late, friend?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DougScreen({ go }: { go: Go }) {
  const t = useTheme();
  const { state, updateItem } = useStore();
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [cheer, setCheer] = useState<string | null>(null);
  const now = new Date();
  const working = isWorkTime(state.settings.workHours, now);

  const suggestion: Suggestion | null = useMemo(
    () => (energy ? pickOne(state, energy, new Date(), passed) : null),
    [state, energy, passed],
  );

  const pass = (id: string) => setPassed((p) => new Set(p).add(id));

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <P soft>{greeting(now)}</P>
      <H size={34}>Ask Doug</H>
      <View style={styles.row}>
        <Chip label={working ? 'Work hours: work stuff only' : 'Off the clock: no work stuff'} />
      </View>

      {reviewDue(state, now) && (
        <Card alt style={styles.gap}>
          <P>
            When did you last look over your list? It's been {daysSinceReview(state, now)} days.
          </P>
          <Button label="Tidy for 2 minutes" kind="calm" onPress={() => go('list', { review: true })} style={styles.btnTop} />
        </Card>
      )}

      <Card style={styles.gap}>
        <H size={20}>How much gas do you have?</H>
        <View style={[styles.row, { marginTop: 12 }]}>
          {ENERGY.map((e) => (
            <Chip
              key={e.id}
              label={e.label}
              active={energy === e.id}
              onPress={() => {
                setEnergy(e.id);
                setPassed(new Set());
                setCheer(null);
              }}
            />
          ))}
        </View>
      </Card>

      {cheer && (
        <Card alt style={styles.gap}>
          <P style={{ fontWeight: '700' }}>{cheer}</P>
        </Card>
      )}

      {suggestion?.type === 'task' && (
        <Card style={[styles.gap, styles.hero, { borderColor: t.accent }]}>
          <Label>Doug says</Label>
          <H size={26} style={{ marginTop: 4 }}>{suggestion.item.text}</H>
          <View style={[styles.row, { marginTop: 10 }]}>
            <Chip label={`${CONTEXTS[suggestion.item.context].emoji} ${CONTEXTS[suggestion.item.context].label}`} />
            <Chip label={`${EFFORTS[suggestion.item.effort].dots} ${EFFORTS[suggestion.item.effort].label}`} />
            {suggestion.item.place && <Chip label={`At: ${suggestion.item.place}`} />}
          </View>
          <P soft style={{ marginTop: 12 }}>{suggestion.reason}</P>
          {suggestion.item.setup ? (
            <Button
              label="Do it now"
              onPress={() => {
                const id = suggestion.item.setup;
                if (id === 'workHours') go('remy', { prefill: 'My work hours are ' });
                else if (id === 'firstThought') go('remy');
                else go('list', { review: true });
              }}
              style={styles.btnTop}
            />
          ) : (
            <Button
              label="Done ✓"
              onPress={() => {
                updateItem(suggestion.item.id, { doneAt: Date.now() });
                setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
              }}
              style={styles.btnTop}
            />
          )}
          <View style={[styles.row, { marginTop: 10 }]}>
            <Button
              label="Not now"
              kind="quiet"
              style={styles.flex}
              onPress={() => {
                updateItem(suggestion.item.id, { skips: suggestion.item.skips + 1 });
                pass(suggestion.item.id);
                setCheer(null);
              }}
            />
            <Button
              label="Tomorrow"
              kind="quiet"
              style={styles.flex}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setHours(24, 0, 0, 0);
                updateItem(suggestion.item.id, { snoozedUntil: tomorrow.getTime() });
                setCheer('Okay, see you tomorrow on that one.');
              }}
            />
          </View>
        </Card>
      )}

      {suggestion?.type === 'event' && (
        <Card style={[styles.gap, styles.hero, { borderColor: t.calm }]}>
          <Label>Coming up {whenLabel(suggestion.days)}</Label>
          <H size={24} style={{ marginTop: 4 }}>
            {suggestion.event.title}
          </H>
          <P soft style={{ marginTop: 8 }}>{suggestion.reason}</P>
          {suggestion.notes.map((n) => (
            <P key={n.id} style={{ marginTop: 8 }}>• {n.text}</P>
          ))}
          <Button label="Got it, what's next?" kind="calm" onPress={() => pass(suggestion.event.id)} style={styles.btnTop} />
        </Card>
      )}

      {suggestion?.type === 'empty' && (
        <Card alt style={styles.gap}>
          <P>{suggestion.reason}</P>
          <Button label="Tell Remy something" kind="quiet" onPress={() => go('remy')} style={styles.btnTop} />
        </Card>
      )}

      {!energy && <P soft style={[styles.gap, { textAlign: 'center' }]}>Pick one and I'll hand you one thing. Just one.</P>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  gap: { marginTop: 16 },
  hero: { borderWidth: 2 },
  small: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  btnTop: { marginTop: 16 },
  flex: { flex: 1 },
});
