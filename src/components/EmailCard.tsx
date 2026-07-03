import { StyleSheet, Text, View } from 'react-native';

import type { Email } from '../types/email';

const PREVIEW_MAX_CHARS = 140;

type EmailCardProps = {
  email: Email;
};

// je coupe le texte pour afficher juste un aperçu
function construireApercu(body: string): string {
  const texte = body.replace(/\s+/g, ' ').trim();
  if (texte.length <= PREVIEW_MAX_CHARS) return texte;
  return texte.slice(0, PREVIEW_MAX_CHARS).trimEnd() + '…';
}

// date au format français
function formaterDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EmailCard({ email }: EmailCardProps) {
  // première lettre du nom pour l'avatar
  const initiale = email.from.name.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{initiale}</Text>
        </View>
        <View style={styles.senderBlock}>
          <Text style={styles.senderName} numberOfLines={1}>
            {email.from.name}
          </Text>
          <Text style={styles.senderEmail} numberOfLines={1}>
            {email.from.email}
          </Text>
        </View>
        <Text style={styles.date}>{formaterDate(email.date)}</Text>
      </View>

      <Text style={styles.subject} numberOfLines={2}>
        {email.subject}
      </Text>

      <Text style={styles.preview} numberOfLines={3}>
        {construireApercu(email.body)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  senderBlock: {
    flex: 1,
    minWidth: 0,
  },
  senderName: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  senderEmail: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  date: {
    color: '#94a3b8',
    fontSize: 12,
  },
  subject: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  preview: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});
