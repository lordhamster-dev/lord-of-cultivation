import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import Decimal from 'break_eternity.js';
import { STAGES, MAX_STAGE_INDEX } from '../core/data/stages';
import { UPGRADES } from '../core/data/upgrades';
import { getTechnique } from '../core/data/techniques';
import { computeResourceGain, applyResourceGain } from '../core/systems/ResourceSystem';
import { computeProductionRates, getUpgradeCost } from '../core/systems/ProductionSystem';
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
import { PLOT_UNLOCK_COSTS } from '../core/data/herbs';
import { FISHING_AREAS } from '../core/data/fish';
import { getRecipe } from '../core/data/recipes';
import { getCombatArea } from '../core/data/enemies';
import { getEquipment } from '../core/data/equipment';
import { SaveManager } from '../save/SaveManager';
import type { GameState, EquipmentSlotId } from '../core/types';
import { SAVE_VERSION } from '../core/types';
import type { HerbPlot } from '../core/types';

export const GATHERING_PILL_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const DEFAULT_STATE: GameState = {
  resources: { spiritStones: '50', exp: '0', spiritStonesPerSec: 0, expPerSec: 0, spirit: 100, spiritMax: 100, spiritPerSec: 5 },
  cultivation: { stageIndex: 0, subStageIndex: 0, progress: 0, totalAscensions: 0, activeTechniqueId: null },
  upgrades: {},
  lastSaveTime: Date.now(),
  lastTickTime: Date.now(),
  version: SAVE_VERSION,
  inventory: { items: {} },
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
};

interface GameActions {
  tick: (deltaMs: number) => void;
  buyUpgrade: (id: string) => boolean;
  breakthrough: () => boolean;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  applyOfflineProgress: (cappedMs: number) => { spiritStones: string; exp: string };
  plantHerb: (plotId: string, herbId: string) => boolean;
  harvestHerb: (plotId: string) => boolean;
  startFishing: (areaId: string) => void;
  stopFishing: () => void;
  startAlchemy: (recipeId: string) => void;
  stopAlchemy: () => void;
  unlockHerbPlot: (plotIndex: number) => boolean;
  useItem: (itemId: string) => boolean;
  activateTechnique: (techniqueId: string | null) => void;
  claimQuest: (questId: string) => boolean;
  startCombat: (areaId: string) => void;
  stopCombat: () => void;
  startDungeon: (dungeonId: string) => boolean;
  forgeEquipment: (equipDefId: string) => boolean;
  enhanceEquipment: (slot: EquipmentSlotId) => boolean;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...DEFAULT_STATE,

