import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { STAGES, MAX_STAGE_INDEX } from '../core/data/stages';
import { getTechnique } from '../core/data/techniques';
import { getSpiritStoneCount, applyExpGain } from '../core/systems/ResourceSystem';
import { computeSpiritStats, computeMeditationRegenRate, getCombatSpiritCost } from '../core/systems/ProductionSystem';
import { attemptBreakthrough, computeProgressGain, getBreakthroughCost, tryAdvanceSubStage, isAtFinalSubStage, hasBreakthroughPill } from '../core/systems/CultivationSystem';
import { tickHerbGrowth, plantHerb as plantHerbSystem, harvestHerb as harvestHerbSystem } from '../core/systems/HerbSystem';
import { tickFishing } from '../core/systems/FishingSystem';
import { tickAlchemy, canCraft } from '../core/systems/AlchemySystem';
import { addSkillExp, createInitialSkillState } from '../core/systems/SkillSystem';
import { checkAchievements, createInitialAchievementState } from '../core/systems/AchievementSystem';
import { createInitialQuestState, refreshDailyQuestsIfNeeded, updateQuestProgress, claimQuestReward } from '../core/systems/QuestSystem';
import { tickCombat, createInitialCombatState, getPlayerCombatStats } from '../core/systems/CombatSystem';
import { tickDungeon, createInitialDungeonState, refreshDungeonDaily, canEnterDungeon, startDungeon as startDungeonSystem } from '../core/systems/DungeonSystem';
import { createInitialEquipmentState, canForge, forgeEquipment as forgeEquipmentSystem, canEnhance, enhanceEquipment as enhanceEquipmentSystem } from '../core/systems/EquipmentSystem';
import { getEquipmentBonuses } from '../core/systems/EquipmentSystem';
import { PLOT_UNLOCK_COSTS } from '../core/data/herbs';
import { FISHING_AREAS } from '../core/data/fish';
import { getRecipe } from '../core/data/recipes';
import { getCombatArea } from '../core/data/enemies';
import { getEquipment } from '../core/data/equipment';
import { getItem } from '../core/data/items';
import { PILL_COMBAT_EFFECTS } from '../core/data/items';
import { SaveManager } from '../save/SaveManager';
import type { GameState, EquipmentSlotId, ActivityType, CombatSupplyState } from '../core/types';
import { SAVE_VERSION } from '../core/types';
import type { HerbPlot } from '../core/types';

export const GATHERING_PILL_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function createInitialCombatSupplyState(): CombatSupplyState {
  return {
    config: {
      spiritItemId: null,
      spiritItemCount: 0,
      spiritThreshold: 30,
      hpItemId: null,
      hpItemCount: 0,
      hpThreshold: 30,
    },
    spiritItemsUsed: 0,
    hpItemsUsed: 0,
  };
}

const DEFAULT_STATE: GameState = {
  resources: { exp: '0', spirit: 100, spiritMax: 100, spiritPerSec: 5 },
  cultivation: { stageIndex: 0, subStageIndex: 0, progress: 0, totalAscensions: 0, activeTechniqueId: null },
  activeActivity: null,
  meditation: { isActive: false },
  lastSaveTime: Date.now(),
  lastTickTime: Date.now(),
  version: SAVE_VERSION,
  inventory: { items: { spirit_stone: 50 } },
  skills: {
    farming: createInitialSkillState(),
    fishing: createInitialSkillState(),
    alchemy: createInitialSkillState(),
    combat: createInitialSkillState(),
    forging: createInitialSkillState(),
  },
  herbPlots: Array.from({ length: 8 }, (_, i) => ({
    id: `plot_${i}`,
    herbId: null,
    plantedAt: null,
    growthDurationMs: 0,
    isReady: false,
    isUnlocked: i < 4,
  })),
  fishing: { isActive: false, currentAreaId: null, progressMs: 0, totalFishCaught: 0 },
  alchemy: { isActive: false, currentRecipeId: null, progressMs: 0, totalPillsCrafted: 0 },
  gatheringPillEndTime: 0,
  achievements: createInitialAchievementState(),
  dailyQuests: createInitialQuestState(),
  stats: { totalHerbsHarvested: 0, totalQuestsCompleted: 0, totalMonstersKilled: 0, totalBossesKilled: 0, totalDungeonClears: 0, totalEquipmentForged: 0 },
  combat: createInitialCombatState(),
  dungeon: createInitialDungeonState(),
  equipment: createInitialEquipmentState(),
  combatSupply: createInitialCombatSupplyState(),
};

