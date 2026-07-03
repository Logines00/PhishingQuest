import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ResultScreenProps } from '../types/navigation';
import {
  MAX_STARS,
  POINTS_PER_CORRECT,
  computePercent,
  computeStars,
  nextLevelOf,
  recordAttempt,
} from '../utils/progress';

// petit message de fin selon le nombre d'étoiles
function choisirMessage(stars: number): { title: string; subtitle: string } {
  switch (stars) {
    case 3:
      return {
        title: 'Expert anti-phishing 🏆',
        subtitle: 'Tu repères les arnaques comme un pro.',
      };
    case 2:
      return {
        title: 'Bonne intuition 👍',
        subtitle: 'Encore quelques pièges à apprendre à éviter.',
      };
    default:
      return {
        title: 'Premier pas',
        subtitle: 'Rejoue pour t\'entraîner à repérer les indices.',
      };
  }
}

export function ResultScreen({ navigation, route }: ResultScreenProps) {
  const { score, correctCount, total, level } = route.params;
  const maxScore = total * POINTS_PER_CORRECT;
  const percent = computePercent(score, total);
  const stars = computeStars(percent);
  const message = choisirMessage(stars);
  const nextLevel = nextLevelOf(level);

  // null le temps que la sauvegarde se fasse, puis true/false
  const [unlocked, setUnlocked] = useState<boolean | null>(nextLevel ? null : false);

  useEffect(() => {
    // évite de mettre à jour le state si l'écran est déjà fermé
    let actif = true;
    recordAttempt(level, { score, correctCount, total }).then((maj) => {
      if (!actif) return;
      setUnlocked(nextLevel ? maj.unlockedLevels.includes(nextLevel) : false);
    });
    return () => {
      actif = false;
    };
  }, [level, score, correctCount, total, nextLevel]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Niveau {level} terminé</Text>
          <Text style={styles.headerTitle}>{message.title}</Text>
          <Text style={styles.headerSubtitle}>{message.subtitle}</Text>
        </View>

        <View
          style={styles.stars}
          accessibilityLabel={`${stars} étoiles sur ${MAX_STARS}`}
        >
          {Array.from({ length: MAX_STARS }).map((_, i) => {
            const earned = i < stars;
            return (
              <Text
                key={i}
                style={[styles.star, earned ? styles.starOn : styles.starOff]}
              >
                ★
              </Text>
            );
          })}
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreValue}>
            {score}
            <Text style={styles.scoreSuffix}> / {maxScore}</Text>
          </Text>
          <Text style={styles.scorePercent}>{percent}%</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{correctCount}</Text>
            <Text style={styles.statLabel}>Bonnes réponses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{total - correctCount}</Text>
            <Text style={styles.statLabel}>Erreurs / timeouts</Text>
          </View>
        </View>

        {nextLevel && unlocked && (
          <View style={styles.unlockBanner}>
            <Text style={styles.unlockBannerEmoji}>🔓</Text>
            <Text style={styles.unlockBannerText}>
              Niveau {nextLevel} débloqué !
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {nextLevel && unlocked && (
          <Pressable
            onPress={() => navigation.replace('Game', { level: nextLevel })}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Lancer le niveau ${nextLevel}`}
          >
            <Text style={styles.primaryLabel}>Niveau suivant →</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => navigation.replace('Game', { level })}
          style={({ pressed }) => [
            nextLevel && unlocked ? styles.secondaryButton : styles.primaryButton,
            pressed &&
              (nextLevel && unlocked
                ? styles.secondaryButtonPressed
                : styles.primaryButtonPressed),
          ]}
          accessibilityRole="button"
          accessibilityLabel="Rejouer le niveau"
        >
          <Text
            style={
              nextLevel && unlocked ? styles.secondaryLabel : styles.primaryLabel
            }
          >
            Rejouer le niveau
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.popToTop()}
          style={({ pressed }) => [
            styles.tertiaryButton,
            pressed && styles.tertiaryButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retour à l'accueil"
        >
          <Text style={styles.tertiaryLabel}>Retour à l'accueil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 60,
  },
  starOn: {
    color: '#facc15',
    textShadowColor: 'rgba(250, 204, 21, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  starOff: {
    color: '#334155',
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 2,
  },
  scoreValue: {
    color: '#f8fafc',
    fontSize: 52,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreSuffix: {
    color: '#64748b',
    fontSize: 26,
    fontWeight: '600',
  },
  scorePercent: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderColor: '#22d3ee',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  unlockBannerEmoji: {
    fontSize: 20,
  },
  unlockBannerText: {
    color: '#22d3ee',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#22d3ee',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: '#06b6d4',
    transform: [{ scale: 0.98 }],
  },
  primaryLabel: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22d3ee',
    backgroundColor: 'transparent',
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  secondaryLabel: {
    color: '#22d3ee',
    fontSize: 15,
    fontWeight: '700',
  },
  tertiaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tertiaryButtonPressed: {
    opacity: 0.6,
  },
  tertiaryLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
});
