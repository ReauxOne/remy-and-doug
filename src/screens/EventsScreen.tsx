import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { daysUntil, whenLabel } from '../doug';
import { useStore } from '../store';
import { BBEvent } from '../types';
import { Button, Card, Chip, H, P, useTheme } from '../ui';

const DAY = 24 * 60 * 60 * 1000;
const QUICK_DATES: { label: string; days: number }[] = [
  { label: 'Tomorrow', days: 1 },
  { label: 'Next week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
  { label: 'In a month', days: 30 },
];

function isoInDays(days: number) {
  const d = new Date(Date.now() + days * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function EventsScreen() {
  const t = useTheme();
  const { state, addEvent } = useStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(isoInDays(7));
  const events = [...state.events].sort((a, b) => a.date.localeCompare(b.date));
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <H size={34}>Events</H>
      <P soft style={{ marginTop: 4 }}>
        Save thoughts toward something coming up. I'll hand them all back right before it.
      </P>

      {events.map((ev) => (
        <EventCard key={ev.id} event={ev} />
      ))}

      {adding ? (
        <Card style={styles.gap}>
          <H size={18}>New event</H>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Dentist, School IEP meeting"
            placeholderTextColor={t.soft}
            style={[styles.input, { color: t.ink, borderColor: t.line }]}
          />
          <View style={styles.row}>
            {QUICK_DATES.map((q) => (
              <Chip key={q.label} label={q.label} active={date === isoInDays(q.days)} onPress={() => setDate(isoInDays(q.days))} />
            ))}
          </View>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={t.soft}
            style={[styles.input, { color: t.ink, borderColor: validDate ? t.line : t.danger }]}
          />
          <Button
            label="Add event"
            onPress={() => {
              if (!title.trim() || !validDate) return;
              addEvent({ title: title.trim(), date });
              setTitle('');
              setAdding(false);
            }}
            style={{ marginTop: 12 }}
          />
          <Button label="Cancel" kind="quiet" onPress={() => setAdding(false)} style={{ marginTop: 8, borderWidth: 0 }} />
        </Card>
      ) : (
        <Button label="+ Add an event" kind="quiet" onPress={() => setAdding(true)} style={styles.gap} />
      )}
    </ScrollView>
  );
}

function EventCard({ event }: { event: BBEvent }) {
  const t = useTheme();
  const { state, addThought, updateItem, removeEvent } = useStore();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const notes = state.items.filter((i) => i.eventId === event.id && !i.doneAt);
  const days = daysUntil(event.date, new Date());

  const addNote = () => {
    if (!note.trim()) return;
    addThought({ text: note.trim(), kind: 'note', context: 'anything', effort: 'low', eventId: event.id });
    setNote('');
  };

  return (
    <Card style={styles.gap}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
<H size={20}>{event.title}</H>
        <P soft style={{ marginTop: 4 }}>
          {prettyDate(event.date)} · {whenLabel(days)} · {notes.length} {notes.length === 1 ? 'note' : 'notes'} {open ? '▴' : '▾'}
        </P>
      </Pressable>
      {open && (
        <View style={{ marginTop: 10 }}>
          {notes.map((n) => (
            <View key={n.id} style={[styles.note, { borderColor: t.line }]}>
              <Text style={{ color: t.ink, fontSize: 16, flex: 1 }}>• {n.text}</Text>
              <Pressable onPress={() => updateItem(n.id, { doneAt: Date.now() })} accessibilityLabel={`Mark ${n.text} covered`} hitSlop={8}>
                <Text style={{ color: t.calm, fontWeight: '700' }}>covered</Text>
              </Pressable>
            </View>
          ))}
          {!notes.length && <P soft>No notes yet. Add questions as they come to you.</P>}
          <TextInput
            value={note}
            onChangeText={setNote}
            onSubmitEditing={addNote}
            placeholder="Add a note or question…"
            placeholderTextColor={t.soft}
            returnKeyType="done"
            style={[styles.input, { color: t.ink, borderColor: t.line }]}
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button label="Add note" kind="calm" onPress={addNote} style={{ flex: 1 }} />
            <Button label="Remove event" kind="quiet" onPress={() => removeEvent(event.id)} style={{ flex: 1 }} />
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  gap: { marginTop: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  input: { fontSize: 16, borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
});
