import type { EquipmentSlotId } from '../types';

export interface EquipmentStatBonus {
  attack?: number;
  defense?: number;
  hp?: number;
  meditationPercent?: number;  // e.g., 0.1 = +10% meditation efficiency
}

export interface EquipmentDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  slot: EquipmentSlotId;
  baseStats: EquipmentStatBonus;
  enhancePerLevel: EquipmentStatBonus; // bonus per enhancement level
  maxLevel: number;
  requiredStage: number;
  forgingRecipe: {
    ingredients: { itemId: string; quantity: number }[];
    spiritStones: number;
    forgingLevelRequired: number;
    exp: number; // forging skill exp
  };
}

export const EQUIPMENT: EquipmentDef[] = [
  // Weapons
  {
    id: 'iron_sword',
    name: '铁剑',
    description: '普通铁剑，入门级法器',
    icon: '🗡️',
    slot: 'weapon',
    baseStats: { attack: 10 },
    enhancePerLevel: { attack: 3 },
    maxLevel: 10,
    requiredStage: 0,
    forgingRecipe: {
      ingredients: [{ itemId: 'iron_ore', quantity: 3 }, { itemId: 'beast_bone', quantity: 2 }],
      spiritStones: 50,
      forgingLevelRequired: 1,
      exp: 15,
    },
  },
  {
    id: 'demon_blade',
    name: '妖魔刀',
    description: '以妖核为芯炼制的法刀，蕴含妖力',
    icon: '⚔️',
    slot: 'weapon',
    baseStats: { attack: 35 },
    enhancePerLevel: { attack: 8 },
    maxLevel: 10,
    requiredStage: 1,
    forgingRecipe: {
      ingredients: [{ itemId: 'iron_ore', quantity: 8 }, { itemId: 'demon_core', quantity: 3 }],
      spiritStones: 500,
      forgingLevelRequired: 15,
      exp: 60,
    },
  },
  {
    id: 'fire_spirit_sword',
    name: '火灵剑',
    description: '以火晶石淬炼的灵剑，附带火焰之力',
    icon: '🔥',
    slot: 'weapon',
    baseStats: { attack: 100 },
    enhancePerLevel: { attack: 20 },
    maxLevel: 10,
    requiredStage: 2,
    forgingRecipe: {
      ingredients: [{ itemId: 'iron_ore', quantity: 15 }, { itemId: 'fire_crystal', quantity: 5 }, { itemId: 'demon_core', quantity: 5 }],
      spiritStones: 5000,
      forgingLevelRequired: 30,
      exp: 200,
    },
  },
  {
    id: 'void_sword',
    name: '虚空之刃',
    description: '以虚空结晶铸造的神兵，可撕裂空间',
    icon: '🌀',
    slot: 'weapon',
    baseStats: { attack: 350 },
    enhancePerLevel: { attack: 60 },
    maxLevel: 10,
    requiredStage: 3,
    forgingRecipe: {
      ingredients: [{ itemId: 'void_crystal', quantity: 5 }, { itemId: 'iron_ore', quantity: 20 }, { itemId: 'demon_core', quantity: 10 }],
      spiritStones: 50000,
      forgingLevelRequired: 50,
      exp: 800,
    },
  },

  // Armor
  {
    id: 'leather_armor',
    name: '灵兽皮甲',
    description: '以灵兽皮革制成的轻甲',
    icon: '🛡️',
    slot: 'armor',
    baseStats: { defense: 8, hp: 30 },
    enhancePerLevel: { defense: 2, hp: 10 },
    maxLevel: 10,
    requiredStage: 0,
    forgingRecipe: {
      ingredients: [{ itemId: 'beast_hide', quantity: 5 }, { itemId: 'beast_bone', quantity: 1 }],
      spiritStones: 40,
      forgingLevelRequired: 1,
      exp: 12,
    },
  },
  {
    id: 'demon_armor',
    name: '妖甲',
    description: '以妖魔材料锻造的重甲',
    icon: '🛡️',
    slot: 'armor',
    baseStats: { defense: 25, hp: 100 },
    enhancePerLevel: { defense: 6, hp: 30 },
    maxLevel: 10,
    requiredStage: 1,
    forgingRecipe: {
      ingredients: [{ itemId: 'beast_hide', quantity: 10 }, { itemId: 'demon_core', quantity: 2 }, { itemId: 'iron_ore', quantity: 5 }],
      spiritStones: 400,
      forgingLevelRequired: 15,
      exp: 50,
    },
  },
  {
    id: 'fire_armor',
    name: '火灵铠甲',
    description: '火属性防具，防御火焰攻击',
    icon: '🔥',
    slot: 'armor',
    baseStats: { defense: 70, hp: 300 },
    enhancePerLevel: { defense: 15, hp: 80 },
    maxLevel: 10,
    requiredStage: 2,
    forgingRecipe: {
      ingredients: [{ itemId: 'iron_ore', quantity: 10 }, { itemId: 'fire_crystal', quantity: 3 }, { itemId: 'beast_hide', quantity: 15 }],
      spiritStones: 4000,
      forgingLevelRequired: 30,
      exp: 180,
    },
  },
  {
    id: 'void_armor',
    name: '虚空战甲',
    description: '虚空之力护体，刀枪不入',
    icon: '🌀',
    slot: 'armor',
    baseStats: { defense: 200, hp: 1000 },
    enhancePerLevel: { defense: 40, hp: 200 },
    maxLevel: 10,
    requiredStage: 3,
    forgingRecipe: {
      ingredients: [{ itemId: 'void_crystal', quantity: 3 }, { itemId: 'iron_ore', quantity: 15 }, { itemId: 'beast_hide', quantity: 20 }],
      spiritStones: 40000,
      forgingLevelRequired: 50,
      exp: 700,
    },
  },

  // Accessories
  {
    id: 'spirit_pendant',
    name: '灵气吊坠',
    description: '提升灵石产出的灵气法器',
    icon: '📿',
    slot: 'accessory',
    baseStats: { meditationPercent: 0.05 },
    enhancePerLevel: { meditationPercent: 0.02 },
    maxLevel: 10,
    requiredStage: 0,
    forgingRecipe: {
      ingredients: [{ itemId: 'beast_bone', quantity: 3 }, { itemId: 'beast_hide', quantity: 2 }],
      spiritStones: 80,
      forgingLevelRequired: 5,
      exp: 20,
    },
  },
  {
    id: 'demon_ring',
    name: '妖核指环',
    description: '以妖核为核心的指环，提升各项属性',
    icon: '💍',
    slot: 'accessory',
    baseStats: { attack: 10, defense: 10, meditationPercent: 0.08 },
    enhancePerLevel: { attack: 3, defense: 3, meditationPercent: 0.02 },
    maxLevel: 10,
    requiredStage: 1,
    forgingRecipe: {
      ingredients: [{ itemId: 'demon_core', quantity: 4 }, { itemId: 'iron_ore', quantity: 3 }],
      spiritStones: 600,
      forgingLevelRequired: 20,
      exp: 70,
    },
  },
  {
    id: 'void_amulet',
    name: '虚空护符',
    description: '虚空之力凝聚，全方位提升修士实力',
    icon: '🔮',
    slot: 'accessory',
    baseStats: { attack: 50, defense: 30, hp: 200, meditationPercent: 0.15 },
    enhancePerLevel: { attack: 10, defense: 8, hp: 50, meditationPercent: 0.03 },
    maxLevel: 10,
    requiredStage: 3,
    forgingRecipe: {
      ingredients: [{ itemId: 'void_crystal', quantity: 4 }, { itemId: 'demon_core', quantity: 6 }, { itemId: 'fire_crystal', quantity: 3 }],
      spiritStones: 80000,
      forgingLevelRequired: 60,
      exp: 1200,
    },
  },
];