/** Helper to check if any activity is active and return its type */
function getActiveActivity(state: GameState): ActivityType {
  if (state.meditation.isActive) return 'meditation';
  if (state.fishing.isActive) return 'fishing';
  if (state.alchemy.isActive) return 'alchemy';
  if (state.combat.isActive) return 'combat';
  if (state.dungeon.isActive) return 'dungeon';
  return null;
}

interface GameActions {
  tick: (deltaMs: number) => void;
  breakthrough: () => boolean;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  plantHerb: (plotId: string, herbId: string) => boolean;
  harvestHerb: (plotId: string) => boolean;
  startFishing: (areaId: string) => void;
  stopFishing: () => void;
  startAlchemy: (recipeId: string) => void;
  stopAlchemy: () => void;
  unlockHerbPlot: (plotIndex: number) => boolean;
  useItem: (itemId: string) => boolean;
  sellItem: (itemId: string, quantity: number) => boolean;
  activateTechnique: (techniqueId: string | null) => void;
  claimQuest: (questId: string) => boolean;
  startCombat: (areaId: string) => void;
  stopCombat: () => void;
  startDungeon: (dungeonId: string) => boolean;
  forgeEquipment: (equipDefId: string) => boolean;
  enhanceEquipment: (slot: EquipmentSlotId) => boolean;
  unequipItem: (slot: EquipmentSlotId) => void;
  equipFromInventory: (equipDefId: string) => boolean;
  updateCombatSupplyConfig: (config: Partial<import('../core/types').CombatSupplyConfig>) => void;
  startMeditation: () => void;
  stopMeditation: () => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...DEFAULT_STATE,

