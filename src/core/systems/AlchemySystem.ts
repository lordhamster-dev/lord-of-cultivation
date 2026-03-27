import type { AlchemyRecipeDef } from "../data/recipes";
import { getRecipe } from "../data/recipes";
import type { AlchemyState, Inventory, ItemStack } from "../types";

export function getAlchemyDuration(recipe: AlchemyRecipeDef, alchemyLevel: number): number {
    const bonus = Math.min(0.6, alchemyLevel * 0.01);
    return Math.floor(recipe.durationMs * (1 - bonus));
}

export function getActualFailChance(recipe: AlchemyRecipeDef, alchemyLevel: number): number {
    return Math.max(0, recipe.failChance - alchemyLevel * 0.005);
}

export function canCraft(recipe: AlchemyRecipeDef, inventory: Inventory): boolean {
    return recipe.ingredients.every((ing) => (inventory.items[ing.itemId] ?? 0) >= ing.quantity);
}

export function tickAlchemy(
    alchemy: AlchemyState,
    alchemyLevel: number,
    inventory: Inventory,
    deltaMs: number,
    cultivationStageIndex: number,
): {
    alchemy: AlchemyState;
    inventory: Inventory;
    expGain: number;
    produced: ItemStack[];
} {
    if (!alchemy.isActive || !alchemy.currentRecipeId) {
        return { alchemy, inventory, expGain: 0, produced: [] };
    }

    const recipe = getRecipe(alchemy.currentRecipeId);
    if (!recipe) return { alchemy, inventory, expGain: 0, produced: [] };

    if (cultivationStageIndex < recipe.cultivationStageRequired) {
        return { alchemy: { ...alchemy, isActive: false }, inventory, expGain: 0, produced: [] };
    }

    const duration = getAlchemyDuration(recipe, alchemyLevel);
    const newProgressMs = alchemy.progressMs + deltaMs;

    if (newProgressMs < duration) {
        return {
            alchemy: { ...alchemy, progressMs: newProgressMs },
            inventory,
            expGain: 0,
            produced: [],
        };
    }

    if (!canCraft(recipe, inventory)) {
        return { alchemy: { ...alchemy, isActive: false }, inventory, expGain: 0, produced: [] };
    }

    const newItems = { ...inventory.items };
    for (const ing of recipe.ingredients) {
        newItems[ing.itemId] = (newItems[ing.itemId] ?? 0) - ing.quantity;
    }

    const failChance = getActualFailChance(recipe, alchemyLevel);
    const failed = Math.random() < failChance;

    let produced: ItemStack[] = [];
    let expGain = 0;

    if (!failed) {
        const qty =
            recipe.outputQuantity[0] +
            Math.floor(Math.random() * (recipe.outputQuantity[1] - recipe.outputQuantity[0] + 1));
        newItems[recipe.outputItemId] = (newItems[recipe.outputItemId] ?? 0) + qty;
        produced = [{ itemId: recipe.outputItemId, quantity: qty }];
        expGain = recipe.exp;
    } else {
        expGain = Math.floor(recipe.exp * 0.25);
    }

    const updatedInventory = { ...inventory, items: newItems };
    const canContinue = canCraft(recipe, updatedInventory);

    return {
        alchemy: {
            ...alchemy,
            progressMs: newProgressMs - duration,
            totalPillsCrafted: alchemy.totalPillsCrafted + (failed ? 0 : 1),
            isActive: canContinue,
        },
        inventory: updatedInventory,
        expGain,
        produced,
    };
}
