import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BrandleScreen from './src/screens/BrandleScreen';
import BrindleScreen from './src/screens/BrindleScreen';
import EventsScreen from './src/screens/EventsScreen';
import ListScreen from './src/screens/ListScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { StoreProvider } from './src/store';
import { useTheme } from './src/ui';

export type Tab = 'brindle' | 'brandle' | 'list' | 'events' | 'settings';
export type Go = (tab: Tab, opts?: { review?: boolean }) => void;

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'brindle', label: 'Brindle', icon: '🐾' },
  { id: 'brandle', label: 'Brandle', icon: '✍️' },
  { id: 'list', label: 'List', icon: '📋' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function Shell() {
  const t = useTheme();
  const scheme = useColorScheme();
  const [tab, setTab] = useState<Tab>('brindle');
  const [review, setReview] = useState(false);
  const go: Go = (next, opts) => {
    setReview(!!opts?.review);
    setTab(next);
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: t.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.fill}>
        {tab === 'brindle' && <BrindleScreen go={go} />}
        {tab === 'brandle' && <BrandleScreen />}
        {tab === 'list' && <ListScreen key={String(review)} review={review} onReviewDone={() => setReview(false)} />}
        {tab === 'events' && <EventsScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <SafeAreaView edges={['bottom']} style={[styles.tabBar, { backgroundColor: t.card, borderColor: t.line }]}>
        {TABS.map((x) => {
          const active = x.id === tab;
          return (
            <Pressable
              key={x.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => go(x.id)}
              style={styles.tab}
            >
              <Text style={{ fontSize: 22, opacity: active ? 1 : 0.55 }}>{x.icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: active ? '800' : '500', color: active ? t.brindle : t.soft, marginTop: 2 }}>
                {x.label}
              </Text>
            </Pressable>
          );
        })}
      </SafeAreaView>
    </SafeAreaView>
  );
}

export default function App() {
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
  tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 6 },
});
