import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import ReviewDeck from './ReviewDeck';
import { ContextId, Item } from '../types';
import { Button, CONTEXTS, EFFORTS, H, P, useTheme } from '../ui';

export default function ListScreen({ review, onReviewDone }: { review: boolean; onReviewDone: () => void }) {
  const { state } = useStore();
  const tasks = state.items.filter((i) => i.kind === 'task' && !i.setup && !i.doneAt);
  const done = state.items.filter((i) => i.kind === 'task' && !i.setup && i.doneAt);
  const [reviewing, setReviewing] = useState(review);

  if (reviewing) return <ReviewDeck onFinish={() => { setReviewing(false); onReviewDone(); }} />;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <H size={34}>Your list</H>
      <P soft style={{ marginTop: 4 }}>
        {tasks.length} things in here. You don't have to look at all of them. That's Doug's job.
      </P>
      <Button label="Swipe through a few" kind="calm" onPress={() => setReviewing(true)} style={{ marginTop: 14 }} />

      {(Object.keys(CONTEXTS) as ContextId[]).map((c) => {
        const group = tasks.filter((i) => i.context === c);
        if (!group.length) return null;
        return (
          <View key={c} style={{ marginTop: 22 }}>
            <H size={18}>
              {CONTEXTS[c].label}
            </H>
            {group.map((i) => (
              <Row key={i.id} item={i} />
            ))}
          </View>
        );
      })}

      {done.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <H size={18}>Done ({done.length})</H>
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
        style={[styles.check, { borderColor: t.strong, backgroundColor: done ? t.strong : 'transparent' }]}
      >
        {done && <Text style={{ color: t.bg, fontWeight: '900' }}>✓</Text>}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ color: done ? t.soft : t.ink, fontSize: 16, textDecorationLine: done ? 'line-through' : 'none' }}>
          {item.text}
        </Text>
        <Text style={{ color: t.soft, fontSize: 13, marginTop: 2 }}>
          {EFFORTS[item.effort].dots} {EFFORTS[item.effort].label}
          {item.place ? `  ·  ${item.place}` : ''}
          {snoozed ? '  ·  snoozed' : ''}
        </Text>
      </View>
      <Pressable accessibilityLabel={`Remove ${item.text}`} onPress={() => removeItem(item.id)} hitSlop={10}>
        <Text style={{ color: t.soft, fontSize: 18 }}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
