import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Email } from '../types/email';
import type { Choice } from './ChoiceButtons';

type Outcome = 'correct' | 'incorrect' | 'timeout';

type Props = {
  email: Email;
  choice: Choice | 'timeout';
  onContinue: () => void;
  dernierEmail: boolean;
};

// je détermine si le joueur a bon, faux ou s'il a laissé le temps s'écouler
function calculerResultat(email: Email, choice: Choice | 'timeout'): Outcome {
  if (choice === 'timeout') return 'timeout';
  const attendu: Choice = email.isPhishing ? 'phishing' : 'legit';
  return choice === attendu ? 'correct' : 'incorrect';
}

const HEADERS: Record<Outcome, { emoji: string; title: string; subtitle: string }> = {
  correct: {
    emoji: '✅',
    title: 'Bien vu !',
    subtitle: 'Tu as fait le bon choix.',
  },
  incorrect: {
    emoji: '❌',
    title: 'Raté',
    subtitle: 'Voici ce que tu aurais dû repérer.',
  },
  timeout: {
    emoji: '⏱️',
    title: 'Temps écoulé',
    subtitle: 'Pas de panique — analyse les indices.',
  },
};

const ACCENT: Record<Outcome, { bg: string; border: string; text: string }> = {
  correct: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  incorrect: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
  timeout: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
};

export function FeedbackPanel({ email, choice, onContinue, dernierEmail }: Props) {
  const resultat = calculerResultat(email, choice);
  const header = HEADERS[resultat];
  const accent = ACCENT[resultat];
  const vraieNature = email.isPhishing ? 'Phishing' : 'Légitime';

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.banner,
          { backgroundColor: accent.bg, borderColor: accent.border },
        ]}
      >
        <Text style={styles.bannerEmoji}>{header.emoji}</Text>
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: accent.text }]}>
            {header.title}
          </Text>
          <Text style={styles.bannerSubtitle}>{header.subtitle}</Text>
        </View>
      </View>

      <View style={styles.truthRow}>
        <Text style={styles.truthLabel}>Cet email était</Text>
        <View
          style={[
            styles.truthBadge,
            email.isPhishing ? styles.truthPhishing : styles.truthLegit,
          ]}
        >
          <Text
            style={[
              styles.truthBadgeLabel,
              email.isPhishing
                ? styles.truthBadgePhishingLabel
                : styles.truthBadgeLegitLabel,
            ]}
          >
            {vraieNature}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Indices à repérer</Text>
        <View style={styles.indicators}>
          {email.indicators.map((indicator, i) => (
            <View key={i} style={styles.indicatorRow}>
              <Text style={styles.indicatorBullet}>•</Text>
              <Text style={styles.indicatorText}>{indicator}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explication</Text>
        <Text style={styles.explanation}>{email.explanation}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dernierEmail ? 'Voir les résultats' : 'Passer à l\'email suivant'}
        onPress={onContinue}
        style={({ pressed }) => [
          styles.continueButton,
          pressed && styles.continueButtonPressed,
        ]}
      >
        <Text style={styles.continueLabel}>
          {dernierEmail ? 'Voir mes résultats' : 'Email suivant →'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerEmoji: {
    fontSize: 32,
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: '#475569',
    fontSize: 13,
  },
  truthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  truthLabel: {
    color: '#475569',
    fontSize: 14,
  },
  truthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  truthPhishing: {
    backgroundColor: '#fee2e2',
  },
  truthLegit: {
    backgroundColor: '#dcfce7',
  },
  truthBadgeLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  truthBadgePhishingLabel: {
    color: '#b91c1c',
  },
  truthBadgeLegitLabel: {
    color: '#15803d',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  indicators: {
    gap: 8,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  indicatorBullet: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  indicatorText: {
    flex: 1,
    color: '#1e293b',
    fontSize: 14,
    lineHeight: 20,
  },
  explanation: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
  },
  continueButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 4,
  },
  continueButtonPressed: {
    backgroundColor: '#1e293b',
    transform: [{ scale: 0.98 }],
  },
  continueLabel: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
