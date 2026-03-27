import { ITEMS } from "./items";

export interface HerbDef {
    id: string;
    name: string;
    description: string;
    seedItemId: string;
    growthDurationMs: number;
    minYield: number;
    maxYield: number;
    farmingLevelRequired: number;
    exp: number;
}

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

export const HERBS: HerbDef[] = ITEMS.filter((i) => i.category === "herb" && i.herbData).map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description,
    ...i.herbData!,
}));

export function getHerb(id: string): HerbDef | undefined {
    return HERBS.find((h) => h.id === id);
}
