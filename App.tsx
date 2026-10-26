import { InterTight_300Light, InterTight_400Regular, InterTight_500Medium, useFonts } from '@expo-google-fonts/inter-tight';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import DougScreen from './src/screens/DougScreen';
import EventsScreen from './src/screens/EventsScreen';
import ListScreen from './src/screens/ListScreen';
import RemyScreen from './src/screens/RemyScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { StoreProvider } from './src/store';
import { Dragonfly, FONT, H, Label, useTheme } from './src/ui';

export type Tab = 'home' | 'remy' | 'doug' | 'list' | 'events' | 'settings';
export type Go = (tab: Tab, opts?: { review?: boolean }) => void;

function Home({ go }: { go: Go }) {
  const t = useTheme();
  const links: { id: Tab; label: string }[] = [
    { id: 'list', label: 'Tidy up' },
    { id: 'events', label: 'Events' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <View style={styles.home}>
      <View style={styles.brand}>
        <Dragonfly size={3} />
        <Text style={{ color: t.ink, fontFamily: FONT.regular, fontSize: 17 }}>Remy &amp; Doug</Text>
      </View>

      <View style={styles.center}>
        <H size={40} style={{ textAlign: 'center', marginBottom: 12 }}>what's on your mind?</H>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Add a thought for Remy to remember"
          onPress={() => go('remy')}
          style={({ pressed }) => [styles.big, { borderColor: t.line, backgroundColor: t.card, opacity: pressed ? 0.8 : 1 }]}
        >
          <Label>Remy remembers</Label>
          <Text style={[styles.bigText, { color: t.ink }]}>Tell Remy</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Get one thing to do right now"
          onPress={() => go('doug')}
          style={({ pressed }) => [styles.big, { borderColor: t.accent, backgroundColor: t.accent, opacity: pressed ? 0.85 : 1 }]}
        >
          <Label style={{ color: t.accentInk, opacity: 0.85 }}>Doug does</Label>
          <Text style={[styles.bigText, { color: t.accentInk }]}>Ask Doug ↗</Text>
        </Pressable>
      </View>

      <View style={styles.links}>
        {links.map((l) => (
          <Pressable key={l.id} accessibilityRole="link" onPress={() => go(l.id)} hitSlop={10}>
            <Label>{l.label}</Label>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Shell() {
  const t = useTheme();
  const scheme = useColorScheme();
  const [tab, setTab] = useState<Tab>('home');
  const [review, setReview] = useState(false);
  const go: Go = (next, opts) => {
    setReview(!!opts?.review);
    setTab(next);
  };

  // Android's back button returns home instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tab === 'home') return false;
      setTab('home');
      return true;
    });
    return () => sub.remove();
  }, [tab]);

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: t.bg }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {tab === 'home' ? (
        <Home go={go} />
      ) : (
        <View style={styles.fill}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={() => go('home')} hitSlop={12} style={styles.back}>
            <Text style={{ color: t.soft, fontFamily: FONT.regular, fontSize: 16 }}>← Home</Text>
          </Pressable>
          {tab === 'doug' && <DougScreen go={go} />}
          {tab === 'remy' && <RemyScreen />}
          {tab === 'list' && <ListScreen key={String(review)} review={review} onReviewDone={() => setReview(false)} />}
          {tab === 'events' && <EventsScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ InterTight_300Light, InterTight_400Regular, InterTight_500Medium, JetBrainsMono_400Regular });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  home: { flex: 1, paddingHorizontal: 20 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12 },
  center: { flex: 1, justifyContent: 'center', gap: 14 },
  big: { borderWidth: 1, borderRadius: 16, paddingVertical: 26, paddingHorizontal: 22, gap: 6 },
  bigText: { fontFamily: FONT.light, fontSize: 34, letterSpacing: -1 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 28, paddingBottom: 16 },
  back: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 2, alignSelf: 'flex-start' },
});
