import { useEffect, useRef } from 'react';
import { GameLoop } from '../core/engine/GameLoop';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';

const AUTO_SAVE_DEFAULT = 30_000;

/**
 * Starts and stops the main game loop.
 * Also handles auto-saving at configured intervals.
 */
export function useGameLoop(): void {
  const tick = useGameStore((s) => s.tick);
  const saveGame = useGameStore((s) => s.saveGame);
  const autoSaveInterval = useSettingsStore((s) => s.autoSaveInterval) ?? AUTO_SAVE_DEFAULT;

  const loopRef = useRef<GameLoop | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  useEffect(() => {
    const loop = new GameLoop();
    loopRef.current = loop;

    loop.start((deltaMs) => {
      tick(deltaMs);

      // Auto-save check
      const now = Date.now();
      if (now - lastSaveRef.current >= autoSaveInterval) {
        lastSaveRef.current = now;
        saveGame();
      }
    });

    return () => {
      loop.stop();
    };
  }, [tick, saveGame, autoSaveInterval]);
}
