import { getTechniqueMultiplier } from "../data/techniques";
import type { ResourceState } from "../types";

/** Spirit capacity per major stage (13 stages) */
const SPIRIT_MAX_BY_STAGE = [
    100,
    200,
    500,
    1000,
    2000, // 下境界: 炼气, 筑基, 结丹, 元婴, 化神
    5000,
    10000,
    20000, // 中境界: 炼虚, 合体, 大乘
    50000,
    100000,
    200000,
    500000,
    1000000, // 上境界: 真仙, 金仙, 太乙, 大罗, 道祖
];
/** Spirit regeneration per second per major stage (13 stages) */
const SPIRIT_REGEN_BY_STAGE = [
    5,
    10,
    20,
    40,
    80, // 下境界
    160,
    300,
    600, // 中境界
    1200,
    2400,
    5000,
    10000,
    20000, // 上境界
];

/** Spirit cost per second for combat at each stage */
const COMBAT_SPIRIT_COST_BY_STAGE = [
    2,
    5,
    10,
    20,
    40, // 下境界
    80,
    150,
    300, // 中境界
    600,
    1200,
    2500,
    5000,
    10000, // 上境界
];

export { SPIRIT_MAX_BY_STAGE, SPIRIT_REGEN_BY_STAGE, COMBAT_SPIRIT_COST_BY_STAGE };

/**
 * Compute spirit resource stats (max and regen) for a given stage.
 */
export function computeSpiritStats(stageIndex: number): Pick<ResourceState, "spiritPerSec" | "spiritMax"> {
    const spiritMax = SPIRIT_MAX_BY_STAGE[stageIndex] ?? 100;
    const spiritPerSec = SPIRIT_REGEN_BY_STAGE[stageIndex] ?? 5;
    return { spiritPerSec, spiritMax };
}

/**
 * Compute meditation spirit regen rate per second.
 * Base regen * gathering pill bonus * technique meditation multiplier.
 */
export function computeMeditationRegenRate(
    stageIndex: number,
    activeTechniqueId: string | null,
    isPillActive: boolean,
): number {
    const baseRegen = SPIRIT_REGEN_BY_STAGE[stageIndex] ?? 5;
    let rate = baseRegen;

    // Technique meditation multiplier
    if (activeTechniqueId) {
        rate *= getTechniqueMultiplier(activeTechniqueId, "meditation");
    }

    // Gathering pill: +50% meditation efficiency
    if (isPillActive) {
        rate *= 1.5;
    }

    return rate;
}

/**
 * Get the spirit cost per second for combat at a given stage.
 */
export function getCombatSpiritCost(stageIndex: number): number {
    return COMBAT_SPIRIT_COST_BY_STAGE[stageIndex] ?? 2;
}
