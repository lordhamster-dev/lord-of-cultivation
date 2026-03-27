export interface HerbDef {
    id: string;
    name: string;
    seedItemId: string;
    growthDurationMs: number;
    minYield: number;
    maxYield: number;
    farmingLevelRequired: number;
    exp: number;
    description: string;
}

export const HERBS: HerbDef[] = [
    {
        id: "spirit_grass",
        name: "灵草",
        seedItemId: "spirit_grass_seed",
        growthDurationMs: 60_000,
        minYield: 3,
        maxYield: 8,
        farmingLevelRequired: 1,
        exp: 10,
        description: "最基础的灵草，炼制聚气丹的原料",
    },
    {
        id: "fire_herb",
        name: "火灵草",
        seedItemId: "fire_herb_seed",
        growthDurationMs: 5 * 60_000,
        minYield: 2,
        maxYield: 5,
        farmingLevelRequired: 10,
        exp: 35,
        description: "蕴含火灵气，炼制培元丹的主料",
    },
    {
        id: "moon_flower",
        name: "月华花",
        seedItemId: "moon_flower_seed",
        growthDurationMs: 30 * 60_000,
        minYield: 1,
        maxYield: 3,
        farmingLevelRequired: 30,
        exp: 120,
        description: "月夜盛开，炼制筑基丹必须材料",
    },
    {
        id: "golden_lotus",
        name: "金莲子",
        seedItemId: "golden_lotus_seed",
        growthDurationMs: 2 * 60 * 60_000,
        minYield: 1,
        maxYield: 2,
        farmingLevelRequired: 60,
        exp: 500,
        description: "传说中的灵药，炼制金丹境突破丹的核心材料",
    },
];

export const PLOT_UNLOCK_COSTS: { spiritStones: number; levelRequired: number }[] = [
    { spiritStones: 0, levelRequired: 1 },
    { spiritStones: 0, levelRequired: 1 },
    { spiritStones: 0, levelRequired: 1 },
    { spiritStones: 0, levelRequired: 1 },
    { spiritStones: 1000, levelRequired: 5 },
    { spiritStones: 5000, levelRequired: 15 },
    { spiritStones: 20000, levelRequired: 25 },
    { spiritStones: 100000, levelRequired: 40 },
];

export function getHerb(id: string): HerbDef | undefined {
    return HERBS.find((h) => h.id === id);
}