    tick(deltaMs: number) {
      set((state) => {
        const now = Date.now();
        const isPillActive = now < state.gatheringPillEndTime;

        // Compute spirit stats for current stage
        const spiritStats = computeSpiritStats(state.cultivation.stageIndex);
        state.resources.spiritMax = spiritStats.spiritMax;
        state.resources.spiritPerSec = spiritStats.spiritPerSec;

        // Update activeActivity based on actual active states
        state.activeActivity = getActiveActivity(state as GameState);

        const seconds = deltaMs / 1000;
        let expGainThisTick = 0;

        // ─── Meditation tick ──────────────────────────────────────────────
        if (state.meditation.isActive) {
          const regenRate = computeMeditationRegenRate(
            state.cultivation.stageIndex,
            state.cultivation.activeTechniqueId,
            isPillActive,
          );

          // Apply equipment meditation bonus
          const equipBonuses = getEquipmentBonuses(state.equipment);
          const effectiveRegen = regenRate * (1 + (equipBonuses.meditationPercent ?? 0));

          const spiritGain = effectiveRegen * seconds;
          const newSpirit = state.resources.spirit + spiritGain;

          if (newSpirit > spiritStats.spiritMax) {
            // Overflow spirit becomes exp
            const overflow = newSpirit - spiritStats.spiritMax;
            expGainThisTick += overflow;
            state.resources.spirit = spiritStats.spiritMax;
          } else {
            state.resources.spirit = newSpirit;
          }
        }

        // ─── Combat tick ──────────────────────────────────────────────────
        if (state.combat.isActive) {
          // Combat consumes spirit
          const spiritCost = getCombatSpiritCost(state.cultivation.stageIndex) * seconds;
          const newSpirit = state.resources.spirit - spiritCost;

          if (newSpirit <= 0) {
            // Out of spirit, stop combat
            state.resources.spirit = 0;
            state.combat.isActive = false;
            state.combat.currentAreaId = null;
          } else {
            state.resources.spirit = newSpirit;

            const playerStats = getPlayerCombatStats(state.cultivation.stageIndex, state.equipment, state.skills.combat.level);
            const area = getCombatArea(state.combat.currentAreaId ?? '');
            const combatDurationMs = area?.combatDurationMs ?? 5000;
            const combatResult = tickCombat(
              state.combat,
              playerStats,
              state.inventory,
              deltaMs,
              combatDurationMs,
            );
            if (combatResult.expGain > 0) {
              state.skills.combat = addSkillExp(state.skills.combat, combatResult.expGain);
              // Combat gives cultivation exp
              expGainThisTick += combatResult.expGain;
            }
            if (combatResult.spiritStonesGain > 0) {
              // Spirit stones go into inventory
              state.inventory.items['spirit_stone'] = (state.inventory.items['spirit_stone'] ?? 0) + combatResult.spiritStonesGain;
              // Track daily quest
              state.dailyQuests = updateQuestProgress(state.dailyQuests, { spiritStonesEarned: combatResult.spiritStonesGain });
            }
            if (combatResult.combat.lastCombatResult === 'victory') {
              state.stats.totalMonstersKilled += 1;
            }
            state.combat = combatResult.combat;
            state.inventory = combatResult.inventory;

            // ─── Combat supply auto-consume ─────────────────────────────
            const supply = state.combatSupply;
            const supplyConfig = supply.config;
            const combatPlayerStats = getPlayerCombatStats(state.cultivation.stageIndex, state.equipment, state.skills.combat.level);

            // Auto-use HP item when HP% drops below threshold
            if (supplyConfig.hpItemId && state.combat.isActive && state.combat.playerHp > 0) {
              const hpPercent = (state.combat.playerHp / combatPlayerStats.maxHp) * 100;
              if (hpPercent < supplyConfig.hpThreshold && supply.hpItemsUsed < supplyConfig.hpItemCount) {
                const hpItemQty = state.inventory.items[supplyConfig.hpItemId] ?? 0;
                if (hpItemQty > 0) {
                  state.inventory.items[supplyConfig.hpItemId] = hpItemQty - 1;
                  const pillEffect = PILL_COMBAT_EFFECTS[supplyConfig.hpItemId];
                  const hpRestoreRatio = pillEffect ? pillEffect.hpRecovery : 0.30;
                  state.combat.playerHp = Math.min(combatPlayerStats.maxHp, state.combat.playerHp + combatPlayerStats.maxHp * hpRestoreRatio);
                  state.combatSupply.hpItemsUsed += 1;
                }
              }
            }

            // Auto-use spirit item when spirit% drops below threshold
            if (supplyConfig.spiritItemId && state.combat.isActive) {
              const spiritPercent = (state.resources.spirit / state.resources.spiritMax) * 100;
              if (spiritPercent < supplyConfig.spiritThreshold && supply.spiritItemsUsed < supplyConfig.spiritItemCount) {
                const spiritItemQty = state.inventory.items[supplyConfig.spiritItemId] ?? 0;
                if (spiritItemQty > 0) {
                  state.inventory.items[supplyConfig.spiritItemId] = spiritItemQty - 1;
                  const pillEffect = PILL_COMBAT_EFFECTS[supplyConfig.spiritItemId];
                  const spiritRestoreRatio = pillEffect ? pillEffect.spiritRecovery : 0.30;
                  state.resources.spirit = Math.min(state.resources.spiritMax, state.resources.spirit + state.resources.spiritMax * spiritRestoreRatio);
                  state.combatSupply.spiritItemsUsed += 1;
                }
              }
            }
          }
        }

        // ─── Dungeon tick ─────────────────────────────────────────────────
        if (state.dungeon.isActive) {
          // Dungeon consumes spirit
          const spiritCost = getCombatSpiritCost(state.cultivation.stageIndex) * seconds;
          const newSpirit = state.resources.spirit - spiritCost;

          if (newSpirit <= 0) {
            state.resources.spirit = 0;
            state.dungeon.isActive = false;
            state.dungeon.currentDungeonId = null;
          } else {
            state.resources.spirit = newSpirit;

            const playerStats = getPlayerCombatStats(state.cultivation.stageIndex, state.equipment, state.skills.combat.level);
            const dungeonResult = tickDungeon(
              state.dungeon,
              playerStats,
              state.inventory,
              deltaMs,
            );
            if (dungeonResult.expGain > 0) {
              state.skills.combat = addSkillExp(state.skills.combat, dungeonResult.expGain);
              expGainThisTick += dungeonResult.expGain;
            }
            if (dungeonResult.spiritStonesGain > 0) {
              state.inventory.items['spirit_stone'] = (state.inventory.items['spirit_stone'] ?? 0) + dungeonResult.spiritStonesGain;
              state.dailyQuests = updateQuestProgress(state.dailyQuests, { spiritStonesEarned: dungeonResult.spiritStonesGain });
            }
            if (dungeonResult.bossDefeated) {
              state.stats.totalBossesKilled += 1;
            }
            if (dungeonResult.dungeonCompleted) {
              state.stats.totalDungeonClears += 1;
            }
            state.dungeon = dungeonResult.dungeon;
            state.inventory = dungeonResult.inventory;

            // ─── Dungeon supply auto-consume ────────────────────────────
            const dSupply = state.combatSupply;
            const dConfig = dSupply.config;
            const dungeonPlayerStats = getPlayerCombatStats(state.cultivation.stageIndex, state.equipment, state.skills.combat.level);

            // Auto-use HP item
            if (dConfig.hpItemId && state.dungeon.isActive && state.dungeon.playerHp > 0) {
              const hpPct = (state.dungeon.playerHp / dungeonPlayerStats.maxHp) * 100;
              if (hpPct < dConfig.hpThreshold && dSupply.hpItemsUsed < dConfig.hpItemCount) {
                const qty = state.inventory.items[dConfig.hpItemId] ?? 0;
                if (qty > 0) {
                  state.inventory.items[dConfig.hpItemId] = qty - 1;
                  const pillEffect = PILL_COMBAT_EFFECTS[dConfig.hpItemId];
                  const hpRestoreRatio = pillEffect ? pillEffect.hpRecovery : 0.30;
                  state.dungeon.playerHp = Math.min(dungeonPlayerStats.maxHp, state.dungeon.playerHp + dungeonPlayerStats.maxHp * hpRestoreRatio);
                  state.combatSupply.hpItemsUsed += 1;
                }
              }
            }

            // Auto-use spirit item
            if (dConfig.spiritItemId && state.dungeon.isActive) {
              const sPct = (state.resources.spirit / state.resources.spiritMax) * 100;
              if (sPct < dConfig.spiritThreshold && dSupply.spiritItemsUsed < dConfig.spiritItemCount) {
                const qty = state.inventory.items[dConfig.spiritItemId] ?? 0;
                if (qty > 0) {
                  state.inventory.items[dConfig.spiritItemId] = qty - 1;
                  const pillEffect = PILL_COMBAT_EFFECTS[dConfig.spiritItemId];
                  const spiritRestoreRatio = pillEffect ? pillEffect.spiritRecovery : 0.30;
                  state.resources.spirit = Math.min(state.resources.spiritMax, state.resources.spirit + state.resources.spiritMax * spiritRestoreRatio);
                  state.combatSupply.spiritItemsUsed += 1;
                }
              }
            }
          }
        }

        // ─── Apply exp gain and progress ──────────────────────────────────
        if (expGainThisTick > 0) {
          state.resources.exp = applyExpGain(state.resources.exp, expGainThisTick);
        }

        // Progress gain is based on exp gain rate this tick
        const effectiveExpPerSec = expGainThisTick / seconds;
        if (effectiveExpPerSec > 0) {
          const progressGain = computeProgressGain(effectiveExpPerSec, deltaMs);
          const newProgress = Math.min(100, state.cultivation.progress + progressGain);
          state.cultivation.progress = newProgress;

          // Sub-stage auto-advance
          const advResult = tryAdvanceSubStage(state.cultivation);
          if (advResult.advanced) {
            state.cultivation.subStageIndex = advResult.newSubStageIndex;
            state.cultivation.progress = advResult.newProgress;
          }
        }

        state.lastTickTime = now;

        // ─── Herb growth (always ticks, exempt from activity mutex) ───────
        const updatedPlots = tickHerbGrowth(state.herbPlots as HerbPlot[], now);
        state.herbPlots = updatedPlots;

        // ─── Fishing tick ─────────────────────────────────────────────────
        const prevFishCount = state.fishing.totalFishCaught;
        const fishingLevel = state.skills.fishing.level;
        const fishingResult = tickFishing(
          state.fishing,
          fishingLevel,
          state.inventory,
          deltaMs,
        );
        if (fishingResult.expGain > 0) {
          state.skills.fishing = addSkillExp(state.skills.fishing, fishingResult.expGain);
        }
        state.fishing = fishingResult.fishing;
        state.inventory = fishingResult.inventory;

        // ─── Alchemy tick ─────────────────────────────────────────────────
        const prevPillCount = state.alchemy.totalPillsCrafted;
        const alchemyLevel = state.skills.alchemy.level;
        const alchemyResult = tickAlchemy(
          state.alchemy,
          alchemyLevel,
          state.inventory,
          deltaMs,
          state.cultivation.stageIndex,
        );
        if (alchemyResult.expGain > 0) {
          state.skills.alchemy = addSkillExp(state.skills.alchemy, alchemyResult.expGain);
        }
        state.alchemy = alchemyResult.alchemy;
        state.inventory = alchemyResult.inventory;

        // ─── Refresh dungeon daily ────────────────────────────────────────
        state.dungeon = refreshDungeonDaily(state.dungeon);

        // ─── Track daily quest progress ───────────────────────────────────
        const fishCaughtDelta = state.fishing.totalFishCaught - prevFishCount;
        const pillsCraftedDelta = state.alchemy.totalPillsCrafted - prevPillCount;

        if (fishCaughtDelta > 0 || pillsCraftedDelta > 0) {
          state.dailyQuests = refreshDailyQuestsIfNeeded(state.dailyQuests);
          state.dailyQuests = updateQuestProgress(state.dailyQuests, {
            fishCaught: fishCaughtDelta,
            pillsCrafted: pillsCraftedDelta,
          });
        } else {
          state.dailyQuests = refreshDailyQuestsIfNeeded(state.dailyQuests);
        }

        // ─── Achievement check ────────────────────────────────────────────
        const achieveResult = checkAchievements(state.achievements, state as GameState);
        if (achieveResult.newlyUnlocked.length > 0) {
          state.achievements = achieveResult.updated;
        }
      });
    },

