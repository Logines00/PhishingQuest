import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LEVEL_META } from '../constants/levels';
import { useProgress } from '../hooks/useProgress';
import type { LevelSelectScreenProps } from '../types/navigation';
import { loadEmailsByDifficulty } from '../utils/emails';
import { ALL_LEVELS, MAX_STARS, POINTS_PER_CORRECT } from '../utils/progress';

export function LevelSelectScreen({ navigation }: LevelSelectScreenProps) {
  const { progress, loading, isUnlocked, refresh } = useProgress();

  // je recharge à chaque fois qu'on revient sur l'écran pour voir les niveaux débloqués
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Choisis ton niveau</Text>
        <Text style={styles.subtitle}>
          Termine un niveau pour débloquer le suivant.
        </Text>
      </View>

      {loading || !progress ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#22d3ee" />
        </View>
      ) : (
        <View style={styles.list}>
          {ALL_LEVELS.map((level) => {
            const meta = LEVEL_META[level];
            const unlocked = isUnlocked(level);
            const nbEmails = loadEmailsByDifficulty(meta.difficulty).length;
            const stats = progress.stats[level];
            const dejaJoue = stats.attempts > 0;
            const maxScore = nbEmails * POINTS_PER_CORRECT;

            return (
              <Pressable
                key={level}
                disabled={!unlocked}
                onPress={() => navigation.navigate('Game', { level })}
                accessibilityRole="button"
                accessibilityLabel={
                  unlocked
                    ? `Lancer le niveau ${level} - ${meta.title}${dejaJoue ? `, meilleur score ${stats.bestScore} sur ${maxScore}, ${stats.bestStars} étoiles` : ', jamais joué'}`
                    : `Niveau ${level} verrouillé`
                }
                accessibilityState={{ disabled: !unlocked }}
                style={({ pressed }) => [
                  styles.card,
                  !unlocked && styles.cardLocked,
                  pressed && unlocked && styles.cardPressed,
                ]}
              >
                <View style={styles.cardIconWrap}>
                  <Text style={styles.cardIcon}>{unlocked ? meta.icon : '🔒'}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardEyebrow}>Niveau {level}</Text>
                  <Text
                    style={[styles.cardTitle, !unlocked && styles.cardTitleLocked]}
                  >
                    {meta.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardTagline,
                      !unlocked && styles.cardTaglineLocked,
                    ]}
                  >
                    {unlocked
                      ? meta.tagline
                      : `Termine le niveau ${level - 1} pour débloquer.`}
                  </Text>

                  {unlocked && (
                    <View style={styles.cardStatsRow}>
                      <View style={styles.miniStars}>
                        {Array.from({ length: MAX_STARS }).map((_, i) => (
                          <Text
                            key={i}
                            style={[
                              styles.miniStar,
                              i < stats.bestStars
                                ? styles.miniStarOn
                                : styles.miniStarOff,
                            ]}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                      <Text style={styles.cardBestScore}>
                        {dejaJoue
                          ? `${stats.bestScore} / ${maxScore}`
                          : 'Jamais joué'}
                      </Text>
                    </View>
                  )}

                  {unlocked && (
                    <Text style={styles.cardCount}>{nbEmails} emails</Text>
                  )}
                </View>
                <Text style={[styles.chevron, !unlocked && styles.chevronLocked]}>
                  ›
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 24,
    gap: 6,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLocked: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
    opacity: 0.65,
  },
  cardPressed: {
    backgroundColor: '#0f172a',
    borderColor: '#22d3ee',
    transform: [{ scale: 0.99 }],
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardEyebrow: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  cardTitleLocked: {
    color: '#94a3b8',
  },
  cardTagline: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  cardTaglineLocked: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  cardCount: {
    color: '#22d3ee',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  cardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  miniStars: {
    flexDirection: 'row',
    gap: 2,
  },
  miniStar: {
    fontSize: 14,
  },
  miniStarOn: {
    color: '#facc15',
  },
  miniStarOff: {
    color: '#334155',
  },
  cardBestScore: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  chevron: {
    color: '#22d3ee',
    fontSize: 28,
    fontWeight: '300',
  },
  chevronLocked: {
    color: '#475569',
  },
});
