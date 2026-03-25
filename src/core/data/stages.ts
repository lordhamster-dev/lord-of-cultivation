import type { CultivationStage } from '../types';

const SUB_STAGE_NAMES = [
  '初期一层', '初期二层', '初期三层',
  '中期一层', '中期二层', '中期三层',
  '后期一层', '后期二层', '后期三层',
];

/** Build 9 sub-stages for a given major stage with given exp requirements */
function buildSubStages(expReqs: number[]): import('../types').SubStage[] {
  return SUB_STAGE_NAMES.map((name, i) => ({
    name,
    expRequired: expReqs[i] ?? 100,
  }));
}

export const STAGES: CultivationStage[] = [
  {
    id: 'qi_refining',
    name: '练气',
    multiplier: 1,
    breakCost: 100,
    subStages: buildSubStages([100, 100, 100, 100, 100, 100, 100, 100, 100]),
  },
  {
    id: 'foundation',
    name: '筑基',
    multiplier: 5,
    breakCost: 1_000,
    subStages: buildSubStages([100, 100, 100, 100, 100, 100, 100, 100, 100]),
  },
  {
    id: 'core_formation',
    name: '金丹',
    multiplier: 25,
    breakCost: 50_000,
    subStages: buildSubStages([100, 100, 100, 100, 100, 100, 100, 100, 100]),
  },
  {
    id: 'nascent_soul',
    name: '元婴',
    multiplier: 200,
    breakCost: 2_000_000,
    subStages: buildSubStages([100, 100, 100, 100, 100, 100, 100, 100, 100]),
  },
  {
    id: 'god_transform',
    name: '化神',
    multiplier: 2000,
    breakCost: 100_000_000,
    subStages: buildSubStages([100, 100, 100, 100, 100, 100, 100, 100, 100]),
  },
];

export const MAX_STAGE_INDEX = STAGES.length - 1;
export const SUB_STAGES_PER_STAGE = 9;

/** Exponential cost formula: base * multiplier^level */
export function upgradeCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

/** Get display name including sub-stage, e.g. "练气 初期一层" */
export function getFullStageName(stageIndex: number, subStageIndex: number): string {
  const stage = STAGES[stageIndex];
  if (!stage) return '';
  const sub = stage.subStages[subStageIndex];
  return sub ? `${stage.name} ${sub.name}` : stage.name;
}