    breakthrough(): boolean {
      const state = get();
      const result = attemptBreakthrough(state.cultivation, state.inventory);
      if (!result.success) return false;
      const hasPill = result.pillConsumed ?? false;
      const cost = getBreakthroughCost(state.cultivation.stageIndex, hasPill);
      set((draft) => {
        // Deduct spirit stones from inventory
        draft.inventory.items['spirit_stone'] = (draft.inventory.items['spirit_stone'] ?? 0) - cost;
        draft.cultivation.stageIndex = result.newStageIndex!;
        draft.cultivation.subStageIndex = 0;
        draft.cultivation.progress = 0;
        if (result.newStageIndex === MAX_STAGE_INDEX) draft.cultivation.totalAscensions += 1;
        // Consume breakthrough pill if used
        if (hasPill) {
          const nextStage = STAGES[result.newStageIndex!];
          if (nextStage?.breakPillId) {
            const pillId = nextStage.breakPillId;
            draft.inventory.items[pillId] = Math.max(0, (draft.inventory.items[pillId] ?? 0) - 1);
          }
        }
        // Update spirit stats for new stage
        const newSpiritStats = computeSpiritStats(result.newStageIndex!);
        draft.resources.spiritMax = newSpiritStats.spiritMax;
        draft.resources.spiritPerSec = newSpiritStats.spiritPerSec;
      });
      return true;
    },

