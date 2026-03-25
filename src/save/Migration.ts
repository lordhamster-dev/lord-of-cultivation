import type { GameState } from '../core/types';
import { SAVE_VERSION } from '../core/types';
import { createInitialQuestState } from '../core/systems/QuestSystem';
import { createInitialAchievementState } from '../core/systems/AchievementSystem';

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

  // Version 2 → 3
  if (data.version < 3) {
    data = {
      ...data,
      // Add spirit resource fields
      resources: {
        ...data.resources,
        spirit: data.resources?.spirit ?? 100,
        spiritMax: data.resources?.spiritMax ?? 100,
        spiritPerSec: data.resources?.spiritPerSec ?? 5,
      },
      // Add sub-stage fields
      cultivation: {
        ...data.cultivation,
        subStageIndex: data.cultivation?.subStageIndex ?? 0,
        activeTechniqueId: data.cultivation?.activeTechniqueId ?? null,
      },
      achievements: data.achievements ?? createInitialAchievementState(),
      dailyQuests: data.dailyQuests ?? createInitialQuestState(),
      stats: data.stats ?? {
        totalHerbsHarvested: 0,
        totalQuestsCompleted: 0,
        totalPillsCraftedByType: {},
      },
      version: 3,
    };
  }

  return data as GameState;
}

export { SAVE_VERSION };

