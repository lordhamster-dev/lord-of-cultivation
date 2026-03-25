import Decimal from 'break_eternity.js';
import { STAGES, MAX_STAGE_INDEX, SUB_STAGES_PER_STAGE } from '../data/stages';
import type { CultivationState, ResourceState } from '../types';

export interface BreakthroughResult {
  success: boolean;
  reason?: string;
  newStageIndex?: number;
}

export interface SubStageAdvanceResult {
  advanced: boolean;
  newSubStageIndex: number;
  newProgress: number;
}

/**
 * Get the spirit stones cost for breakthrough at the current stage,
 * accounting for the alchemy upgrade reduction ratio.
 */
export function getBreakthroughCost(
  stageIndex: number,
  alchemyRatio: number,
): number {
  const stage = STAGES[stageIndex];
  if (!stage) return Infinity;
  return Math.floor(stage.breakCost * alchemyRatio);
}

/**
 * Check if the player is at the final sub-stage (sub-stage index 8) of current major stage.
 * Only then is a major breakthrough possible.
 */
export function isAtFinalSubStage(cultivation: CultivationState): boolean {
  return cultivation.subStageIndex >= SUB_STAGES_PER_STAGE - 1;
}

/**
 * Try to advance to the next sub-stage if progress is full.
 * Returns whether advancement happened and the new state.
 */
export function tryAdvanceSubStage(cultivation: CultivationState): SubStageAdvanceResult {
  if (cultivation.progress < 100) {
    return { advanced: false, newSubStageIndex: cultivation.subStageIndex, newProgress: cultivation.progress };
  }
  if (cultivation.subStageIndex >= SUB_STAGES_PER_STAGE - 1) {
    // At final sub-stage, keep progress at 100 (waiting for breakthrough)
    return { advanced: false, newSubStageIndex: cultivation.subStageIndex, newProgress: 100 };
  }

  return {
    advanced: true,
    newSubStageIndex: cultivation.subStageIndex + 1,
    newProgress: 0,
  };
}

/**
 * Attempt a breakthrough to the next major stage.
 */
export function attemptBreakthrough(
  cultivation: CultivationState,
  resources: ResourceState,
  alchemyRatio: number,
): BreakthroughResult {
  if (cultivation.progress < 100) {
    return { success: false, reason: '修炼进度不足100%' };
  }
  if (!isAtFinalSubStage(cultivation)) {
    return { success: false, reason: '尚未修炼至后期三层' };
  }
  if (cultivation.stageIndex >= MAX_STAGE_INDEX) {
    return { success: false, reason: '已达到最高境界' };
  }

  const cost = getBreakthroughCost(cultivation.stageIndex, alchemyRatio);
  const stones = new Decimal(resources.spiritStones);
  if (stones.lt(cost)) {
    return { success: false, reason: `灵石不足，需要 ${cost} 灵石` };
  }

  return {
    success: true,
    newStageIndex: cultivation.stageIndex + 1,
  };
}

/**
 * Calculate cultivation progress gain per tick (EXP driven).
 * Full progress bar (100) is filled when accumulated EXP reaches stage threshold.
 */
export function computeProgressGain(expPerSec: number, deltaMs: number): number {
  // Progress fills at 1% per expPerSec unit per second, capped at 100
  const seconds = deltaMs / 1000;
  return expPerSec * seconds * 0.1; // 0.1 progress per exp/sec per second
}