    saveGame() {
      const state = get();
      const snapshot: GameState = {
        resources: state.resources,
        cultivation: state.cultivation,
        activeActivity: state.activeActivity,
        meditation: state.meditation,
        lastSaveTime: Date.now(),
        lastTickTime: state.lastTickTime,
        version: state.version,
        inventory: state.inventory,
        skills: state.skills,
        herbPlots: state.herbPlots,
        fishing: state.fishing,
        alchemy: state.alchemy,
        gatheringPillEndTime: state.gatheringPillEndTime,
        achievements: state.achievements,
        dailyQuests: state.dailyQuests,
        stats: state.stats,
        combat: state.combat,
        dungeon: state.dungeon,
        equipment: state.equipment,
        combatSupply: state.combatSupply,
      };
      SaveManager.save(snapshot);
      set((draft) => { draft.lastSaveTime = snapshot.lastSaveTime; });
    },

    loadGame() {
      const saved = SaveManager.load();
      if (!saved) return;
      set((draft) => { Object.assign(draft, saved); });
    },

    resetGame() {
      SaveManager.deleteSave();
      set(() => ({ ...DEFAULT_STATE, lastSaveTime: Date.now(), lastTickTime: Date.now() }));
    },

    plantHerb(plotId: string, herbId: string): boolean {
      const state = get();
      const result = plantHerbSystem(state.herbPlots, plotId, herbId, state.inventory);
      if (!result.success) return false;
      set((draft) => {
        draft.herbPlots = result.plots;
        draft.inventory = result.inventory;
      });
      return true;
    },

