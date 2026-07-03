import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LEVEL_META } from '../constants/levels';
import { useProgress } from '../hooks/useProgress';
import type { StatsScreenProps } from '../types/navigation';
import { loadEmailsByDifficulty } from '../utils/emails';
import {
  ALL_LEVELS,
  MAX_STARS,
  POINTS_PER_CORRECT,
  computeGlobalStats,
} from '../utils/progress';

export function StatsScreen({ navigation: _ }: StatsScreenProps) {
  const { progress, loading, refresh, reset } = useProgress();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleReset = useCallback(() => {
    Alert.alert(
      'Réinitialiser ma progression ?',
      'Tous tes meilleurs scores, étoiles et niveaux débloqués seront effacés. Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout effacer',
          style: 'destructive',
          onPress: () => {
            reset();
          },
        },
      ]
    );
  }, [reset]);

  if (loading || !progress) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#22d3ee" />
        </View>
      </SafeAreaView>
    );
  }

  // stats de tous les niveaux réunis
  const global = computeGlobalStats(progress);
  const aDejaJoue = global.totalAttempts > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes statistiques</Text>
          <Text style={styles.headerSubtitle}>
            {aDejaJoue
              ? `${global.totalAttempts} ${global.totalAttempts > 1 ? 'parties jouées' : 'partie jouée'} au total`
              : 'Joue une partie pour voir tes premières stats.'}
          </Text>
        </View>

        <View style={styles.globalCard}>
          <Text style={styles.globalCardLabel}>Taux de réussite global</Text>
          <Text style={styles.globalCardValue}>
            {aDejaJoue ? `${global.successRate}%` : '—'}
          </Text>
          <Text style={styles.globalCardBreakdown}>
            {aDejaJoue
              ? `${global.totalCorrect} bonnes réponses sur ${global.totalAnswered}`
              : 'Aucune réponse enregistrée pour le moment.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Par niveau</Text>

        <View style={styles.levelList}>
          {ALL_LEVELS.map((level) => {
            const meta = LEVEL_META[level];
            const stats = progress.stats[level];
            const totalEmails = loadEmailsByDifficulty(meta.difficulty).length;
            const maxScore = totalEmails * POINTS_PER_CORRECT;
            const dejaJoue = stats.attempts > 0;
            const unlocked = progress.unlockedLevels.includes(level);

            return (
              <View key={level} style={styles.levelCard}>
                <View style={styles.levelHeaderRow}>
                  <Text style={styles.levelIcon}>{unlocked ? meta.icon : '🔒'}</Text>
                  <View style={styles.levelHeaderText}>
                    <Text style={styles.levelEyebrow}>Niveau {level}</Text>
                    <Text style={styles.levelTitle}>{meta.title}</Text>
                  </View>
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
                </View>

                <View style={styles.levelStatsGrid}>
                  <View style={styles.levelStatBox}>
                    <Text style={styles.levelStatLabel}>Meilleur score</Text>
                    <Text style={styles.levelStatValue}>
                      {dejaJoue ? `${stats.bestScore} / ${maxScore}` : '—'}
                    </Text>
                  </View>
                  <View style={styles.levelStatBox}>
                    <Text style={styles.levelStatLabel}>Parties</Text>
                    <Text style={styles.levelStatValue}>{stats.attempts}</Text>
                  </View>
                  <View style={styles.levelStatBox}>
                    <Text style={styles.levelStatLabel}>Bonnes réponses</Text>
                    <Text style={styles.levelStatValue}>
                      {dejaJoue
                        ? `${stats.totalCorrect} / ${stats.totalAnswered}`
                        : '—'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {aDejaJoue && (
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser ma progression"
          >
            <Text style={styles.resetLabel}>Réinitialiser ma progression</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 6,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  globalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#22d3ee',
  },
  globalCardLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  globalCardValue: {
    color: '#22d3ee',
    fontSize: 56,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  globalCardBreakdown: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    marginTop: 6,
  },
  levelList: {
    gap: 12,
  },
  levelCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  levelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelIcon: {
    fontSize: 28,
  },
  levelHeaderText: {
    flex: 1,
    gap: 1,
  },
  levelEyebrow: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  levelTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  miniStars: {
    flexDirection: 'row',
    gap: 2,
  },
  miniStar: {
    fontSize: 18,
  },
  miniStarOn: {
    color: '#facc15',
  },
  miniStarOff: {
    color: '#334155',
  },
  levelStatsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  levelStatBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  levelStatLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  levelStatValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  resetButtonPressed: {
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
  },
  resetLabel: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '600',
  },
});
