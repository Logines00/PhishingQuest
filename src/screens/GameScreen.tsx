import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Choice, ChoiceReveal } from '../components/ChoiceButtons';
import { ChoiceButtons } from '../components/ChoiceButtons';
import { EmailCard } from '../components/EmailCard';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { Timer } from '../components/Timer';
import { LEVEL_META } from '../constants/levels';
import { useCountdown } from '../hooks/useCountdown';
import type { GameScreenProps } from '../types/navigation';
import { loadEmailsByDifficulty } from '../utils/emails';
import { POINTS_PER_CORRECT } from '../utils/progress';

const QUESTION_SECONDS = 30;
const REVEAL_DURATION_MS = 800;

type Answer = Choice | 'timeout';
type Phase = 'playing' | 'feedback';

type AnswerRecord = {
  emailId: string;
  choice: Answer;
  correct: boolean;
};

export function GameScreen({ navigation, route }: GameScreenProps) {
  const { level } = route.params;
  const emails = useMemo(
    () => loadEmailsByDifficulty(LEVEL_META[level].difficulty),
    [level]
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [reponses, setReponses] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<Phase>('playing');
  const [dernierChoix, setDernierChoix] = useState<Answer | null>(null);
  const [correctionEnCours, setCorrectionEnCours] = useState<ChoiceReveal | null>(null);

  // pour éviter qu'un clic rapide et la fin du timer se déclenchent en même temps
  const dejaReponduRef = useRef<number>(-1);
  const minuteurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emailActuel = emails[index];
  const dernierEmail = index === emails.length - 1;

  const annulerMinuteur = useCallback(() => {
    if (minuteurRef.current !== null) {
      clearTimeout(minuteurRef.current);
      minuteurRef.current = null;
    }
  }, []);

  // je nettoie le minuteur quand le composant disparaît
  useEffect(() => annulerMinuteur, [annulerMinuteur]);

  // j'enregistre la réponse (clic du joueur ou temps écoulé)
  const validerReponse = useCallback(
    (choice: Answer) => {
      if (dejaReponduRef.current === index) return;
      // si le timer arrive en retard pendant la correction on l'ignore
      if (choice === 'timeout' && correctionEnCours) return;
      if (!emailActuel) return;
      dejaReponduRef.current = index;

      const attendu: Choice = emailActuel.isPhishing ? 'phishing' : 'legit';
      const bonneReponse = choice === attendu;

      if (bonneReponse) {
        setScore((prev) => prev + POINTS_PER_CORRECT);
      }
      setReponses((prev) => [
        ...prev,
        { emailId: emailActuel.id, choice, correct: bonneReponse },
      ]);
      setDernierChoix(choice);
      setCorrectionEnCours(null);
      setPhase('feedback');
    },
    [index, emailActuel, correctionEnCours]
  );

  // quand le joueur clique sur un bouton
  const gererChoixJoueur = useCallback(
    (choice: Choice) => {
      if (!emailActuel) return;
      if (dejaReponduRef.current === index) return;
      if (correctionEnCours) return;

      const attendu: Choice = emailActuel.isPhishing ? 'phishing' : 'legit';
      setCorrectionEnCours({ chosen: choice, correct: attendu });

      // je laisse un court instant pour montrer la bonne/mauvaise réponse
      annulerMinuteur();
      minuteurRef.current = setTimeout(() => {
        validerReponse(choice);
      }, REVEAL_DURATION_MS);
    },
    [index, emailActuel, correctionEnCours, validerReponse, annulerMinuteur]
  );

  // passe à l'email suivant ou va aux résultats si c'était le dernier
  const emailSuivant = useCallback(() => {
    if (dernierEmail) {
      const nbBonnesReponses = reponses.filter((r) => r.correct).length;
      navigation.replace('Result', {
        score,
        correctCount: nbBonnesReponses,
        total: emails.length,
        level,
      });
      return;
    }
    setDernierChoix(null);
    setPhase('playing');
    setIndex((prev) => prev + 1);
  }, [dernierEmail, reponses, score, emails.length, level, navigation]);

  const tempsRestant = useCountdown({
    seconds: QUESTION_SECONDS,
    onExpire: () => validerReponse('timeout'),
    resetKey: index,
    active: phase === 'playing' && !correctionEnCours,
  });

  if (!emailActuel) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.emptyText}>Aucun email à analyser.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.progressLabel}>
            Email {index + 1} sur {emails.length}
          </Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeLabel}>Score</Text>
            <Text style={styles.scoreBadgeValue}>{score}</Text>
          </View>
        </View>

        {phase === 'playing' ? (
          <>
            <Timer tempsRestant={tempsRestant} total={QUESTION_SECONDS} />
            <EmailCard email={emailActuel} />
            <Text style={styles.question}>
              À toi de jouer : est-ce du phishing ou un email légitime ?
            </Text>
            <ChoiceButtons
              onChoose={gererChoixJoueur}
              reveal={correctionEnCours ?? undefined}
            />
          </>
        ) : (
          dernierChoix !== null && (
            <FeedbackPanel
              email={emailActuel}
              choice={dernierChoix}
              onContinue={emailSuivant}
              dernierEmail={dernierEmail}
            />
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  scoreBadgeLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scoreBadgeValue: {
    color: '#22d3ee',
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  question: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
  },
});