    harvestHerb(plotId: string): boolean {
      const state = get();
      const farmingLevel = state.skills.farming.level;
      const result = harvestHerbSystem(state.herbPlots, plotId, farmingLevel);
      if (!result) return false;
      set((draft) => {
        draft.herbPlots = result.plots;
        const newItems = { ...draft.inventory.items };
        for (const item of result.items) {
          newItems[item.itemId] = (newItems[item.itemId] ?? 0) + item.quantity;
        }
        draft.inventory.items = newItems;
        draft.skills.farming = addSkillExp(draft.skills.farming, result.exp);
        draft.stats.totalHerbsHarvested += result.items.reduce((sum, i) => sum + i.quantity, 0);
        draft.dailyQuests = updateQuestProgress(draft.dailyQuests, { herbsHarvested: 1 });
      });
      return true;
    },

    startFishing(areaId: string): void {
      const area = FISHING_AREAS.find(a => a.id === areaId);
      if (!area) return;
      const state = get();
      if (state.skills.fishing.level < area.requiredLevel) return;
      // Activity mutex check: can't fish while doing another activity
      const currentActivity = getActiveActivity(state);
      if (currentActivity !== null) return;
      set((draft) => {
        draft.fishing = { isActive: true, currentAreaId: areaId, progressMs: 0, totalFishCaught: draft.fishing.totalFishCaught };
        draft.activeActivity = 'fishing';
      });
    },

    stopFishing(): void {
      set((draft) => {
        draft.fishing.isActive = false;
        draft.fishing.progressMs = 0;
        draft.activeActivity = null;
      });
    },

    startAlchemy(recipeId: string): void {
      const recipe = getRecipe(recipeId);
      if (!recipe) return;
      const state = get();
      if (state.skills.alchemy.level < recipe.alchemyLevelRequired) return;
      if (!canCraft(recipe, state.inventory)) return;
      // Activity mutex check
      const currentActivity = getActiveActivity(state);
      if (currentActivity !== null) return;
      set((draft) => {
        draft.alchemy = { isActive: true, currentRecipeId: recipeId, progressMs: 0, totalPillsCrafted: draft.alchemy.totalPillsCrafted };
        draft.activeActivity = 'alchemy';
      });
    },

    stopAlchemy(): void {
      set((draft) => {
        draft.alchemy.isActive = false;
        draft.alchemy.progressMs = 0;
        draft.activeActivity = null;
      });
    },

    unlockHerbPlot(plotIndex: number): boolean {
      const state = get();
      if (plotIndex < 0 || plotIndex >= state.herbPlots.length) return false;
      const plot = state.herbPlots[plotIndex];
      if (plot.isUnlocked) return false;
      const cost = PLOT_UNLOCK_COSTS[plotIndex];
      if (!cost) return false;
      const farmingLevel = state.skills.farming.level;
      if (farmingLevel < cost.levelRequired) return false;
      const stones = getSpiritStoneCount(state.inventory);
      if (stones < cost.spiritStones) return false;
      set((draft) => {
        draft.herbPlots[plotIndex].isUnlocked = true;
        if (cost.spiritStones > 0) {
          draft.inventory.items['spirit_stone'] = (draft.inventory.items['spirit_stone'] ?? 0) - cost.spiritStones;
        }
      });
      return true;
    },

