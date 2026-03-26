import type { GameState } from '../core/types';
import { SAVE_VERSION } from '../core/types';
import { createInitialQuestState } from '../core/systems/QuestSystem';
import { createInitialAchievementState } from '../core/systems/AchievementSystem';
import { createInitialCombatState } from '../core/systems/CombatSystem';
import { createInitialDungeonState } from '../core/systems/DungeonSystem';
import { createInitialEquipmentState } from '../core/systems/EquipmentSystem';

/** Migrate a raw parsed save object to the current version. */
export function migrate(raw: Partial<GameState>): GameState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      },
      version: 3,
    };
  }

  // Version 3 → 4
  if (data.version < 4) {
    // Add combat and forging skills
    if (data.skills) {
      data.skills.combat = data.skills.combat ?? { level: 1, exp: 0, maxExp: 83 };
      data.skills.forging = data.skills.forging ?? { level: 1, exp: 0, maxExp: 83 };
    }
    // Add combat, dungeon, and equipment states
    data = {
      ...data,
      combat: data.combat ?? createInitialCombatState(),
      dungeon: data.dungeon ?? createInitialDungeonState(),
      equipment: data.equipment ?? createInitialEquipmentState(),
      stats: {
        ...data.stats,
        totalMonstersKilled: data.stats?.totalMonstersKilled ?? 0,
        totalBossesKilled: data.stats?.totalBossesKilled ?? 0,
        totalDungeonClears: data.stats?.totalDungeonClears ?? 0,
        totalEquipmentForged: data.stats?.totalEquipmentForged ?? 0,
      },
      version: 4,
    };
  }

  // Version 4 → 5 (Cultivation system refactor: 5 stages → 13 stages, variable sub-stages)
  if (data.version < 5) {
    // Stage index mapping: old 0-4 → new 0-4 (same first 5 stages, just content changes)
    // Sub-stage mapping: old 9 sub-stages → new variable count
    // 炼气: old 9 → new 13 sub-stages (keep index as-is, already valid 0-8)
    // Others: old 9 sub-stages → new 4 sub-stages (初期/中期/后期/大圆满)
    if (data.cultivation) {
      const oldSubStageIndex = data.cultivation.subStageIndex ?? 0;
      const oldStageIndex = data.cultivation.stageIndex ?? 0;

      if (oldStageIndex === 0) {
        // 炼气: old 9 sub-stages → new 13 sub-stages, scale proportionally
        data.cultivation.subStageIndex = Math.min(Math.floor(oldSubStageIndex * 12 / 8), 12);
      } else if (oldStageIndex >= 1 && oldStageIndex <= 4) {
        // Other stages: old 9 sub-stages → new 4 sub-stages
        // old 0-2 (初期) → new 0 (初期)
        // old 3-5 (中期) → new 1 (中期)
        // old 6-7 (后期) → new 2 (后期)
        // old 8 (后期三层, final) → new 3 (大圆满)
        if (oldSubStageIndex <= 2) {
          data.cultivation.subStageIndex = 0;
        } else if (oldSubStageIndex <= 5) {
          data.cultivation.subStageIndex = 1;
        } else if (oldSubStageIndex <= 7) {
          data.cultivation.subStageIndex = 2;
        } else {
          data.cultivation.subStageIndex = 3;
        }
      }
      // stageIndex stays the same (0-4 maps directly)
    }
    // Migrate old golden_core_pill inventory to core_formation_pill
    if (data.inventory?.items) {
      const oldPillCount = data.inventory.items['golden_core_pill'] ?? 0;
      if (oldPillCount > 0) {
        data.inventory.items['core_formation_pill'] = (data.inventory.items['core_formation_pill'] ?? 0) + oldPillCount;
        delete data.inventory.items['golden_core_pill'];
      }
    }
    data = {
      ...data,
      version: 5,
    };
  }

  return data as GameState;
}

export { SAVE_VERSION };

