import { useEffect, useRef, useState } from 'react';

type Options = {
  seconds: number;
  onExpire: () => void;
  /** Quand cette valeur change, le compte à rebours repart de zéro (en général l'index de l'email). */
  resetKey: unknown;
  /** Si false, le timer est en pause. */
  active?: boolean;
};

// Compte à rebours seconde par seconde, repart quand resetKey change
export function useCountdown({ seconds, onExpire, resetKey, active = true }: Options): number {
  const [tempsRestant, setTempsRestant] = useState(seconds);

  // je garde le dernier onExpire dans une ref pour pas le mettre dans les deps
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setTempsRestant(seconds);
    if (!active) return;

    const intervalle = setInterval(() => {
      setTempsRestant((prev) => {
        if (prev <= 1) {
          clearInterval(intervalle);
          // on attend un poil pour pas changer le state pendant le render du parent
          queueMicrotask(() => onExpireRef.current());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalle);
  }, [seconds, resetKey, active]);

  return tempsRestant;
}
