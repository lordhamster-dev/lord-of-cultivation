import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * On mount: loads the saved game state.
 * No offline progress since resources are no longer passively generated.
 */
export function useLoadSave(): void {
  const loadGame = useGameStore((s) => s.loadGame);

  useEffect(() => {
    loadGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