/** Enhancement cost: spiritStones needed to enhance equipment from level to level+1 */
export function getEnhanceCost(equipDef: EquipmentDef, currentLevel: number): number {
  const baseCost = equipDef.forgingRecipe.spiritStones;
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

/** Additional material cost for enhancement */
export function getEnhanceMaterials(equipDef: EquipmentDef, currentLevel: number): { itemId: string; quantity: number }[] {
  // Each enhancement requires a fraction of original ingredients
  return equipDef.forgingRecipe.ingredients.map(ing => ({
    itemId: ing.itemId,
    quantity: Math.max(1, Math.floor(ing.quantity * 0.3 * (1 + currentLevel * 0.1))),
  }));
}

export function getEquipment(id: string): EquipmentDef | undefined {
  return EQUIPMENT.find(e => e.id === id);
}

/** Calculate total stats for an equipment instance including enhancements */
export function getEquipmentTotalStats(defId: string, level: number): EquipmentStatBonus {
  const def = getEquipment(defId);
  if (!def) return {};
  const stats: EquipmentStatBonus = {};
  for (const key of Object.keys(def.baseStats) as (keyof EquipmentStatBonus)[]) {
    stats[key] = (def.baseStats[key] ?? 0) + (def.enhancePerLevel[key] ?? 0) * level;
  }
  return stats;
}
