import type { FishingAreaDef } from "../data/fish";
import { getFishingArea } from "../data/fish";
import type { FishingState, Inventory, ItemStack } from "../types";

export function getFishingDuration(area: FishingAreaDef, fishingLevel: number): number {
    const skillBonus = Math.min(0.7, fishingLevel * 0.01);
    return Math.floor(area.baseDurationMs * (1 - skillBonus));
}

export function rollFishCatch(area: FishingAreaDef, fishingLevel: number): { catches: ItemStack[]; exp: number } {
    const availableFish = area.fish.filter((f) => f.minLevel <= fishingLevel);
    if (availableFish.length === 0) return { catches: [], exp: 0 };

    const totalWeight = availableFish.reduce((sum, f) => sum + f.weight, 0);
    let roll = Math.random() * totalWeight;
    let caught = availableFish[availableFish.length - 1];

    for (const fish of availableFish) {
        roll -= fish.weight;
        if (roll <= 0) {
            caught = fish;
            break;
        }
    }

    const catches: ItemStack[] = [{ itemId: caught.id, quantity: 1 }];
    const exp = caught.exp;

    for (const special of area.specialItems) {
        if (Math.random() < special.chance) {
            catches.push({ itemId: special.itemId, quantity: 1 });
        }
    }

    return { catches, exp };
}

export function tickFishing(
    fishing: FishingState,
    fishingLevel: number,
    inventory: Inventory,
    deltaMs: number,
): {
    fishing: FishingState;
    inventory: Inventory;
    expGain: number;
    recentCatches: ItemStack[];
} {
    if (!fishing.isActive || !fishing.currentAreaId) {
        return { fishing, inventory, expGain: 0, recentCatches: [] };
    }

    const area = getFishingArea(fishing.currentAreaId);
    if (!area) return { fishing, inventory, expGain: 0, recentCatches: [] };

    const duration = getFishingDuration(area, fishingLevel);
    const newProgressMs = fishing.progressMs + deltaMs;

    if (newProgressMs < duration) {
        return {
            fishing: { ...fishing, progressMs: newProgressMs },
            inventory,
            expGain: 0,
            recentCatches: [],
        };
    }

    const { catches, exp } = rollFishCatch(area, fishingLevel);
    const newItems = { ...inventory.items };
    for (const item of catches) {
        newItems[item.itemId] = (newItems[item.itemId] ?? 0) + item.quantity;
    }

    return {
        fishing: {
            ...fishing,
            progressMs: newProgressMs - duration,
            totalFishCaught: fishing.totalFishCaught + 1,
        },
        inventory: { ...inventory, items: newItems },
        expGain: exp,
        recentCatches: catches,
    };
}