    useItem(itemId: string): boolean {
      const state = get();
      const qty = state.inventory.items[itemId] ?? 0;
      if (qty < 1) return false;
      if (itemId === 'gathering_pill') {
        set((draft) => {
          draft.inventory.items[itemId] = qty - 1;
          draft.gatheringPillEndTime = Date.now() + GATHERING_PILL_DURATION_MS;
        });
        return true;
      }
      return false;
    },

    sellItem(itemId: string, quantity: number): boolean {
      const state = get();
      if (itemId === 'spirit_stone') return false; // Can't sell spirit stones
      const def = getItem(itemId);
      if (!def || !def.sellPrice) return false;
      const currentQty = state.inventory.items[itemId] ?? 0;
      if (currentQty < quantity || quantity <= 0) return false;
      const totalPrice = def.sellPrice * quantity;
      set((draft) => {
        draft.inventory.items[itemId] = currentQty - quantity;
        draft.inventory.items['spirit_stone'] = (draft.inventory.items['spirit_stone'] ?? 0) + totalPrice;
        // Track daily quest progress
        draft.dailyQuests = updateQuestProgress(draft.dailyQuests, { spiritStonesEarned: totalPrice });
      });
      return true;
    },

    activateTechnique(techniqueId: string | null): void {
      const state = get();
      if (techniqueId !== null) {
        const technique = getTechnique(techniqueId);
        if (!technique) return;
        if (state.cultivation.stageIndex < technique.requiredStage) return;
      }
      set((draft) => {
        draft.cultivation.activeTechniqueId = techniqueId;
      });
    },

    claimQuest(questId: string): boolean {
      const state = get();
      const questProgress = state.dailyQuests.quests.find(q => q.questId === questId);
      if (!questProgress || !questProgress.completed || questProgress.claimed) return false;

      const { updatedInventory } = claimQuestReward(questId, state.inventory);
      set((draft) => {
        const qp = draft.dailyQuests.quests.find(q => q.questId === questId);
        if (qp) qp.claimed = true;
        draft.inventory = updatedInventory;
        draft.stats.totalQuestsCompleted += 1;
      });
      return true;
    },

    startCombat(areaId: string): void {
      const state = get();
      const area = getCombatArea(areaId);
      if (!area) return;
      if (state.cultivation.stageIndex < area.requiredStage) return;
      // Activity mutex check
      const currentActivity = getActiveActivity(state);
      if (currentActivity !== null) return;
      // Need spirit to fight
      if (state.resources.spirit <= 0) return;
      const playerStats = getPlayerCombatStats(state.cultivation.stageIndex, state.equipment, state.skills.combat.level);
      set((draft) => {
        draft.combat = {
          isActive: true,
          currentAreaId: areaId,
          currentEnemyId: null,
          enemyHp: 0,
          enemyMaxHp: 0,
          playerHp: playerStats.maxHp,
          totalKills: draft.combat.totalKills,
          totalBossKills: draft.combat.totalBossKills,
          loot: [],
          lastCombatResult: 'none',
        };
        draft.activeActivity = 'combat';
        // Reset supply counters for new combat session
        draft.combatSupply.spiritItemsUsed = 0;
        draft.combatSupply.hpItemsUsed = 0;
      });
    },

    stopCombat(): void {
      set((draft) => {
        draft.combat.isActive = false;
        draft.combat.currentAreaId = null;
        draft.activeActivity = null;
      });
    },

    startDungeon(dungeonId: string): boolean {
      const state = get();
      // Activity mutex check
      const currentActivity = getActiveActivity(state);
      if (currentActivity !== null) return false;
      if (!canEnterDungeon(state.dungeon, dungeonId, state.cultivation.stageIndex)) return false;
      // Need spirit
      if (state.resources.spirit <= 0) return false;
      const playerStats = getPlayerCombatStats(state.cultivation.stageIndex, state.equipment, state.skills.combat.level);
      set((draft) => {
        draft.dungeon = startDungeonSystem(draft.dungeon, dungeonId, playerStats.maxHp);
        draft.activeActivity = 'dungeon';
        // Reset supply counters for new dungeon session
        draft.combatSupply.spiritItemsUsed = 0;
        draft.combatSupply.hpItemsUsed = 0;
      });
      return true;
    },

