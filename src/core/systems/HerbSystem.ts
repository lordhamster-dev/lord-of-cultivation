import { getHerb } from "../data/herbs";
import type { HerbPlot, Inventory, ItemStack } from "../types";

export function createInitialHerbPlots(count: number): HerbPlot[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `plot_${i}`,
        herbId: null,
        plantedAt: null,
        growthDurationMs: 0,
        isReady: false,
        isUnlocked: i < count,
    }));
}

export function plantHerb(
    plots: HerbPlot[],
    plotId: string,
    herbId: string,
    inventory: Inventory,
): { success: boolean; plots: HerbPlot[]; inventory: Inventory } {
    const herb = getHerb(herbId);
    if (!herb) return { success: false, plots, inventory };

    const plotIdx = plots.findIndex((p) => p.id === plotId);
    if (plotIdx === -1) return { success: false, plots, inventory };

    const plot = plots[plotIdx];
    if (!plot.isUnlocked || plot.herbId !== null) return { success: false, plots, inventory };

    const seedCount = inventory.items[herb.seedItemId] ?? 0;
    if (seedCount < 1) return { success: false, plots, inventory };

    const newPlots = plots.map((p, i) =>
        i === plotIdx
            ? { ...p, herbId, plantedAt: Date.now(), growthDurationMs: herb.growthDurationMs, isReady: false }
            : p,
    );
    const newItems = { ...inventory.items, [herb.seedItemId]: seedCount - 1 };

    return { success: true, plots: newPlots, inventory: { ...inventory, items: newItems } };
}

export function harvestHerb(
    plots: HerbPlot[],
    plotId: string,
    skillLevel: number,
): { items: ItemStack[]; exp: number; plots: HerbPlot[] } | null {
    const plotIdx = plots.findIndex((p) => p.id === plotId);
    if (plotIdx === -1) return null;

    const plot = plots[plotIdx];
    if (!plot.isReady || !plot.herbId) return null;

    const herb = getHerb(plot.herbId);
    if (!herb) return null;

    const skillBonus = 1 + Math.min(0.5, skillLevel * 0.005);
    const baseYield = Math.floor(Math.random() * (herb.maxYield - herb.minYield + 1)) + herb.minYield;
    const finalYield = Math.max(1, Math.floor(baseYield * skillBonus));

    const newPlots = plots.map((p, i) =>
        i === plotIdx ? { ...p, herbId: null, plantedAt: null, growthDurationMs: 0, isReady: false } : p,
    );

    return {
        items: [{ itemId: plot.herbId, quantity: finalYield }],
        exp: herb.exp,
        plots: newPlots,
    };
}

export function tickHerbGrowth(plots: HerbPlot[], nowMs: number): HerbPlot[] {
    return plots.map((plot) => {
        if (!plot.isUnlocked || !plot.herbId || plot.isReady || plot.plantedAt === null) return plot;
        const elapsed = nowMs - plot.plantedAt;
        const isReady = elapsed >= plot.growthDurationMs;
        return isReady ? { ...plot, isReady: true } : plot;
    });
}

export function getGrowthProgress(plot: HerbPlot, nowMs: number): number {
    if (!plot.herbId || plot.plantedAt === null) return 0;
    if (plot.isReady) return 100;
    return Math.min(100, ((nowMs - plot.plantedAt) / plot.growthDurationMs) * 100);
}
