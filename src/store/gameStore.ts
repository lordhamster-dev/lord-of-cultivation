import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import Decimal from 'break_eternity.js';
import { STAGES, MAX_STAGE_INDEX } from '../core/data/stages';
import { UPGRADES } from '../core/data/upgrades';
import { computeResourceGain, applyResourceGain } from '../core/systems/ResourceSystem';
import { computeProductionRates, getUpgradeCost } from '../core/systems/ProductionSystem';
import { attemptBreakthrough, computeProgressGain, getBreakthroughCost } from '../core/systems/CultivationSystem';
import { tickHerbGrowth, plantHerb as plantHerbSystem, harvestHerb as harvestHerbSystem } from '../core/systems/HerbSystem';
import { tickFishing } from '../core/systems/FishingSystem';
import { tickAlchemy, canCraft } from '../core/systems/AlchemySystem';
import { addSkillExp, createInitialSkillState } from '../core/systems/SkillSystem';
import { PLOT_UNLOCK_COSTS } from '../core/data/herbs';
import { FISHING_AREAS } from '../core/data/fish';
import { getRecipe } from '../core/data/recipes';
import { SaveManager } from '../save/SaveManager';
import type { GameState } from '../core/types';
import { SAVE_VERSION } from '../core/types';
import type { HerbPlot } from '../core/types';

const DEFAULT_STATE: GameState = {
  resources: { spiritStones: '50', exp: '0', spiritStonesPerSec: 0, expPerSec: 0 },
  cultivation: { stageIndex: 0, progress: 0, totalAscensions: 0 },
  upgrades: {},
  lastSaveTime: Date.now(),
  lastTickTime: Date.now(),
  version: SAVE_VERSION,
  inventory: { items: {} },
  skills: {
    farming: createInitialSkillState(),
    fishing: createInitialSkillState(),
    alchemy: createInitialSkillState(),
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
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...DEFAULT_STATE,

    tick(deltaMs: number) {
      set((state) => {
        const now = Date.now();
        const isPillActive = now < state.gatheringPillEndTime;
        const rates = computeProductionRates(state.cultivation.stageIndex, state.upgrades);
        const effectiveStonesPerSec = isPillActive ? rates.spiritStonesPerSec * 1.5 : rates.spiritStonesPerSec;
        state.resources.spiritStonesPerSec = effectiveStonesPerSec;
        state.resources.expPerSec = rates.expPerSec;
        const { spiritStonesDelta, expDelta } = computeResourceGain(state.resources, deltaMs);
        const { spiritStones, exp } = applyResourceGain(state.resources, spiritStonesDelta, expDelta);
        state.resources.spiritStones = spiritStones;
        state.resources.exp = exp;
        const progressGain = computeProgressGain(state.resources.expPerSec, deltaMs);
        state.cultivation.progress = Math.min(100, state.cultivation.progress + progressGain);
        state.lastTickTime = now;

        // Herb growth
        const updatedPlots = tickHerbGrowth(state.herbPlots as HerbPlot[], now);
        state.herbPlots = updatedPlots;

        // Fishing tick
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
      });
      return true;
    },

    breakthrough(): boolean {
      const state = get();
      const alchemyLevel = state.upgrades['alchemy'] ?? 0;
      const alchemyDef = UPGRADES.find((u) => u.id === 'alchemy');
      const alchemyRatio = alchemyDef ? alchemyDef.effect(alchemyLevel) : 1;
      const result = attemptBreakthrough(state.cultivation, state.resources, alchemyRatio);
      if (!result.success) return false;
      const cost = getBreakthroughCost(state.cultivation.stageIndex, alchemyRatio);
      set((draft) => {
        draft.resources.spiritStones = new Decimal(draft.resources.spiritStones).sub(cost).toString();
        draft.cultivation.stageIndex = result.newStageIndex!;
        draft.cultivation.progress = 0;
        if (result.newStageIndex === MAX_STAGE_INDEX) draft.cultivation.totalAscensions += 1;
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
          draft.gatheringPillEndTime = Date.now() + 5 * 60 * 1000;
        });
        return true;
      }
      return false;
    },
  })),
);


export const selectStage = (state: GameStore) => STAGES[state.cultivation.stageIndex];
export const selectBreakthroughCost = (state: GameStore) => {
  const alchemyLevel = state.upgrades['alchemy'] ?? 0;
  const alchemyDef = UPGRADES.find((u) => u.id === 'alchemy');
  const alchemyRatio = alchemyDef ? alchemyDef.effect(alchemyLevel) : 1;
  return getBreakthroughCost(state.cultivation.stageIndex, alchemyRatio);
};
