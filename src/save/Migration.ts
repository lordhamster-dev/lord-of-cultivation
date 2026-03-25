import type { GameState } from '../core/types';
import { SAVE_VERSION } from '../core/types';

/** Migrate a raw parsed save object to the current version. */
export function migrate(raw: Partial<GameState>): GameState {
  let data = raw as any;

  // Version 0 → 1 (initial version, nothing to migrate)
  if (!data.version || data.version < 1) {
    data = {
      ...data,
      version: 1,
    };
  }

  // Version 1 → 2
  if (data.version < 2) {
    data = {
      ...data,
      inventory: data.inventory ?? { items: {} },
      skills: data.skills ?? {
        farming: { level: 1, exp: 0, maxExp: 83 },
        fishing: { level: 1, exp: 0, maxExp: 83 },
        alchemy: { level: 1, exp: 0, maxExp: 83 },
      },
      herbPlots: data.herbPlots ?? Array.from({ length: 8 }, (_: unknown, i: number) => ({
        id: `plot_${i}`,
        herbId: null,
        plantedAt: null,
        growthDurationMs: 0,
        isReady: false,
        isUnlocked: i < 4,
      })),
      fishing: data.fishing ?? { isActive: false, currentAreaId: null, progressMs: 0, totalFishCaught: 0 },
      alchemy: data.alchemy ?? { isActive: false, currentRecipeId: null, progressMs: 0, totalPillsCrafted: 0 },
      gatheringPillEndTime: data.gatheringPillEndTime ?? 0,
      version: 2,
    };
  }

  return data as GameState;
}

export { SAVE_VERSION };
