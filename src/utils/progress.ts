import AsyncStorage from '@react-native-async-storage/async-storage';

export type Level = 1 | 2 | 3;
export type StarCount = 0 | 1 | 2 | 3;

export const ALL_LEVELS: readonly Level[] = [1, 2, 3] as const;
export const POINTS_PER_CORRECT = 10;
export const MAX_STARS = 3;

export type LevelStats = {
  bestScore: number;
  bestStars: StarCount;
  attempts: number;
  totalCorrect: number;
  totalAnswered: number;
};

export type Progress = {
  unlockedLevels: Level[];
  stats: Record<Level, LevelStats>;
};

const STORAGE_KEY = 'phishing-quest:progress:v1';

const EMPTY_STATS: LevelStats = {
  bestScore: 0,
  bestStars: 0,
  attempts: 0,
  totalCorrect: 0,
  totalAnswered: 0,
};

const INITIAL: Progress = {
  unlockedLevels: [1],
  stats: { 1: EMPTY_STATS, 2: EMPTY_STATS, 3: EMPTY_STATS },
};

function estNiveau(n: unknown): n is Level {
  return n === 1 || n === 2 || n === 3;
}

function estNombreEtoiles(n: unknown): n is StarCount {
  return n === 0 || n === 1 || n === 2 || n === 3;
}

// renvoie le nombre si positif, sinon 0
function positifOuZero(n: unknown): number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : 0;
}

// je remets les stats au propre au cas où le json stocké soit pourri
function nettoyerStats(raw: unknown): LevelStats {
  if (!raw || typeof raw !== 'object') return EMPTY_STATS;
  const r = raw as Partial<LevelStats>;
  return {
    bestScore: positifOuZero(r.bestScore),
    bestStars: estNombreEtoiles(r.bestStars) ? r.bestStars : 0,
    attempts: positifOuZero(r.attempts),
    totalCorrect: positifOuZero(r.totalCorrect),
    totalAnswered: positifOuZero(r.totalAnswered),
  };
}

// pareil mais pour toute la progression
function nettoyer(raw: unknown): Progress {
  if (!raw || typeof raw !== 'object') return INITIAL;
  const r = raw as { unlockedLevels?: unknown; stats?: unknown };

  const niveauxBruts = Array.isArray(r.unlockedLevels) ? r.unlockedLevels : [];
  const filtres = Array.from(new Set(niveauxBruts.filter(estNiveau))).sort((a, b) => a - b) as Level[];
  // le niveau 1 est toujours débloqué
  const unlockedLevels: Level[] = filtres.includes(1) ? filtres : ([1, ...filtres] as Level[]);

  const statsBrutes = (r.stats as Partial<Record<Level, unknown>> | undefined) ?? {};
  const stats: Record<Level, LevelStats> = {
    1: nettoyerStats(statsBrutes[1]),
    2: nettoyerStats(statsBrutes[2]),
    3: nettoyerStats(statsBrutes[3]),
  };

  return { unlockedLevels, stats };
}

// je charge la progression depuis le stockage du téléphone
export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    return nettoyer(JSON.parse(raw));
  } catch {
    return INITIAL;
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export async function resetProgress(): Promise<Progress> {
  await saveProgress(INITIAL);
  return INITIAL;
}

// pourcentage du score par rapport au max possible
export function computePercent(score: number, total: number): number {
  const max = Math.max(total * POINTS_PER_CORRECT, 1);
  return Math.round((score / max) * 100);
}

// nombre d'étoiles selon le pourcentage
export function computeStars(percent: number): 1 | 2 | 3 {
  if (percent >= 80) return 3;
  if (percent >= 50) return 2;
  return 1;
}

export function nextLevelOf(level: Level): Level | null {
  if (level === 1) return 2;
  if (level === 2) return 3;
  return null;
}

export type AttemptResult = {
  score: number;
  correctCount: number;
  total: number;
};

// je mets à jour le meilleur score / étoiles / totaux du niveau, débloque le suivant et renvoie la nouvelle progression
export async function recordAttempt(
  level: Level,
  result: AttemptResult
): Promise<Progress> {
  const actuel = await loadProgress();
  const percent = computePercent(result.score, result.total);
  const etoiles = computeStars(percent);

  const ancien = actuel.stats[level];
  const nouvellesStats: LevelStats = {
    bestScore: Math.max(ancien.bestScore, result.score),
    bestStars: Math.max(ancien.bestStars, etoiles) as StarCount,
    attempts: ancien.attempts + 1,
    totalCorrect: ancien.totalCorrect + result.correctCount,
    totalAnswered: ancien.totalAnswered + result.total,
  };

  const prochainNiveau = nextLevelOf(level);
  const unlockedLevels: Level[] =
    prochainNiveau && !actuel.unlockedLevels.includes(prochainNiveau)
      ? ([...actuel.unlockedLevels, prochainNiveau].sort((a, b) => a - b) as Level[])
      : actuel.unlockedLevels;

  const maj: Progress = {
    unlockedLevels,
    stats: { ...actuel.stats, [level]: nouvellesStats },
  };
  await saveProgress(maj);
  return maj;
}

export type GlobalStats = {
  totalCorrect: number;
  totalAnswered: number;
  totalAttempts: number;
  successRate: number; // 0..100
};

// je calcule les stats globales en additionnant tous les niveaux
export function computeGlobalStats(progress: Progress): GlobalStats {
  const acc = ALL_LEVELS.reduce(
    (somme, lvl) => {
      const s = progress.stats[lvl];
      somme.totalCorrect += s.totalCorrect;
      somme.totalAnswered += s.totalAnswered;
      somme.totalAttempts += s.attempts;
      return somme;
    },
    { totalCorrect: 0, totalAnswered: 0, totalAttempts: 0 }
  );
  const successRate =
    acc.totalAnswered > 0
      ? Math.round((acc.totalCorrect / acc.totalAnswered) * 100)
      : 0;
  return { ...acc, successRate };
}
