import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import { ContextId, Item } from '../types';
import { Button, Card, Chip, CONTEXTS, EFFORTS, H, P, useTheme } from '../ui';

const DAY = 24 * 60 * 60 * 1000;

export default function ListScreen({ review, onReviewDone }: { review: boolean; onReviewDone: () => void }) {
  const { state } = useStore();
  const tasks = state.items.filter((i) => i.kind === 'task' && !i.doneAt);
  const done = state.items.filter((i) => i.kind === 'task' && i.doneAt);
  const [reviewing, setReviewing] = useState(review);

  if (reviewing) return <Review onFinish={() => { setReviewing(false); onReviewDone(); }} />;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <H size={34}>Your list</H>
      <P soft style={{ marginTop: 4 }}>
        {tasks.length} things in here. You don't have to look at all of them. That's Brindle's job.
      </P>
      <Button label="🧺 Review in 2 minutes" kind="calm" onPress={() => setReviewing(true)} style={{ marginTop: 14 }} />

      {(Object.keys(CONTEXTS) as ContextId[]).map((c) => {
        const group = tasks.filter((i) => i.context === c);
        if (!group.length) return null;
        return (
          <View key={c} style={{ marginTop: 22 }}>
            <H size={18}>
              {CONTEXTS[c].emoji} {CONTEXTS[c].label}
            </H>
            {group.map((i) => (
              <Row key={i.id} item={i} />
            ))}
          </View>
        );
      })}

      {done.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <H size={18}>🎉 Done ({done.length})</H>
          {done.slice(0, 15).map((i) => (
            <Row key={i.id} item={i} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Row({ item }: { item: Item }) {
  const t = useTheme();
  const { updateItem, removeItem } = useStore();
  const done = !!item.doneAt;
  const snoozed = item.snoozedUntil && item.snoozedUntil > Date.now();
  return (
    <View style={[styles.row, { borderColor: t.line }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={item.text}
        onPress={() => updateItem(item.id, { doneAt: done ? undefined : Date.now() })}
        style={[styles.check, { borderColor: t.brindle, backgroundColor: done ? t.brindle : 'transparent' }]}
      >
        {done && <Text style={{ color: t.bg, fontWeight: '900' }}>✓</Text>}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ color: done ? t.soft : t.ink, fontSize: 16, textDecorationLine: done ? 'line-through' : 'none' }}>
          {item.text}
        </Text>
        <Text style={{ color: t.soft, fontSize: 13, marginTop: 2 }}>
          {EFFORTS[item.effort].dots} {EFFORTS[item.effort].label}
          {item.place ? `  ·  📍 ${item.place}` : ''}
          {snoozed ? '  ·  💤 snoozed' : ''}
        </Text>
      </View>
      <Pressable accessibilityLabel={`Remove ${item.text}`} onPress={() => removeItem(item.id)} hitSlop={10}>
        <Text style={{ color: t.soft, fontSize: 18 }}>✕</Text>
      </Pressable>
    </View>
  );
}

/** One item at a time: keep, snooze, done or drop. */
function Review({ onFinish }: { onFinish: () => void }) {
  const { state, updateItem, removeItem, markReviewed } = useStore();
  const [queue] = useState(() =>
    state.items.filter((i) => i.kind === 'task' && !i.doneAt).sort((a, b) => a.createdAt - b.createdAt).map((i) => i.id),
  );
  const [index, setIndex] = useState(0);
  const item = state.items.find((i) => i.id === queue[index]);
  const next = () => setIndex((n) => n + 1);

  if (index >= queue.length || !item) {
    return (
      <ScrollView contentContainerStyle={styles.wrap}>
        <H size={30}>All tidy ✨</H>
        <P soft style={{ marginTop: 8 }}>You looked at {queue.length} things. That's real work for a busy brain.</P>
        <Button label="Back to my list" onPress={() => { markReviewed(); onFinish(); }} style={{ marginTop: 20 }} />
      </ScrollView>
    );
  }

  const age = Math.round((Date.now() - item.createdAt) / DAY);
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <P soft>
        {index + 1} of {queue.length}
      </P>
      <H size={28} style={{ marginTop: 4 }}>Still want this?</H>
      <Card style={{ marginTop: 16 }}>
        <H size={22}>{item.text}</H>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          <Chip label={`${CONTEXTS[item.context].emoji} ${CONTEXTS[item.context].label}`} />
          <Chip label={age === 0 ? 'Added today' : `Added ${age}d ago`} />
        </View>
      </Card>
      <Button label="Keep it" onPress={next} style={{ marginTop: 18 }} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Button label="Done already" kind="quiet" style={{ flex: 1 }} onPress={() => { updateItem(item.id, { doneAt: Date.now() }); next(); }} />
        <Button label="Next week" kind="quiet" style={{ flex: 1 }} onPress={() => { updateItem(item.id, { snoozedUntil: Date.now() + 7 * DAY }); next(); }} />
      </View>
      <Button label="Let it go 🍃" kind="quiet" onPress={() => { removeItem(item.id); next(); }} style={{ marginTop: 10 }} />
      <Button label="Stop for now" kind="quiet" onPress={() => { markReviewed(); onFinish(); }} style={{ marginTop: 24, borderWidth: 0 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
