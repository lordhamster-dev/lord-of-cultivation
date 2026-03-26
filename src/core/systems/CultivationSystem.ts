import { STAGES, MAX_STAGE_INDEX, getSubStageCount } from '../data/stages';
import type { CultivationState, Inventory } from '../types';
import { getSpiritStoneCount } from './ResourceSystem';

export interface BreakthroughResult {
  success: boolean;
  reason?: string;
  newStageIndex?: number;
  pillConsumed?: boolean; // whether a breakthrough pill was consumed
}

export interface SubStageAdvanceResult {
  advanced: boolean;
  newSubStageIndex: number;
  newProgress: number;
}

/**
 * Get the spirit stones cost for breakthrough at the current stage,
 * accounting for optional pill discount.
 */
export function getBreakthroughCost(
  stageIndex: number,
  hasPill = false,
): number {
  const stageData = STAGES[stageIndex];
  if (!stageData) return Infinity;
  let cost = stageData.breakCost;
  if (hasPill && stageData.breakPillId && stageData.breakPillDiscount > 0) {
    cost *= (1 - stageData.breakPillDiscount);
  }
  return Math.floor(cost);
}

export const MAX_CULTIVATION_PROGRESS = 100;

/**
 * Check if the player is at the final sub-stage of the current major stage.
 * Only then is a major breakthrough possible.
 */
export function isAtFinalSubStage(cultivation: CultivationState): boolean {
  const subStageCount = getSubStageCount(cultivation.stageIndex);
  return cultivation.subStageIndex >= subStageCount - 1;
}

/**
 * Check if the player has the corresponding breakthrough pill for the next stage.
 */
export function hasBreakthroughPill(stageIndex: number, inventory: Inventory): boolean {
  const nextStage = STAGES[stageIndex + 1];
  if (!nextStage?.breakPillId) return false;
  return (inventory.items[nextStage.breakPillId] ?? 0) >= 1;
}

/**
 * Try to advance to the next sub-stage if progress is full.
 * Returns whether advancement happened and the new state.
 */
export function tryAdvanceSubStage(cultivation: CultivationState): SubStageAdvanceResult {
  if (cultivation.progress < MAX_CULTIVATION_PROGRESS) {
    return { advanced: false, newSubStageIndex: cultivation.subStageIndex, newProgress: cultivation.progress };
  }
  const subStageCount = getSubStageCount(cultivation.stageIndex);
  if (cultivation.subStageIndex >= subStageCount - 1) {
    // At final sub-stage, keep progress at 100 (waiting for breakthrough)
    return { advanced: false, newSubStageIndex: cultivation.subStageIndex, newProgress: MAX_CULTIVATION_PROGRESS };
  }

  return {
    advanced: true,
    newSubStageIndex: cultivation.subStageIndex + 1,
    newProgress: 0,
  };
}

/**
 * Attempt a breakthrough to the next major stage.
 * Uses spirit stones from inventory.
 */
export function attemptBreakthrough(
  cultivation: CultivationState,
  inventory: Inventory,
): BreakthroughResult {
  if (cultivation.progress < MAX_CULTIVATION_PROGRESS) {
    return { success: false, reason: '修炼进度不足100%' };
  }
  if (!isAtFinalSubStage(cultivation)) {
    const subStageCount = getSubStageCount(cultivation.stageIndex);
    const finalSubName = STAGES[cultivation.stageIndex]?.subStages[subStageCount - 1]?.name ?? '最终';
    return { success: false, reason: `尚未修炼至${finalSubName}` };
  }
  if (cultivation.stageIndex >= MAX_STAGE_INDEX) {
    return { success: false, reason: '已达到最高境界' };
  }

  const hasPill = hasBreakthroughPill(cultivation.stageIndex, inventory);
  const cost = getBreakthroughCost(cultivation.stageIndex, hasPill);
  const stones = getSpiritStoneCount(inventory);
  if (stones < cost) {
    return { success: false, reason: `灵石不足，需要 ${cost} 灵石` };
  }

  return {
    success: true,
    newStageIndex: cultivation.stageIndex + 1,
    pillConsumed: hasPill,
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

