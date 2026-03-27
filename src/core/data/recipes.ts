import { ITEMS } from "./items";

export interface AlchemyRecipeDef {
    id: string;
    name: string;
    description: string;
    ingredients: { itemId: string; quantity: number }[];
    outputItemId: string;
    outputQuantity: [number, number];
    durationMs: number;
    alchemyLevelRequired: number;
    cultivationStageRequired: number;
    exp: number;
    failChance: number;
}

export const ALCHEMY_RECIPES: AlchemyRecipeDef[] = ITEMS.filter((i) => i.recipeData).map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description,
    outputItemId: i.id,
    ...i.recipeData!,
}));

export function getRecipe(id: string): AlchemyRecipeDef | undefined {
    return ALCHEMY_RECIPES.find((r) => r.id === id);
}