    tick(deltaMs: number) {
      set((state) => {
        const now = Date.now();
        const isPillActive = now < state.gatheringPillEndTime;
        const rates = computeProductionRates(state.cultivation.stageIndex, state.upgrades, state.cultivation.activeTechniqueId, state.equipment);
        const effectiveStonesPerSec = isPillActive ? rates.spiritStonesPerSec * 1.5 : rates.spiritStonesPerSec;
        state.resources.spiritStonesPerSec = effectiveStonesPerSec;
        state.resources.expPerSec = rates.expPerSec;
        state.resources.spiritMax = rates.spiritMax;

        // Spirit tick
        state.resources.spiritPerSec = rates.spiritPerSec;
        const newSpirit = Math.min(
          rates.spiritMax,
          Math.max(0, state.resources.spirit + rates.spiritPerSec * (deltaMs / 1000)),
        );
        // If spirit runs out, deactivate technique
        if (newSpirit <= 0 && state.cultivation.activeTechniqueId !== null) {
          state.cultivation.activeTechniqueId = null;
        }
        state.resources.spirit = newSpirit;

        const { spiritStonesDelta, expDelta } = computeResourceGain(state.resources, deltaMs);
        const { spiritStones, exp } = applyResourceGain(state.resources, spiritStonesDelta, expDelta);
        state.resources.spiritStones = spiritStones;
        state.resources.exp = exp;
        const progressGain = computeProgressGain(state.resources.expPerSec, deltaMs);
        const newProgress = Math.min(100, state.cultivation.progress + progressGain);
        state.cultivation.progress = newProgress;

        // Sub-stage auto-advance
        const advResult = tryAdvanceSubStage(state.cultivation);
        if (advResult.advanced) {
          state.cultivation.subStageIndex = advResult.newSubStageIndex;
          state.cultivation.progress = advResult.newProgress;
        }

        state.lastTickTime = now;

        // Herb growth
        const updatedPlots = tickHerbGrowth(state.herbPlots as HerbPlot[], now);
        state.herbPlots = updatedPlots;

        // Fishing tick
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

        // Alchemy tick
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

        // Combat tick
        if (state.combat.isActive) {
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
          }
          if (combatResult.spiritStonesGain > 0) {
            state.resources.spiritStones = new Decimal(state.resources.spiritStones).add(combatResult.spiritStonesGain).toString();
          }
          if (combatResult.combat.lastCombatResult === 'victory') {
            state.stats.totalMonstersKilled += 1;
          }
          state.combat = combatResult.combat;
          state.inventory = combatResult.inventory;
        }

        // Dungeon tick
        if (state.dungeon.isActive) {
          const playerStats = getPlayerCombatStats(state.cultivation.stageIndex, state.equipment, state.skills.combat.level);
          const dungeonResult = tickDungeon(
            state.dungeon,
            playerStats,
            state.inventory,
            deltaMs,
          );
          if (dungeonResult.expGain > 0) {
            state.skills.combat = addSkillExp(state.skills.combat, dungeonResult.expGain);
          }
          if (dungeonResult.spiritStonesGain > 0) {
            state.resources.spiritStones = new Decimal(state.resources.spiritStones).add(dungeonResult.spiritStonesGain).toString();
          }
          if (dungeonResult.bossDefeated) {
            state.stats.totalBossesKilled += 1;
          }
          if (dungeonResult.dungeonCompleted) {
            state.stats.totalDungeonClears += 1;
          }
          state.dungeon = dungeonResult.dungeon;
          state.inventory = dungeonResult.inventory;
        }

        // Refresh dungeon daily
        state.dungeon = refreshDungeonDaily(state.dungeon);

        // Track daily quest progress
        const fishCaughtDelta = state.fishing.totalFishCaught - prevFishCount;
        const pillsCraftedDelta = state.alchemy.totalPillsCrafted - prevPillCount;
        // Use the raw production delta (always positive) rather than net change
        const stonesEarnedDelta = parseFloat(spiritStonesDelta.toString());

        if (fishCaughtDelta > 0 || pillsCraftedDelta > 0 || stonesEarnedDelta > 0) {
          state.dailyQuests = refreshDailyQuestsIfNeeded(state.dailyQuests);
          state.dailyQuests = updateQuestProgress(state.dailyQuests, {
            fishCaught: fishCaughtDelta,
            pillsCrafted: pillsCraftedDelta,
            spiritStonesEarned: stonesEarnedDelta,
          });
        } else {
          // Still check for day reset
          state.dailyQuests = refreshDailyQuestsIfNeeded(state.dailyQuests);
        }

        // Achievement check
        const achieveResult = checkAchievements(state.achievements, state as GameState);
        if (achieveResult.newlyUnlocked.length > 0) {
          state.achievements = achieveResult.updated;
        }
      });
    },

    buyUpgrade(id: string): boolean {
      const state = get();
      const upgradeDef = UPGRADES.find((u) => u.id === id);
      if (!upgradeDef) return false;
      const currentLevel = state.upgrades[id] ?? 0;
      if (upgradeDef.maxLevel !== undefined && currentLevel >= upgradeDef.maxLevel) return false;
      const cost = getUpgradeCost(id, currentLevel);
      const stones = new Decimal(state.resources.spiritStones);
      if (stones.lt(cost)) return false;
      set((draft) => {
        draft.resources.spiritStones = stones.sub(cost).toString();
        draft.upgrades[id] = currentLevel + 1;
        // Track daily upgrade quest
        draft.dailyQuests = updateQuestProgress(draft.dailyQuests, { upgradesBought: 1 });
      });
      return true;
    },

    breakthrough(): boolean {
      const state = get();
      const alchemyLevel = state.upgrades['alchemy'] ?? 0;
      const alchemyDef = UPGRADES.find((u) => u.id === 'alchemy');
      const alchemyRatio = alchemyDef ? alchemyDef.effect(alchemyLevel) : 1;
      const result = attemptBreakthrough(state.cultivation, state.resources, alchemyRatio, state.inventory);
      if (!result.success) return false;
      const hasPill = result.pillConsumed ?? false;
      const cost = getBreakthroughCost(state.cultivation.stageIndex, alchemyRatio, hasPill);
      set((draft) => {
        draft.resources.spiritStones = new Decimal(draft.resources.spiritStones).sub(cost).toString();
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
      });
      return true;
    },

    saveGame() {
      const state = get();
      const snapshot: GameState = {
        resources: state.resources,
        cultivation: state.cultivation,
        upgrades: state.upgrades,
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
      };
      SaveManager.save(snapshot);
      set((draft) => { draft.lastSaveTime = snapshot.lastSaveTime; });
    },

    loadGame() {
      const saved = SaveManager.load();
      if (!saved) return;
      set((draft) => { Object.assign(draft, saved); });
    },

    applyOfflineProgress(cappedMs: number) {
      const state = get();
      const rates = computeProductionRates(state.cultivation.stageIndex, state.upgrades);
      const tempResources = { ...state.resources, spiritStonesPerSec: rates.spiritStonesPerSec, expPerSec: rates.expPerSec };
      const { spiritStonesDelta, expDelta } = computeResourceGain(tempResources, cappedMs);
      const { spiritStones, exp } = applyResourceGain(tempResources, spiritStonesDelta, expDelta);
      set((draft) => {
        draft.resources.spiritStones = spiritStones;
        draft.resources.exp = exp;
        draft.resources.spiritStonesPerSec = rates.spiritStonesPerSec;
        draft.resources.expPerSec = rates.expPerSec;
        draft.lastTickTime = Date.now();
      });
      return { spiritStones: spiritStonesDelta.toString(), exp: expDelta.toString() };
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
        // Track herb quest
        draft.dailyQuests = updateQuestProgress(draft.dailyQuests, { herbsHarvested: 1 });
      });
      return true;
    },

    startFishing(areaId: string): void {
      const area = FISHING_AREAS.find(a => a.id === areaId);
      if (!area) return;
      const state = get();
      if (state.skills.fishing.level < area.requiredLevel) return;
      set((draft) => {
        draft.fishing = { isActive: true, currentAreaId: areaId, progressMs: 0, totalFishCaught: draft.fishing.totalFishCaught };
      });
    },

    stopFishing(): void {
      set((draft) => {
        draft.fishing.isActive = false;
        draft.fishing.progressMs = 0;
      });
    },

    startAlchemy(recipeId: string): void {
      const recipe = getRecipe(recipeId);
      if (!recipe) return;
      const state = get();
      if (state.skills.alchemy.level < recipe.alchemyLevelRequired) return;
      if (!canCraft(recipe, state.inventory)) return;
      set((draft) => {
        draft.alchemy = { isActive: true, currentRecipeId: recipeId, progressMs: 0, totalPillsCrafted: draft.alchemy.totalPillsCrafted };
      });
    },

    stopAlchemy(): void {
      set((draft) => {
        draft.alchemy.isActive = false;
        draft.alchemy.progressMs = 0;
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
      const stones = new Decimal(state.resources.spiritStones);
      if (stones.lt(cost.spiritStones)) return false;
      set((draft) => {
        draft.herbPlots[plotIndex].isUnlocked = true;
        if (cost.spiritStones > 0) {
          draft.resources.spiritStones = stones.sub(cost.spiritStones).toString();
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

    activateTechnique(techniqueId: string | null): void {
      const state = get();
      if (techniqueId !== null) {
        const technique = getTechnique(techniqueId);
        if (!technique) return;
        if (state.cultivation.stageIndex < technique.requiredStage) return;
        if (state.resources.spirit <= 0) return;
      }
      set((draft) => {
        draft.cultivation.activeTechniqueId = techniqueId;
      });
    },

    claimQuest(questId: string): boolean {
      const state = get();
      const questProgress = state.dailyQuests.quests.find(q => q.questId === questId);
      if (!questProgress || !questProgress.completed || questProgress.claimed) return false;

      const { spiritStonesBonus, updatedInventory } = claimQuestReward(questId, state.inventory);
      set((draft) => {
        const qp = draft.dailyQuests.quests.find(q => q.questId === questId);
        if (qp) qp.claimed = true;
        if (spiritStonesBonus > 0) {
          draft.resources.spiritStones = new Decimal(draft.resources.spiritStones).add(spiritStonesBonus).toString();
        }
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
      if (state.dungeon.isActive) return; // can't combat while in dungeon
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
      });
    },

    stopCombat(): void {
      set((draft) => {
        draft.combat.isActive = false;
        draft.combat.currentAreaId = null;
      });
    },

    startDungeon(dungeonId: string): boolean {
      const state = get();
      if (state.combat.isActive) return false; // can't enter dungeon while in combat
      if (!canEnterDungeon(state.dungeon, dungeonId, state.cultivation.stageIndex)) return false;
      const playerStats = getPlayerCombatStats(state.cultivation.stageIndex, state.equipment, state.skills.combat.level);
      set((draft) => {
        draft.dungeon = startDungeonSystem(draft.dungeon, dungeonId, playerStats.maxHp);
      });
      return true;
    },

    forgeEquipment(equipDefId: string): boolean {
      const state = get();
      const def = getEquipment(equipDefId);
      if (!def) return false;
      if (!canForge(def, state.inventory, parseFloat(state.resources.spiritStones), state.skills.forging.level, state.cultivation.stageIndex)) return false;

      const result = forgeEquipmentSystem(equipDefId, state.equipment, state.inventory);
      if (!result.success) return false;

      set((draft) => {
        draft.equipment = result.equipment;
        draft.inventory = result.inventory;
        draft.resources.spiritStones = new Decimal(draft.resources.spiritStones).sub(result.spiritStonesCost).toString();
        draft.skills.forging = addSkillExp(draft.skills.forging, result.exp);
        draft.stats.totalEquipmentForged += 1;
      });
      return true;
    },

    enhanceEquipment(slot: EquipmentSlotId): boolean {
      const state = get();
      const instance = state.equipment.equipped[slot];
      if (!instance) return false;
      if (!canEnhance(instance, state.inventory, parseFloat(state.resources.spiritStones))) return false;

      const result = enhanceEquipmentSystem(slot, state.equipment, state.inventory);
      if (!result.success) return false;

      set((draft) => {
        draft.equipment = result.equipment;
        draft.inventory = result.inventory;
        draft.resources.spiritStones = new Decimal(draft.resources.spiritStones).sub(result.spiritStonesCost).toString();
        draft.skills.forging = addSkillExp(draft.skills.forging, result.exp);
      });
      return true;
    },
  })),
);


export const selectStage = (state: GameStore) => STAGES[state.cultivation.stageIndex];
export const selectBreakthroughCost = (state: GameStore) => {
  const alchemyLevel = state.upgrades['alchemy'] ?? 0;
  const alchemyDef = UPGRADES.find((u) => u.id === 'alchemy');
  const alchemyRatio = alchemyDef ? alchemyDef.effect(alchemyLevel) : 1;
  const hasPill = hasBreakthroughPill(state.cultivation.stageIndex, state.inventory);
  return getBreakthroughCost(state.cultivation.stageIndex, alchemyRatio, hasPill);
};
export const selectBreakthroughCostWithoutPill = (state: GameStore) => {
  const alchemyLevel = state.upgrades['alchemy'] ?? 0;
  const alchemyDef = UPGRADES.find((u) => u.id === 'alchemy');
  const alchemyRatio = alchemyDef ? alchemyDef.effect(alchemyLevel) : 1;
  return getBreakthroughCost(state.cultivation.stageIndex, alchemyRatio, false);
};
export const selectHasBreakthroughPill = (state: GameStore) => hasBreakthroughPill(state.cultivation.stageIndex, state.inventory);
export const selectIsAtFinalSubStage = (state: GameStore) => isAtFinalSubStage(state.cultivation);
