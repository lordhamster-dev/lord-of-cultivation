import type { EquipmentDef, EquipmentStatBonus } from "../data/equipment";
import { getEnhanceCost, getEnhanceMaterials, getEquipment, getEquipmentTotalStats } from "../data/equipment";
import type { EquipmentInstance, EquipmentSlotId, EquipmentState, Inventory } from "../types";

export function createInitialEquipmentState(): EquipmentState {
    return {
        equipped: {},
        totalForged: 0,
    };
}

/** Check if player can forge (craft) a piece of equipment */
export function canForge(
    equipDef: EquipmentDef,
    inventory: Inventory,
    spiritStones: number,
    forgingLevel: number,
    stageIndex: number,
): boolean {
    if (stageIndex < equipDef.requiredStage) return false;
    if (forgingLevel < equipDef.forgingRecipe.forgingLevelRequired) return false;
    if (spiritStones < equipDef.forgingRecipe.spiritStones) return false;
    return equipDef.forgingRecipe.ingredients.every((ing) => (inventory.items[ing.itemId] ?? 0) >= ing.quantity);
}

/** Forge a new equipment, consuming materials and returning updated state */
export function forgeEquipment(
    equipDefId: string,
    equipment: EquipmentState,
    inventory: Inventory,
): {
    success: boolean;
    equipment: EquipmentState;
    inventory: Inventory;
    spiritStonesCost: number;
    exp: number;
} {
    const def = getEquipment(equipDefId);
    if (!def) return { success: false, equipment, inventory, spiritStonesCost: 0, exp: 0 };

    // Consume ingredients
    const newItems = { ...inventory.items };
    for (const ing of def.forgingRecipe.ingredients) {
        newItems[ing.itemId] = (newItems[ing.itemId] ?? 0) - ing.quantity;
    }

    // Add forged item to inventory (instead of equipping directly)
    newItems[equipDefId] = (newItems[equipDefId] ?? 0) + 1;

    return {
        success: true,
        equipment: {
            ...equipment,
            totalForged: equipment.totalForged + 1,
        },
        inventory: { ...inventory, items: newItems },
        spiritStonesCost: def.forgingRecipe.spiritStones,
        exp: def.forgingRecipe.exp,
    };
}

/** Check if an equipment can be enhanced */
export function canEnhance(instance: EquipmentInstance, inventory: Inventory, spiritStones: number): boolean {
    const def = getEquipment(instance.defId);
    if (!def) return false;
    if (instance.level >= def.maxLevel) return false;

    const cost = getEnhanceCost(def, instance.level);
    if (spiritStones < cost) return false;

    const materials = getEnhanceMaterials(def, instance.level);
    return materials.every((mat) => (inventory.items[mat.itemId] ?? 0) >= mat.quantity);
}

/** Enhance an equipped item */
export function enhanceEquipment(
    slot: EquipmentSlotId,
    equipment: EquipmentState,
    inventory: Inventory,
): {
    success: boolean;
    equipment: EquipmentState;
    inventory: Inventory;
    spiritStonesCost: number;
    exp: number;
} {
    const instance = equipment.equipped[slot];
    if (!instance) return { success: false, equipment, inventory, spiritStonesCost: 0, exp: 0 };

    const def = getEquipment(instance.defId);
    if (!def) return { success: false, equipment, inventory, spiritStonesCost: 0, exp: 0 };
    if (instance.level >= def.maxLevel) return { success: false, equipment, inventory, spiritStonesCost: 0, exp: 0 };

    const cost = getEnhanceCost(def, instance.level);
    const materials = getEnhanceMaterials(def, instance.level);

    // Consume materials
    const newItems = { ...inventory.items };
    for (const mat of materials) {
        newItems[mat.itemId] = (newItems[mat.itemId] ?? 0) - mat.quantity;
    }

    // Enhance
    const newEquipped = { ...equipment.equipped };
    newEquipped[slot] = { ...instance, level: instance.level + 1 };

    // Exp from enhancement (half of forging exp)
    const exp = Math.floor(def.forgingRecipe.exp * 0.5);

    return {
        success: true,
        equipment: { ...equipment, equipped: newEquipped },
        inventory: { ...inventory, items: newItems },
        spiritStonesCost: cost,
        exp,
    };
}

/** Get total equipment stat bonuses (for production rates) */
export function getEquipmentBonuses(equipment: EquipmentState): EquipmentStatBonus {
    const total: EquipmentStatBonus = {};
    for (const instance of Object.values(equipment.equipped)) {
        if (!instance) continue;
        const stats = getEquipmentTotalStats(instance.defId, instance.level);
        for (const key of Object.keys(stats) as (keyof EquipmentStatBonus)[]) {
            total[key] = (total[key] ?? 0) + (stats[key] ?? 0);
        }
    }
    return total;
}
