import type { Difficulty } from '../types/email';
import type { Level } from '../utils/progress';

export type LevelMeta = {
  difficulty: Difficulty;
  icon: string;
  title: string;
  tagline: string;
};

// infos de chaque niveau (difficulté, titre, icône...) au même endroit
export const LEVEL_META: Record<Level, LevelMeta> = {
  1: {
    difficulty: 'beginner',
    icon: '🌱',
    title: 'Débutant',
    tagline: 'Les pièges les plus visibles : urgences, fautes, faux domaines évidents.',
  },
  2: {
    difficulty: 'intermediate',
    icon: '🎯',
    title: 'Intermédiaire',
    tagline: 'Spoofing d\'adresse, sous-domaines trompeurs, usurpation interne.',
  },
  3: {
    difficulty: 'expert',
    icon: '🛡️',
    title: 'Expert',
    tagline: 'Homoglyphes, fraude au président, attaques sophistiquées.',
  },
};
