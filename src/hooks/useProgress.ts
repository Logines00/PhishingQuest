import { useCallback, useEffect, useState } from 'react';

import {
  loadProgress,
  recordAttempt,
  resetProgress,
  type AttemptResult,
  type Level,
  type Progress,
} from '../utils/progress';

type UseProgressResult = {
  progress: Progress | null;
  loading: boolean;
  isUnlocked: (level: Level) => boolean;
  refresh: () => Promise<void>;
  recordAttempt: (level: Level, result: AttemptResult) => Promise<Progress>;
  reset: () => Promise<void>;
};

// hook autour de la progression : charge au montage et donne les fonctions débloquer/enregistrer/reset
export function useProgress(): UseProgressResult {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const maj = await loadProgress();
    setProgress(maj);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isUnlocked = useCallback(
    (level: Level) => progress?.unlockedLevels.includes(level) ?? false,
    [progress]
  );

  const enregistrer = useCallback(
    async (level: Level, result: AttemptResult) => {
      const maj = await recordAttempt(level, result);
      setProgress(maj);
      return maj;
    },
    []
  );

  const reset = useCallback(async () => {
    const neuf = await resetProgress();
    setProgress(neuf);
  }, []);

  return {
    progress,
    loading,
    isUnlocked,
    refresh,
    recordAttempt: enregistrer,
    reset,
  };
}
