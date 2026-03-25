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

export const ALCHEMY_RECIPES: AlchemyRecipeDef[] = [
  {
    id: 'gathering_pill',
    name: '聚气丹',
    description: '服用后灵石产出+50%，持续5分钟',
    ingredients: [{ itemId: 'spirit_grass', quantity: 3 }],
    outputItemId: 'gathering_pill',
    outputQuantity: [1, 3],
    durationMs: 30_000,
    alchemyLevelRequired: 1,
    cultivationStageRequired: 0,
    exp: 20,
    failChance: 0.2,
  },
  {
    id: 'foundation_pill',
    name: '筑基丹',
    description: '降低筑基突破所需灵石50%',
    ingredients: [
      { itemId: 'moon_flower', quantity: 2 },
      { itemId: 'spirit_grass', quantity: 5 },
    ],
    outputItemId: 'foundation_pill',
    outputQuantity: [1, 2],
    durationMs: 5 * 60_000,
    alchemyLevelRequired: 20,
    cultivationStageRequired: 0,
    exp: 150,
    failChance: 0.4,
  },
  {
    id: 'golden_core_pill',
    name: '金丹',
    description: '降低金丹突破所需灵石60%',
    ingredients: [
      { itemId: 'golden_lotus', quantity: 1 },
      { itemId: 'moon_flower', quantity: 3 },
      { itemId: 'fire_herb', quantity: 5 },
    ],
    outputItemId: 'golden_core_pill',
    outputQuantity: [1, 1],
    durationMs: 30 * 60_000,
    alchemyLevelRequired: 50,
    cultivationStageRequired: 1,
    exp: 800,
    failChance: 0.5,
  },
];

export function getRecipe(id: string): AlchemyRecipeDef | undefined {
  return ALCHEMY_RECIPES.find(r => r.id === id);
}
