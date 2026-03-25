import type { CultivationStage } from '../types';

export const STAGES: CultivationStage[] = [
  { id: 'qi_refining',    name: '练气', multiplier: 1,     breakCost: 100 },
  { id: 'foundation',     name: '筑基', multiplier: 5,     breakCost: 1_000 },
  { id: 'core_formation', name: '金丹', multiplier: 25,    breakCost: 50_000 },
  { id: 'nascent_soul',   name: '元婴', multiplier: 200,   breakCost: 2_000_000 },
  { id: 'god_transform',  name: '化神', multiplier: 2000,  breakCost: 100_000_000 },
];

export const MAX_STAGE_INDEX = STAGES.length - 1;

/** Exponential cost formula: base * multiplier^level */
export function upgradeCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}
