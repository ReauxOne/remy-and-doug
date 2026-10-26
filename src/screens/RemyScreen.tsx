import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { parseThought } from '../parse';
import { parseSpokenSetting } from '../spoken';
import { useStore } from '../store';
import { ContextId, Effort, Item, Settings } from '../types';
import { Button, Card, Chip, CONTEXTS, EFFORTS, H, Label, P, useTheme } from '../ui';

export default function RemyScreen({ prefill }: { prefill?: string }) {
  const t = useTheme();
  const { state, addThought, updateItem, removeItem, updateSettings, completeSetup } = useStore();
  const [text, setText] = useState(prefill ?? '');
  const [lastId, setLastId] = useState<string | null>(null);
  // When a thought was really a setting ("my work hours are…"), what changed and how to undo it.
  const [setting, setSetting] = useState<{ summary: string; before: Partial<Settings> } | null>(null);
  const last: Item | undefined = state.items.find((i) => i.id === lastId);

  const save = () => {
    if (!text.trim()) return;
    const spoken = parseSpokenSetting(text, state.settings.workHours);
    if (spoken) {
      const before = spoken.type === 'workHours' ? { workHours: state.settings.workHours } : { reviewEveryDays: state.settings.reviewEveryDays };
      updateSettings(spoken.type === 'workHours' ? { workHours: spoken.workHours } : { reviewEveryDays: spoken.days });
      setSetting({ summary: spoken.summary, before });
      setLastId(null);
    } else {
      const item = addThought(parseThought(text, state.events));
      completeSetup('firstThought');
      setLastId(item.id);
      setSetting(null);
    }
    setText('');
  };

  const eventOf = (id?: string) => state.events.find((e) => e.id === id);

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <H size={34}>Tell Remy</H>
      <P soft style={{ marginTop: 4 }}>Get it out of your head. Remy will sort it.</P>

      <Card style={styles.gap}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="e.g. pick up washer fluid, or my work hours are 9 to 5"
          placeholderTextColor={t.soft}
          multiline
          autoFocus
          onSubmitEditing={save}
          submitBehavior="submit"
          onKeyPress={(e) => {
            // On web, multiline inputs ignore submitBehavior, so Enter saves here (Shift+Enter still adds a line).
            const ev = e.nativeEvent as { key: string; shiftKey?: boolean };
            if (Platform.OS === 'web' && ev.key === 'Enter' && !ev.shiftKey) {
              e.preventDefault();
              save();
            }
          }}
          returnKeyType="done"
          style={[styles.input, { color: t.ink }]}
        />
        <Button label="Remember this" onPress={save} style={{ marginTop: 12 }} />
        <P soft style={{ marginTop: 10, fontSize: 13, textAlign: 'center' }}>
          Tip: tap the microphone on your keyboard to just say it.
        </P>
      </Card>

      {setting && (
        <Card alt style={styles.gap}>
          <Label>Remy will remember</Label>
          <H size={20} style={{ marginTop: 4 }}>{setting.summary}</H>
          <P soft style={{ marginTop: 8 }}>Saved to your settings. Say it again anytime to change it.</P>
          <Button
            label="Undo"
            kind="quiet"
            onPress={() => {
              updateSettings(setting.before);
              setSetting(null);
            }}
            style={{ marginTop: 14 }}
          />
        </Card>
      )}

      {last && (
        <Card alt style={styles.gap}>
          <Label>Remy's got it</Label>
          <H size={20} style={{ marginTop: 4 }}>{last.text}</H>
          {last.kind === 'note' && eventOf(last.eventId) ? (
            <P style={{ marginTop: 8 }}>
              Saved as a note for {eventOf(last.eventId)!.title}. I'll bring it back right before.
            </P>
          ) : (
            <>
              <P soft style={{ marginTop: 10 }}>Filed under (tap to change):</P>
              <View style={styles.row}>
                {(Object.keys(CONTEXTS) as ContextId[]).map((c) => (
                  <Chip
                    key={c}
                    label={CONTEXTS[c].label}
                    active={last.context === c}
                    onPress={() => updateItem(last.id, { context: c })}
                  />
                ))}
              </View>
              <P soft style={{ marginTop: 10 }}>Effort:</P>
              <View style={styles.row}>
                {(Object.keys(EFFORTS) as Effort[]).map((e) => (
                  <Chip
                    key={e}
                    label={`${EFFORTS[e].dots} ${EFFORTS[e].label}`}
                    active={last.effort === e}
                    onPress={() => updateItem(last.id, { effort: e })}
                  />
                ))}
              </View>
              {last.place && <P soft style={{ marginTop: 10 }}>Belongs at: {last.place}</P>}
            </>
          )}
          {state.events.length > 0 && (
            <>
              <P soft style={{ marginTop: 10 }}>
                {last.kind === 'note' ? 'Tap the event to make it a regular to-do instead:' : 'Save it for an event instead?'}
              </P>
              <View style={styles.row}>
                {state.events.map((ev) => (
                  <Chip
                    key={ev.id}
                    label={ev.title}
                    active={last.eventId === ev.id}
                    onPress={() =>
                      updateItem(
                        last.id,
                        last.eventId === ev.id ? { eventId: undefined, kind: 'task' } : { eventId: ev.id, kind: 'note' },
                      )
                    }
                  />
                ))}
              </View>
            </>
          )}
          <Button
            label="Undo"
            kind="quiet"
            onPress={() => {
              removeItem(last.id);
              setLastId(null);
            }}
            style={{ marginTop: 14 }}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40 },
  gap: { marginTop: 16 },
  input: { fontSize: 18, minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  small: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
