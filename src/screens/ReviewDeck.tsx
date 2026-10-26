import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useStore } from '../store';
import { Item } from '../types';
import { Button, Chip, CONTEXTS, EFFORTS, FONT, H, Label, P, useTheme } from '../ui';

const DAY = 24 * 60 * 60 * 1000;
const MAX_CARDS = 10;
const COMMIT = 100; // How far to drag before letting go counts.

type Choice = 'keep' | 'snooze' | 'letGo' | 'done';

const buzz = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};

/** Which way a drag points, once it's gone far enough (or flicked fast enough). */
function decide(dx: number, dy: number, vx = 0, vy = 0): Choice | null {
  if (dy < -COMMIT && Math.abs(dy) > Math.abs(dx)) return 'snooze';
  if (vy < -0.9 && dy < -40 && Math.abs(dy) > Math.abs(dx)) return 'snooze';
  if (dx > COMMIT || (vx > 0.9 && dx > 40)) return 'keep';
  if (dx < -COMMIT || (vx < -0.9 && dx < -40)) return 'letGo';
  return null;
}

/**
 * One card at a time. Swipe right to keep, up to snooze for a week, left to let it go.
 * Tap buttons do the same, and Undo puts back the last one.
 */
export default function ReviewDeck({ onFinish }: { onFinish: () => void }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { state, updateItem, removeItem, restoreItem, markReviewed } = useStore();
  const [queue] = useState(() =>
    state.items
      .filter((i) => i.kind === 'task' && !i.setup && !i.doneAt && !(i.snoozedUntil && i.snoozedUntil > Date.now()))
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, MAX_CARDS),
  );
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<{ choice: Choice; before: Item }[]>([]);
  const [still, setStill] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const armed = useRef<Choice | null>(null);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setStill).catch(() => {});
  }, []);

  const item = queue[index] && (state.items.find((i) => i.id === queue[index].id) ?? queue[index]);
  const next = queue[index + 1];

  const act = (choice: Choice) => {
    if (!item) return;
    setHistory((h) => [...h, { choice, before: item }]);
    if (choice === 'snooze') updateItem(item.id, { snoozedUntil: Date.now() + 7 * DAY });
    if (choice === 'letGo') removeItem(item.id);
    if (choice === 'done') updateItem(item.id, { doneAt: Date.now() });
    setIndex((n) => n + 1);
    pan.setValue({ x: 0, y: 0 });
    armed.current = null;
  };

  const fly = (choice: Choice) => {
    if (still || choice === 'done') return act(choice);
    const to = choice === 'keep' ? { x: width * 1.4, y: 0 } : choice === 'letGo' ? { x: -width * 1.4, y: 0 } : { x: 0, y: -900 };
    Animated.timing(pan, { toValue: to, duration: 220, useNativeDriver: false }).start(() => act(choice));
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    restoreItem(last.before);
    setHistory((h) => h.slice(0, -1));
    setIndex((n) => n - 1);
    pan.setValue({ x: 0, y: 0 });
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
        onPanResponderMove: (_, g) => {
          pan.setValue({ x: g.dx, y: g.dy });
          // A small tap of vibration the moment letting go would count.
          const choice = decide(g.dx, g.dy);
          if (choice !== armed.current) {
            armed.current = choice;
            if (choice) buzz();
          }
        },
        onPanResponderRelease: (_, g) => {
          const choice = decide(g.dx, g.dy, g.vx, g.vy);
          if (choice) fly(choice);
          else {
            armed.current = null;
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
          }
        },
        onPanResponderTerminate: () => Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start(),
      }),
    // Rebuilt per card so the release handler acts on the current one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item?.id, still, width],
  );

  if (!item) {
    const kept = history.filter((h) => h.choice === 'keep').length;
    const lighter = history.length - kept;
    return (
      <ScrollView contentContainerStyle={styles.wrap}>
        <H size={34}>All tidy.</H>
        <P soft style={{ marginTop: 8 }}>
          {queue.length === 0
            ? 'Nothing needs a look right now.'
            : lighter
              ? `You looked at ${queue.length} and made your list ${lighter} lighter.`
              : `You looked at ${queue.length}. All keepers.`}
        </P>
        <Button label="Finish" onPress={() => { markReviewed(); onFinish(); }} style={{ marginTop: 22 }} />
        {history.length > 0 && <Button label="Undo last" kind="quiet" onPress={undo} style={{ marginTop: 10 }} />}
      </ScrollView>
    );
  }

  const rotate = pan.x.interpolate({ inputRange: [-240, 0, 240], outputRange: ['-8deg', '0deg', '8deg'] });
  const keepOn = pan.x.interpolate({ inputRange: [0, COMMIT], outputRange: [0, 1], extrapolate: 'clamp' });
  const goOn = pan.x.interpolate({ inputRange: [-COMMIT, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const snoozeOn = pan.y.interpolate({ inputRange: [-COMMIT, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const grow = (v: Animated.AnimatedInterpolation<number>) => v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.1] });
  const age = Math.round((Date.now() - item.createdAt) / DAY);

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Label>{index + 1} of {queue.length}</Label>
        <Pressable accessibilityRole="button" onPress={() => { markReviewed(); onFinish(); }} hitSlop={10}>
          <Label>Stop for now</Label>
        </Pressable>
      </View>
      <H size={30} style={{ marginTop: 6 }}>Still want this?</H>

      <View style={styles.stage}>
        {next && (
          <View style={[styles.card, styles.behind, { backgroundColor: t.card, borderColor: t.line }]} />
        )}
        <Animated.View
          {...responder.panHandlers}
          accessible
          accessibilityLabel={`${item.text}. Swipe right to keep, up to snooze for a week, left to let it go.`}
          accessibilityActions={[
            { name: 'keep', label: 'Keep' },
            { name: 'snooze', label: 'Snooze a week' },
            { name: 'letGo', label: 'Let it go' },
          ]}
          onAccessibilityAction={(e) => fly(e.nativeEvent.actionName as Choice)}
          style={[
            styles.card,
            { backgroundColor: t.card, borderColor: t.line, transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] },
          ]}
        >
          <H size={26}>{item.text}</H>
          <View style={styles.chips}>
            <Chip label={CONTEXTS[item.context].label} />
            <Chip label={`${EFFORTS[item.effort].dots} ${EFFORTS[item.effort].label}`} />
            <Chip label={age === 0 ? 'Added today' : `Added ${age}d ago`} />
          </View>

          <Animated.Text style={[styles.tag, styles.tagRight, { color: t.ink, borderColor: t.ink, opacity: keepOn, transform: [{ scale: grow(keepOn) }] }]}>
            Keep →
          </Animated.Text>
          <Animated.Text style={[styles.tag, styles.tagLeft, { color: t.accent, borderColor: t.accent, opacity: goOn, transform: [{ scale: grow(goOn) }] }]}>
            ← Let go
          </Animated.Text>
          <Animated.Text style={[styles.tag, styles.tagTop, { color: t.soft, borderColor: t.soft, opacity: snoozeOn, transform: [{ scale: grow(snoozeOn) }] }]}>
            ↑ Snooze a week
          </Animated.Text>
        </Animated.View>
      </View>

      <View style={styles.buttons}>
        <Button label="← Let go" kind="quiet" onPress={() => fly('letGo')} style={styles.flex} />
        <Button label="↑ Snooze" kind="quiet" onPress={() => fly('snooze')} style={styles.flex} />
        <Button label="Keep →" kind="quiet" onPress={() => fly('keep')} style={styles.flex} />
      </View>
      <View style={styles.bottom}>
        <Pressable accessibilityRole="button" onPress={() => fly('done')} hitSlop={10}>
          <Text style={{ color: t.soft, fontFamily: FONT.regular, fontSize: 15 }}>Done already ✓</Text>
        </Pressable>
        {history.length > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel="Undo the last card" onPress={undo} hitSlop={10}>
            <Text style={{ color: t.ink, fontFamily: FONT.medium, fontSize: 15 }}>Undo</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, flex: 1, padding: 20 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stage: { flex: 1, justifyContent: 'center', minHeight: 300 },
  // userSelect stops a mouse drag from selecting the text in the web preview.
  card: { borderWidth: 1, borderRadius: 18, padding: 24, minHeight: 240, justifyContent: 'center', userSelect: 'none' },
  behind: { position: 'absolute', left: 8, right: 8, transform: [{ scale: 0.96 }], opacity: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: { position: 'absolute', fontFamily: FONT.mono, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', borderWidth: 1, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  tagRight: { top: 16, right: 16 },
  tagLeft: { top: 16, left: 16 },
  tagTop: { bottom: 16, alignSelf: 'center' },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  flex: { flex: 1, paddingHorizontal: 6 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingHorizontal: 4 },
});
