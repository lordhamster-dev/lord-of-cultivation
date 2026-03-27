import type { EquipmentSlotId } from "../types";
import { ITEMS } from "./items";
import type { EquipmentStatBonus as _EquipStats } from "./items";

export type { EquipmentStatBonus } from "./items";

export interface EquipmentDef {
    id: string;
    name: string;
    description: string;
    icon: string; // mapped from ItemDef.emoji
    slot: EquipmentSlotId;
    baseStats: _EquipStats;
    enhancePerLevel: _EquipStats;
    maxLevel: number;
    requiredStage: number;
    forgingRecipe: {
        ingredients: { itemId: string; quantity: number }[];
        spiritStones: number;
        forgingLevelRequired: number;
        exp: number;
    };
}

export const EQUIPMENT: EquipmentDef[] = ITEMS.filter((i) => i.category === "equipment" && i.equipData).map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description,
    icon: i.emoji,
    ...i.equipData!,
}));

/** Enhancement cost: spiritStones needed to enhance from currentLevel to currentLevel+1 */
export function getEnhanceCost(equipDef: EquipmentDef, currentLevel: number): number {
    return Math.floor(equipDef.forgingRecipe.spiritStones * Math.pow(1.5, currentLevel));
}

/** Additional material cost for enhancement */
export function getEnhanceMaterials(
    equipDef: EquipmentDef,
    currentLevel: number,
): { itemId: string; quantity: number }[] {
    return equipDef.forgingRecipe.ingredients.map((ing) => ({
        itemId: ing.itemId,
        quantity: Math.max(1, Math.floor(ing.quantity * 0.3 * (1 + currentLevel * 0.1))),
    }));
}

export function getEquipment(id: string): EquipmentDef | undefined {
    return EQUIPMENT.find((e) => e.id === id);
}

/** Calculate total stats for an equipment instance including enhancements */
export function getEquipmentTotalStats(defId: string, level: number): _EquipStats {
    const def = getEquipment(defId);
    if (!def) return {};
    const stats: _EquipStats = {};
    for (const key of Object.keys(def.baseStats) as (keyof _EquipStats)[]) {
        stats[key] = (def.baseStats[key] ?? 0) + (def.enhancePerLevel[key] ?? 0) * level;
    }
    return stats;
}
