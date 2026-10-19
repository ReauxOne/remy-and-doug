import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, useColorScheme, View, ViewStyle } from 'react-native';
import { ContextId, Effort } from './types';

const light = {
  bg: '#FBF6EE',
  card: '#FFFFFF',
  cardAlt: '#F4EBDD',
  ink: '#2E2620',
  soft: '#7B6E62',
  line: '#E8DDCD',
  brindle: '#7A5230',
  accent: '#E39B32',
  accentInk: '#2E2010',
  calm: '#3E8C84',
  danger: '#B5523B',
};

const dark: typeof light = {
  bg: '#1A1613',
  card: '#26201B',
  cardAlt: '#312922',
  ink: '#F3EBDF',
  soft: '#B3A594',
  line: '#3D342C',
  brindle: '#D2A274',
  accent: '#F0AE4A',
  accentInk: '#2E2010',
  calm: '#6CC0B6',
  danger: '#E2836B',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const CONTEXTS: Record<ContextId, { label: string; emoji: string }> = {
  work: { label: 'Work', emoji: '💼' },
  home: { label: 'Home', emoji: '🏡' },
  errands: { label: 'Errands', emoji: '🛒' },
  people: { label: 'People', emoji: '💬' },
  anything: { label: 'Anytime', emoji: '✨' },
};

export const EFFORTS: Record<Effort, { label: string; dots: string }> = {
  low: { label: 'Quick', dots: '●○○' },
  medium: { label: 'Some', dots: '●●○' },
  high: { label: 'Big', dots: '●●●' },
};

export function Card({ children, style, alt }: { children: ReactNode; style?: StyleProp<ViewStyle>; alt?: boolean }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: alt ? t.cardAlt : t.card, borderColor: t.line }, style]}>{children}</View>
  );
}

export function H({ children, size = 26, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: t.ink, fontSize: size, fontWeight: '800', letterSpacing: -0.4 }, style]}>{children}</Text>;
}

export function P({ children, soft, style }: { children: ReactNode; soft?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: soft ? t.soft : t.ink, fontSize: 16, lineHeight: 22 }, style]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'quiet' | 'calm';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = kind === 'primary' ? t.accent : kind === 'calm' ? t.calm : 'transparent';
  const fg = kind === 'primary' ? t.accentInk : kind === 'calm' ? '#fff' : t.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: kind === 'quiet' ? t.line : bg, opacity: pressed ? 0.75 : 1 },
        style,
      ]}
    >
      <Text style={{ color: fg, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.chip, { backgroundColor: active ? t.brindle : t.cardAlt, borderColor: active ? t.brindle : t.line }]}
    >
      <Text style={{ color: active ? t.bg : t.ink, fontSize: 14, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 18 },
  button: { borderRadius: 999, borderWidth: 1.5, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center' },
  chip: { borderRadius: 999, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 12 },
});
