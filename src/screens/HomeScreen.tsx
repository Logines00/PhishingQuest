import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeScreenProps } from '../types/navigation';

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🎣</Text>
        <Text style={styles.title}>Phishing Quest</Text>
        <Text style={styles.tagline}>
          Apprends à détecter les emails frauduleux,{'\n'}un message à la fois.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => navigation.navigate('LevelSelect')}
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Choisir un niveau et commencer une partie"
        >
          <Text style={styles.playButtonLabel}>Jouer</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Stats')}
          style={({ pressed }) => [
            styles.statsButton,
            pressed && styles.statsButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Voir mes statistiques"
        >
          <Text style={styles.statsButtonLabel}>Mes statistiques</Text>
        </Pressable>

        <Text style={styles.hint}>3 niveaux · 30 emails</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tagline: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#22d3ee',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    minWidth: 200,
    alignItems: 'center',
  },
  playButtonPressed: {
    backgroundColor: '#06b6d4',
    transform: [{ scale: 0.98 }],
  },
  playButtonLabel: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 200,
    alignItems: 'center',
  },
  statsButtonPressed: {
    backgroundColor: '#1e293b',
  },
  statsButtonLabel: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    color: '#64748b',
    fontSize: 13,
  },
});