    forgeEquipment(equipDefId: string): boolean {
      const state = get();
      const def = getEquipment(equipDefId);
      if (!def) return false;
      const spiritStones = getSpiritStoneCount(state.inventory);
      if (!canForge(def, state.inventory, spiritStones, state.skills.forging.level, state.cultivation.stageIndex)) return false;

      const result = forgeEquipmentSystem(equipDefId, state.equipment, state.inventory);
      if (!result.success) return false;

      set((draft) => {
        draft.equipment = result.equipment;
        draft.inventory = result.inventory;
        // Deduct spirit stones from inventory
        draft.inventory.items['spirit_stone'] = (draft.inventory.items['spirit_stone'] ?? 0) - result.spiritStonesCost;
        draft.skills.forging = addSkillExp(draft.skills.forging, result.exp);
        draft.stats.totalEquipmentForged += 1;
      });
      return true;
    },

    enhanceEquipment(slot: EquipmentSlotId): boolean {
      const state = get();
      const instance = state.equipment.equipped[slot];
      if (!instance) return false;
      const spiritStones = getSpiritStoneCount(state.inventory);
      if (!canEnhance(instance, state.inventory, spiritStones)) return false;

      const result = enhanceEquipmentSystem(slot, state.equipment, state.inventory);
      if (!result.success) return false;

      set((draft) => {
        draft.equipment = result.equipment;
        draft.inventory = result.inventory;
        draft.inventory.items['spirit_stone'] = (draft.inventory.items['spirit_stone'] ?? 0) - result.spiritStonesCost;
        draft.skills.forging = addSkillExp(draft.skills.forging, result.exp);
      });
      return true;
    },

    unequipItem(slot: EquipmentSlotId): void {
      set((draft) => {
        const instance = draft.equipment.equipped[slot];
        if (instance) {
          draft.inventory.items[instance.defId] = (draft.inventory.items[instance.defId] ?? 0) + 1;
          delete draft.equipment.equipped[slot];
        }
      });
    },

    equipFromInventory(equipDefId: string): boolean {
      const state = get();
      const def = getEquipment(equipDefId);
      if (!def) return false;
      const qty = state.inventory.items[equipDefId] ?? 0;
      if (qty <= 0) return false;

      set((draft) => {
        // Return currently equipped item in that slot back to inventory
        const current = draft.equipment.equipped[def.slot];
        if (current) {
          draft.inventory.items[current.defId] = (draft.inventory.items[current.defId] ?? 0) + 1;
        }
        // Equip the new item
        draft.equipment.equipped[def.slot] = { defId: equipDefId, level: 0 };
        // Remove from inventory
        const newQty = (draft.inventory.items[equipDefId] ?? 0) - 1;
        if (newQty <= 0) {
          delete draft.inventory.items[equipDefId];
        } else {
          draft.inventory.items[equipDefId] = newQty;
        }
      });
      return true;
    },

    updateCombatSupplyConfig(config: Partial<import('../core/types').CombatSupplyConfig>): void {
      set((draft) => {
        Object.assign(draft.combatSupply.config, config);
      });
    },

    startMeditation(): void {
      const state = get();
      // Activity mutex check
      const currentActivity = getActiveActivity(state);
      if (currentActivity !== null) return;
      set((draft) => {
        draft.meditation.isActive = true;
        draft.activeActivity = 'meditation';
      });
    },

    stopMeditation(): void {
      set((draft) => {
        draft.meditation.isActive = false;
        draft.activeActivity = null;
      });
    },
  })),
);


export const selectStage = (state: GameStore) => STAGES[state.cultivation.stageIndex];
export const selectBreakthroughCost = (state: GameStore) => {
  const hasPill = hasBreakthroughPill(state.cultivation.stageIndex, state.inventory);
  return getBreakthroughCost(state.cultivation.stageIndex, hasPill);
};
export const selectBreakthroughCostWithoutPill = (state: GameStore) => {
  return getBreakthroughCost(state.cultivation.stageIndex, false);
};
export const selectHasBreakthroughPill = (state: GameStore) => hasBreakthroughPill(state.cultivation.stageIndex, state.inventory);
export const selectIsAtFinalSubStage = (state: GameStore) => isAtFinalSubStage(state.cultivation);
export const selectSpiritStones = (state: GameStore) => state.inventory.items['spirit_stone'] ?? 0;
