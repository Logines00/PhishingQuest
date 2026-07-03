import emailsData from '../data/emails.json';
import type { Difficulty, Email } from '../types/email';

// je récupère tous les emails du fichier json
export function loadEmails(): Email[] {
  return emailsData as Email[];
}

// je charge les emails selon la difficulté du niveau
export function loadEmailsByDifficulty(level: Difficulty): Email[] {
  return loadEmails().filter((email) => email.difficulty === level);
}
