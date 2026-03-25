import { STAGES } from '../data/stages';
import { UPGRADES, getUpgrade } from '../data/upgrades';
import type { ResourceState } from '../types';

/**
 * Compute effective spiritStonesPerSec and expPerSec
 * based on current stage multiplier and upgrades.
 */
export function computeProductionRates(
  stageIndex: number,
  upgrades: Record<string, number>,
): Pick<ResourceState, 'spiritStonesPerSec' | 'expPerSec'> {
  const stage = STAGES[stageIndex] ?? STAGES[0];
  const stageMultiplier = stage.multiplier;

  // Base rates from additive upgrades
  const gatheringLevel = upgrades['spirit_gathering'] ?? 0;
  const meditationLevel = upgrades['meditation'] ?? 0;

  // Base passive income ensures the game loop starts even before any upgrades
  let spiritStonesPerSec = 0.5 + gatheringLevel;
  let expPerSec = 0.2 + meditationLevel;

  // Multiplicative upgrades
  const spiritVeinLevel = upgrades['spirit_vein'] ?? 0;
  const enlightenmentLevel = upgrades['enlightenment'] ?? 0;

  const spiritVeinDef = getUpgrade('spirit_vein');
  const enlightenmentDef = getUpgrade('enlightenment');

  if (spiritVeinDef && spiritVeinLevel > 0) {
    spiritStonesPerSec *= spiritVeinDef.effect(spiritVeinLevel);
  }
  if (enlightenmentDef && enlightenmentLevel > 0) {
    expPerSec *= enlightenmentDef.effect(enlightenmentLevel);
  }

  // Apply stage multiplier
  spiritStonesPerSec *= stageMultiplier;
  expPerSec *= stageMultiplier;

  return { spiritStonesPerSec, expPerSec };
}

/**
 * Calculate the cost of the next level of an upgrade.
 */
export function getUpgradeCost(id: string, currentLevel: number): number {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) return Infinity;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
}
