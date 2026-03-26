import { STAGES } from '../data/stages';
import { UPGRADES, getUpgrade } from '../data/upgrades';
import { getTechniqueMultiplier, getTechnique } from '../data/techniques';
import type { ResourceState, EquipmentState } from '../types';
import { getEquipmentBonuses } from '../systems/EquipmentSystem';

/** Spirit capacity per major stage */
const SPIRIT_MAX_BY_STAGE = [100, 200, 500, 1000, 2000];
/** Spirit regeneration per second per major stage */
const SPIRIT_REGEN_BY_STAGE = [5, 10, 20, 40, 80];

/**
 * Compute effective spiritStonesPerSec and expPerSec
 * based on current stage multiplier and upgrades.
 */
export function computeProductionRates(
  stageIndex: number,
  upgrades: Record<string, number>,
  activeTechniqueId: string | null = null,
  equipment?: EquipmentState,
): Pick<ResourceState, 'spiritStonesPerSec' | 'expPerSec' | 'spiritPerSec' | 'spiritMax'> {
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

  // Apply technique multipliers
  if (activeTechniqueId) {
    spiritStonesPerSec *= getTechniqueMultiplier(activeTechniqueId, 'spiritStones');
    expPerSec *= getTechniqueMultiplier(activeTechniqueId, 'exp');
  }

  // Apply equipment bonuses
  if (equipment) {
    const bonuses = getEquipmentBonuses(equipment);
    if (bonuses.spiritStonesPercent) {
      spiritStonesPerSec *= 1 + bonuses.spiritStonesPercent;
    }
    if (bonuses.expPercent) {
      expPerSec *= 1 + bonuses.expPercent;
    }
  }

  // Spirit resource
  const spiritMax = SPIRIT_MAX_BY_STAGE[stageIndex] ?? 100;
  const technique = activeTechniqueId ? getTechnique(activeTechniqueId) : null;
  const spiritCost = technique ? technique.spiritCostPerSec : 0;
  const spiritPerSec = (SPIRIT_REGEN_BY_STAGE[stageIndex] ?? 5) - spiritCost;

  return { spiritStonesPerSec, expPerSec, spiritPerSec, spiritMax };
}

/**
 * Calculate the cost of the next level of an upgrade.
 */
export function getUpgradeCost(id: string, currentLevel: number): number {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) return Infinity;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
}

