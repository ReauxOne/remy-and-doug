import { ScrollView, StyleSheet, View } from 'react-native';
import { useStore } from '../store';
import { Button, Card, Chip, H, P } from '../ui';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const REVIEW = [
  { label: 'Daily', days: 1 },
  { label: 'Every 3 days', days: 3 },
  { label: 'Weekly', days: 7 },
];

function hourLabel(h: number) {
  const suffix = h < 12 || h === 24 ? 'am' : 'pm';
  const n = h % 12 === 0 ? 12 : h % 12;
  return `${n}${suffix}`;
}

export default function SettingsScreen() {
  const { state, updateSettings, reset } = useStore();
  const wh = state.settings.workHours;
  const setWh = (patch: Partial<typeof wh>) => updateSettings({ workHours: { ...wh, ...patch } });

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <H size={34}>Settings</H>

      <Card style={styles.gap}>
        <H size={18}>💼 Work hours</H>
        <P soft style={{ marginTop: 4 }}>During these hours Doug only suggests work. Outside them, work stays hidden.</P>
        <View style={styles.row}>
          {DAYS.map((d, i) => (
            <Chip
              key={d}
              label={d}
              active={wh.days.includes(i)}
              onPress={() => setWh({ days: wh.days.includes(i) ? wh.days.filter((x) => x !== i) : [...wh.days, i].sort() })}
            />
          ))}
        </View>
        <Stepper label="Start" value={wh.startHour} onChange={(v) => setWh({ startHour: Math.min(v, wh.endHour - 1) })} />
        <Stepper label="End" value={wh.endHour} onChange={(v) => setWh({ endHour: Math.max(v, wh.startHour + 1) })} />
      </Card>

      <Card style={styles.gap}>
        <H size={18}>🧺 List check-in</H>
        <P soft style={{ marginTop: 4 }}>How often should I ask when you last looked over your list?</P>
        <View style={styles.row}>
          {REVIEW.map((r) => (
            <Chip key={r.label} label={r.label} active={state.settings.reviewEveryDays === r.days} onPress={() => updateSettings({ reviewEveryDays: r.days })} />
          ))}
        </View>
      </Card>

      <Card alt style={styles.gap}>
        <H size={18}>🌱 Coming in the real app</H>
        <P soft style={{ marginTop: 6 }}>
          📍 Reminders when you're near a store{'\n'}🔔 Notifications{'\n'}📆 Events pulled from your calendar{'\n'}🗣️ "Hey Siri, tell Remy…"{'\n'}🤖 Smarter AI sorting{'\n'}☁️ Sync across devices
        </P>
      </Card>

      <Card style={styles.gap}>
        <H size={18}>Start over</H>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Button label="Load samples" kind="quiet" onPress={() => reset('samples')} style={{ flex: 1 }} />
          <Button label="Clear everything" kind="quiet" onPress={() => reset('empty')} style={{ flex: 1 }} />
        </View>
      </Card>
    </ScrollView>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.stepper}>
      <P style={{ flex: 1, fontWeight: '600' }}>{label}</P>
      <Button label="–" kind="quiet" onPress={() => onChange(Math.max(0, value - 1))} style={styles.stepBtn} />
      <P style={{ width: 64, textAlign: 'center', fontWeight: '700' }}>{hourLabel(value)}</P>
      <Button label="+" kind="quiet" onPress={() => onChange(Math.min(24, value + 1))} style={styles.stepBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  gap: { marginTop: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  stepBtn: { paddingVertical: 6, paddingHorizontal: 16 },
});
