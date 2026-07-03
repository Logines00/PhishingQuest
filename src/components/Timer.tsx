import { StyleSheet, Text, View } from 'react-native';

type Props = {
  tempsRestant: number;
  total: number;
};

const SEUIL_URGENCE = 5;

export function Timer({ tempsRestant, total }: Props) {
  const totalSur = Math.max(total, 1);
  const ratio = Math.max(0, Math.min(1, tempsRestant / totalSur));
  // quand il reste peu de temps on passe en rouge
  const presqueFini = tempsRestant <= SEUIL_URGENCE;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Temps restant</Text>
        <Text style={[styles.seconds, presqueFini && styles.secondsUrgent]}>
          {tempsRestant}s
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${ratio * 100}%` },
            presqueFini && styles.fillUrgent,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  seconds: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  secondsUrgent: {
    color: '#dc2626',
  },
  track: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#22d3ee',
    borderRadius: 999,
  },
  fillUrgent: {
    backgroundColor: '#dc2626',
  },
});
