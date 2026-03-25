import Decimal from 'break_eternity.js';
import { STAGES, MAX_STAGE_INDEX } from '../data/stages';
import type { CultivationState, ResourceState } from '../types';

export interface BreakthroughResult {
  success: boolean;
  reason?: string;
  newStageIndex?: number;
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
 * Attempt a breakthrough. Returns success/failure and the new state.
 */
export function attemptBreakthrough(
  cultivation: CultivationState,
  resources: ResourceState,
  alchemyRatio: number,
): BreakthroughResult {
  if (cultivation.progress < 100) {
    return { success: false, reason: '修炼进度不足100%' };
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
