import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export type Choice = 'phishing' | 'legit';

export type ChoiceReveal = {
  chosen: Choice;
  correct: Choice;
};

type Props = {
  onChoose: (choice: Choice) => void;
  disabled?: boolean;
  // quand c'est défini, les boutons montrent la bonne réponse en vert et l'erreur en rouge
  reveal?: ChoiceReveal;
};

type ButtonState = 'idle' | 'truth' | 'wrong' | 'muted';

// je calcule l'état d'un bouton pendant l'affichage de la correction
function etatBouton(button: Choice, reveal: ChoiceReveal | undefined): ButtonState {
  if (!reveal) return 'idle';
  if (reveal.correct === button) return 'truth';
  if (reveal.chosen === button) return 'wrong';
  return 'muted';
}

export function ChoiceButtons({ onChoose, disabled = false, reveal }: Props) {
  const phishingScale = useRef(new Animated.Value(1)).current;
  const legitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!reveal) {
      phishingScale.setValue(1);
      legitScale.setValue(1);
      return;
    }
    // je fais une petite animation sur le bouton choisi
    const cible = reveal.chosen === 'phishing' ? phishingScale : legitScale;
    Animated.sequence([
      Animated.timing(cible, {
        toValue: 1.06,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(cible, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reveal, phishingScale, legitScale]);

  const etatPhishing = etatBouton('phishing', reveal);
  const etatLegit = etatBouton('legit', reveal);
  // boutons bloqués si désactivés ou pendant la correction
  const bloque = disabled || !!reveal;

  return (
    <View style={styles.row}>
      <Animated.View
        style={[styles.buttonWrapper, { transform: [{ scale: phishingScale }] }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Marquer cet email comme phishing"
          accessibilityState={{ disabled: bloque }}
          disabled={bloque}
          onPress={() => onChoose('phishing')}
          style={({ pressed }) => [
            styles.button,
            couleursBouton('phishing', etatPhishing),
            pressed && !reveal && styles.phishingPressed,
            disabled && !reveal && styles.softDisabled,
          ]}
        >
          <Text style={styles.emoji}>{iconeBouton('phishing', etatPhishing)}</Text>
          <Text style={[styles.label, couleurTexte('phishing', etatPhishing)]}>
            Phishing
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[styles.buttonWrapper, { transform: [{ scale: legitScale }] }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Marquer cet email comme légitime"
          accessibilityState={{ disabled: bloque }}
          disabled={bloque}
          onPress={() => onChoose('legit')}
          style={({ pressed }) => [
            styles.button,
            couleursBouton('legit', etatLegit),
            pressed && !reveal && styles.legitPressed,
            disabled && !reveal && styles.softDisabled,
          ]}
        >
          <Text style={styles.emoji}>{iconeBouton('legit', etatLegit)}</Text>
          <Text style={[styles.label, couleurTexte('legit', etatLegit)]}>
            Légitime
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// couleurs de fond/bordure du bouton selon son état
function couleursBouton(choice: Choice, state: ButtonState) {
  if (state === 'truth') {
    return { backgroundColor: '#dcfce7', borderColor: '#16a34a' };
  }
  if (state === 'wrong') {
    return { backgroundColor: '#fee2e2', borderColor: '#dc2626' };
  }
  if (state === 'muted') {
    return { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' };
  }
  // état normal : couleur de base selon le choix
  return choice === 'phishing'
    ? { backgroundColor: '#fef2f2', borderColor: '#fecaca' }
    : { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' };
}

// couleur du texte du bouton
function couleurTexte(choice: Choice, state: ButtonState) {
  if (state === 'truth') return { color: '#15803d' };
  if (state === 'wrong') return { color: '#b91c1c' };
  if (state === 'muted') return { color: '#94a3b8' };
  return choice === 'phishing' ? { color: '#b91c1c' } : { color: '#15803d' };
}

// petite icône affichée sur le bouton
function iconeBouton(choice: Choice, state: ButtonState): string {
  if (state === 'truth') return '✅';
  if (state === 'wrong') return '❌';
  return choice === 'phishing' ? '🎣' : '✓';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 2,
  },
  phishingPressed: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    transform: [{ scale: 0.98 }],
  },
  legitPressed: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  softDisabled: {
    opacity: 0.5,
  },
});
