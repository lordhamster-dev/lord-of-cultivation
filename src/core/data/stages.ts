import type { CultivationStage, RealmTier } from '../types';

/** Sub-stage names for 炼气 (13 levels) */
const QI_REFINING_SUB_STAGES = [
  '第一层', '第二层', '第三层', '第四层', '第五层',
  '第六层', '第七层', '第八层', '第九层', '第十层',
  '第十一层', '第十二层', '第十三层',
];

/** Sub-stage names for all stages except 炼气 (4 sub-stages) */
const STANDARD_SUB_STAGE_NAMES = ['初期', '中期', '后期', '大圆满'];

/** Build sub-stages for 炼气 (13 levels) */
function buildQiRefiningSubStages(expReqs: number[]): import('../types').SubStage[] {
  return QI_REFINING_SUB_STAGES.map((name, i) => ({
    name,
    expRequired: expReqs[i] ?? 100,
  }));
}

/** Build 4 sub-stages (初期/中期/后期/大圆满) for a standard stage */
function buildStandardSubStages(expReqs: number[]): import('../types').SubStage[] {
  return STANDARD_SUB_STAGE_NAMES.map((name, i) => ({
    name,
    expRequired: expReqs[i] ?? 100,
  }));
}

/** Helper to create a stage definition */
function stage(
  id: string,
  name: string,
  realm: RealmTier,
  realmName: string,
  multiplier: number,
  breakCost: number,
  subStages: import('../types').SubStage[],
  breakPillId?: string,
  breakPillDiscount = 0.5,
): CultivationStage {
  return { id, name, realm, realmName, multiplier, breakCost, subStages, breakPillId, breakPillDiscount };
}

// ─── Stage Definitions ────────────────────────────────────────────────────

export const STAGES: CultivationStage[] = [
  // ─── 下境界 (Lower Realm) ───────────────────────────────────────────────
  stage('qi_refining', '炼气', 'lower', '下境界', 1, 100,
    buildQiRefiningSubStages([80, 80, 80, 100, 100, 100, 120, 120, 120, 150, 150, 150, 200])),

  stage('foundation', '筑基', 'lower', '下境界', 5, 1_000,
    buildStandardSubStages([100, 120, 150, 200]),
    'foundation_pill', 0.5),

  stage('core_formation', '结丹', 'lower', '下境界', 25, 50_000,
    buildStandardSubStages([120, 150, 200, 250]),
    'core_formation_pill', 0.5),

  stage('nascent_soul', '元婴', 'lower', '下境界', 200, 2_000_000,
    buildStandardSubStages([150, 200, 250, 300]),
    'nascent_soul_pill', 0.5),

  stage('god_transform', '化神', 'lower', '下境界', 2_000, 100_000_000,
    buildStandardSubStages([200, 250, 300, 400]),
    'god_transform_pill', 0.5),

  // ─── 中境界 (Middle Realm) ──────────────────────────────────────────────
  stage('void_refining', '炼虚', 'middle', '中境界', 20_000, 5e9,
    buildStandardSubStages([250, 300, 400, 500]),
    'void_refining_pill', 0.5),

  stage('body_integration', '合体', 'middle', '中境界', 200_000, 5e11,
    buildStandardSubStages([300, 400, 500, 600]),
    'body_integration_pill', 0.5),

  stage('mahayana', '大乘', 'middle', '中境界', 2_000_000, 5e13,
    buildStandardSubStages([400, 500, 600, 800]),
    'mahayana_pill', 0.5),

  // ─── 上境界 (Upper Realm) ───────────────────────────────────────────────
  stage('true_immortal', '真仙', 'upper', '上境界', 20_000_000, 5e15,
    buildStandardSubStages([500, 600, 800, 1000]),
    'true_immortal_pill', 0.5),

  stage('golden_immortal', '金仙', 'upper', '上境界', 200_000_000, 5e17,
    buildStandardSubStages([600, 800, 1000, 1200]),
    'golden_immortal_pill', 0.5),

  stage('taiyi', '太乙', 'upper', '上境界', 2e9, 5e19,
    buildStandardSubStages([800, 1000, 1200, 1500]),
    'taiyi_pill', 0.5),

  stage('daluo', '大罗', 'upper', '上境界', 2e10, 5e21,
    buildStandardSubStages([1000, 1200, 1500, 2000]),
    'daluo_pill', 0.5),

  stage('dao_ancestor', '道祖', 'upper', '上境界', 2e11, 5e23,
    buildStandardSubStages([1200, 1500, 2000, 3000]),
    'dao_ancestor_pill', 0.5),
];

export const MAX_STAGE_INDEX = STAGES.length - 1;

/** Get the number of sub-stages for a given major stage */
export function getSubStageCount(stageIndex: number): number {
  const stageData = STAGES[stageIndex];
  if (!stageData) return 1;
  return stageData.subStages.length;
}

/** Exponential cost formula: base * multiplier^level */
export function upgradeCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

/** Get display name including sub-stage, e.g. "炼气 第一层" or "筑基 初期" */
export function getFullStageName(stageIndex: number, subStageIndex: number): string {
  const stageData = STAGES[stageIndex];
  if (!stageData) return '';
  const sub = stageData.subStages[subStageIndex];
  return sub ? `${stageData.name} ${sub.name}` : stageData.name;
}

/** Get realm display name for a stage index */
export function getRealmName(stageIndex: number): string {
  return STAGES[stageIndex]?.realmName ?? '';
}

