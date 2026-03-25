import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import Decimal from 'break_eternity.js';
import { STAGES, MAX_STAGE_INDEX } from '../core/data/stages';
import { UPGRADES } from '../core/data/upgrades';
import { computeResourceGain, applyResourceGain } from '../core/systems/ResourceSystem';
import { computeProductionRates, getUpgradeCost } from '../core/systems/ProductionSystem';
import {
  attemptBreakthrough,
  computeProgressGain,
  getBreakthroughCost,
} from '../core/systems/CultivationSystem';
import { SaveManager } from '../save/SaveManager';
import type { GameState } from '../core/types';
import { SAVE_VERSION } from '../core/types';

// ─── Default State ────────────────────────────────────────────────────────────
const DEFAULT_STATE: GameState = {
  resources: {
    spiritStones: '50',
    exp: '0',
    spiritStonesPerSec: 0,
    expPerSec: 0,
  },
  cultivation: {
    stageIndex: 0,
    progress: 0,
    totalAscensions: 0,
  },
  upgrades: {},
  lastSaveTime: Date.now(),
  lastTickTime: Date.now(),
  version: SAVE_VERSION,
};

// ─── Store Actions ────────────────────────────────────────────────────────────
interface GameActions {
  tick: (deltaMs: number) => void;
  buyUpgrade: (id: string) => boolean;
  breakthrough: () => boolean;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  applyOfflineProgress: (cappedMs: number) => { spiritStones: string; exp: string };
}

type GameStore = GameState & GameActions;

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...DEFAULT_STATE,

    tick(deltaMs: number) {
      set((state) => {
        // Compute production rates from current upgrades & stage
        const rates = computeProductionRates(
          state.cultivation.stageIndex,
          state.upgrades,
        );
        state.resources.spiritStonesPerSec = rates.spiritStonesPerSec;
        state.resources.expPerSec = rates.expPerSec;

        // Compute resource gains
        const { spiritStonesDelta, expDelta } = computeResourceGain(
          state.resources,
          deltaMs,
        );
        const { spiritStones, exp } = applyResourceGain(
          state.resources,
          spiritStonesDelta,
          expDelta,
        );
        state.resources.spiritStones = spiritStones;
        state.resources.exp = exp;

        // Advance cultivation progress
        const progressGain = computeProgressGain(
          state.resources.expPerSec,
          deltaMs,
        );
        state.cultivation.progress = Math.min(100, state.cultivation.progress + progressGain);

        // Update tick time
        state.lastTickTime = Date.now();
      });
    },

    buyUpgrade(id: string): boolean {
      const state = get();
      const upgradeDef = UPGRADES.find((u) => u.id === id);
      if (!upgradeDef) return false;

      const currentLevel = state.upgrades[id] ?? 0;
      if (upgradeDef.maxLevel !== undefined && currentLevel >= upgradeDef.maxLevel) {
        return false;
      }

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

      const result = attemptBreakthrough(
        state.cultivation,
        state.resources,
        alchemyRatio,
      );

      if (!result.success) return false;

      const cost = getBreakthroughCost(state.cultivation.stageIndex, alchemyRatio);

      set((draft) => {
        draft.resources.spiritStones = new Decimal(draft.resources.spiritStones)
          .sub(cost)
          .toString();
        draft.cultivation.stageIndex = result.newStageIndex!;
        draft.cultivation.progress = 0;
        if (result.newStageIndex === MAX_STAGE_INDEX) {
          draft.cultivation.totalAscensions += 1;
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
      };
      SaveManager.save(snapshot);
      set((draft) => {
        draft.lastSaveTime = snapshot.lastSaveTime;
      });
    },

    loadGame() {
      const saved = SaveManager.load();
      if (!saved) return;
      set((draft) => {
        Object.assign(draft, saved);
      });
    },

    applyOfflineProgress(cappedMs: number) {
      const state = get();
      const rates = computeProductionRates(
        state.cultivation.stageIndex,
        state.upgrades,
      );

      const tempResources = {
        ...state.resources,
        spiritStonesPerSec: rates.spiritStonesPerSec,
        expPerSec: rates.expPerSec,
      };

      const { spiritStonesDelta, expDelta } = computeResourceGain(tempResources, cappedMs);
      const { spiritStones, exp } = applyResourceGain(tempResources, spiritStonesDelta, expDelta);

      set((draft) => {
        draft.resources.spiritStones = spiritStones;
        draft.resources.exp = exp;
        draft.resources.spiritStonesPerSec = rates.spiritStonesPerSec;
        draft.resources.expPerSec = rates.expPerSec;
        draft.lastTickTime = Date.now();
      });

      return {
        spiritStones: spiritStonesDelta.toString(),
        exp: expDelta.toString(),
      };
    },

    resetGame() {
      SaveManager.deleteSave();
      set(() => ({ ...DEFAULT_STATE, lastSaveTime: Date.now(), lastTickTime: Date.now() }));
    },
  })),
);

// Selector helpers
export const selectStage = (state: GameStore) => STAGES[state.cultivation.stageIndex];
export const selectBreakthroughCost = (state: GameStore) => {
  const alchemyLevel = state.upgrades['alchemy'] ?? 0;
  const alchemyDef = UPGRADES.find((u) => u.id === 'alchemy');
  const alchemyRatio = alchemyDef ? alchemyDef.effect(alchemyLevel) : 1;
  return getBreakthroughCost(state.cultivation.stageIndex, alchemyRatio);
};
