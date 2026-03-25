import { useEffect, useState } from 'react';
import { calculateOfflineProgress, formatDuration } from '../core/engine/Ticker';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';

export interface OfflineNotification {
  show: boolean;
  elapsedText: string;
  spiritStones: string;
  exp: string;
}

/**
 * On mount: calculates offline progress and applies it to the store.
 * Returns a notification object for the UI to display.
 */
export function useOfflineProgress(): {
  notification: OfflineNotification;
  dismiss: () => void;
} {
  const loadGame = useGameStore((s) => s.loadGame);
  const applyOfflineProgress = useGameStore((s) => s.applyOfflineProgress);
  const offlineCapHours = useSettingsStore((s) => s.offlineCapHours);

  const [notification, setNotification] = useState<OfflineNotification>({
    show: false,
    elapsedText: '',
    spiritStones: '0',
    exp: '0',
  });

  useEffect(() => {
    // Load save first
    loadGame();

    // Get the lastTickTime from the freshly loaded store
    const storedLastTick = useGameStore.getState().lastTickTime;
    const { cappedMs, elapsedMs } = calculateOfflineProgress(
      storedLastTick,
      offlineCapHours,
    );

    // Only show notification if away for more than 10 seconds
    if (elapsedMs > 10_000) {
      const gains = applyOfflineProgress(cappedMs);
      setNotification({
        show: true,
        elapsedText: formatDuration(cappedMs),
        spiritStones: gains.spiritStones,
        exp: gains.exp,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => setNotification((n) => ({ ...n, show: false }));

  return { notification, dismiss };
}
