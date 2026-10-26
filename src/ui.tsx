import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, useColorScheme, View, ViewStyle } from 'react-native';
import { ContextId, Effort } from './types';

// Matches remyanddoug.com: greys, with one red-orange accent for Doug and key moments.
const light = {
  bg: '#FAFAF9',
  card: '#FFFFFF',
  cardAlt: '#F2F2F0',
  ink: '#1C1C1B',
  soft: '#7A7A77',
  faint: '#B9B9B5',
  line: '#E7E7E4',
  strong: '#1C1C1B',
  accent: '#D9411B',
  accentInk: '#FFFFFF',
  calm: '#4A4A47',
  danger: '#D9411B',
};

const dark: typeof light = {
  bg: '#111111',
  card: '#181817',
  cardAlt: '#222221',
  ink: '#EDEDEA',
  soft: '#8E8E8A',
  faint: '#4A4A47',
  line: '#262625',
  strong: '#EDEDEA',
  accent: '#F2552B',
  accentInk: '#FFFFFF',
  calm: '#3A3A38',
  danger: '#F2552B',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Font families loaded in App.tsx. */
export const FONT = {
  light: 'InterTight_300Light',
  regular: 'InterTight_400Regular',
  medium: 'InterTight_500Medium',
  mono: 'JetBrainsMono_400Regular',
};

export const CONTEXTS: Record<ContextId, { label: string; emoji: string }> = {
  work: { label: 'Work', emoji: '' },
  home: { label: 'Home', emoji: '' },
  errands: { label: 'Errands', emoji: '' },
  people: { label: 'People', emoji: '' },
  anything: { label: 'Anytime', emoji: '' },
};

export const EFFORTS: Record<Effort, { label: string; dots: string }> = {
  low: { label: 'Quick', dots: '■□□' },
  medium: { label: 'Some', dots: '■■□' },
  high: { label: 'Big', dots: '■■■' },
};

/** The dragonfly logo, drawn as pixels. */
const MARK = [
  '.....#.#.....',
  '......#......',
  '####.###.####',
  '.###########.',
  '####.###.####',
  '.###..#..###.',
  '......#......',
  '......#......',
  '......#......',
  '......#......',
];

export function Dragonfly({ size = 4, color }: { size?: number; color?: string }) {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel="Remy & Doug dragonfly" style={{ width: size * 13, height: size * 10 }}>
      {MARK.map((row, y) =>
        [...row].map((c, x) =>
          c === '#' ? (
            <View
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * size,
                top: y * size,
                width: size * 0.86,
                height: size * 0.86,
                backgroundColor: color ?? t.ink,
              }}
            />
          ) : null,
        ),
      )}
    </View>
  );
}

export function Card({ children, style, alt }: { children: ReactNode; style?: StyleProp<ViewStyle>; alt?: boolean }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: alt ? t.cardAlt : t.card, borderColor: t.line }, style]}>{children}</View>
  );
}

export function H({ children, size = 26, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return (
    <Text style={[{ color: t.ink, fontSize: size, fontFamily: size >= 24 ? FONT.light : FONT.regular, letterSpacing: -size * 0.03 }, style]}>
      {children}
    </Text>
  );
}

export function P({ children, soft, style }: { children: ReactNode; soft?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: soft ? t.soft : t.ink, fontSize: 16, lineHeight: 23, fontFamily: FONT.regular }, style]}>{children}</Text>;
}

/** Small uppercase label, like the website's section markers. */
export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: t.soft, fontSize: 11, letterSpacing: 1, fontFamily: FONT.mono, textTransform: 'uppercase' }, style]}>{children}</Text>;
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
  const fg = kind === 'quiet' ? t.ink : kind === 'primary' ? t.accentInk : '#fff';
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
      <Text style={{ color: fg, fontSize: 16, fontFamily: FONT.medium }}>{label}</Text>
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
      style={[styles.chip, { backgroundColor: active ? t.strong : 'transparent', borderColor: active ? t.strong : t.line }]}
    >
      <Text style={{ color: active ? t.bg : t.ink, fontSize: 14, fontFamily: FONT.regular }}>{label.trim()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 18 },
  button: { borderRadius: 10, borderWidth: 1, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center' },
  chip: { borderRadius: 8, borderWidth: 1, paddingVertical: 6, paddingHorizontal: 11 },
});
