import type { EquipmentSlotId } from "../types";

export interface EquipmentStatBonus {
    attack?: number;
    defense?: number;
    hp?: number;
    meditationPercent?: number; // e.g., 0.1 = +10% meditation efficiency
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
    // ─── Necklace (项链) ────────────────────────────────────────────────
    {
        id: "spirit_necklace",
        name: "灵气项链",
        description: "提升灵力恢复的项链",
        icon: "📿",
        slot: "necklace",
        baseStats: { meditationPercent: 0.05 },
        enhancePerLevel: { meditationPercent: 0.02 },
        maxLevel: 10,
        requiredStage: 0,
        forgingRecipe: {
            ingredients: [
                { itemId: "beast_bone", quantity: 3 },
                { itemId: "beast_hide", quantity: 2 },
            ],
            spiritStones: 80,
            forgingLevelRequired: 5,
            exp: 20,
        },
    },
    {
        id: "demon_necklace",
        name: "妖魔项链",
        description: "蕴含妖力的项链，提升各项属性",
        icon: "📿",
        slot: "necklace",
        baseStats: { attack: 10, defense: 5, meditationPercent: 0.08 },
        enhancePerLevel: { attack: 3, defense: 2, meditationPercent: 0.02 },
        maxLevel: 10,
        requiredStage: 1,
        forgingRecipe: {
            ingredients: [
                { itemId: "demon_core", quantity: 3 },
                { itemId: "beast_bone", quantity: 5 },
            ],
            spiritStones: 500,
            forgingLevelRequired: 18,
            exp: 55,
        },
    },

    // ─── Helmet (头盔) ──────────────────────────────────────────────────
    {
        id: "iron_helmet",
        name: "灵铁头盔",
        description: "灵铁锻造的头盔，保护头部",
        icon: "⛑️",
        slot: "helmet",
        baseStats: { defense: 5, hp: 20 },
        enhancePerLevel: { defense: 1, hp: 8 },
        maxLevel: 10,
        requiredStage: 0,
        forgingRecipe: {
            ingredients: [
                { itemId: "iron_ore", quantity: 2 },
                { itemId: "beast_hide", quantity: 1 },
            ],
            spiritStones: 40,
            forgingLevelRequired: 1,
            exp: 10,
        },
    },
    {
        id: "demon_helmet",
        name: "妖魔头冠",
        description: "妖魔材料打造的头冠",
        icon: "👑",
        slot: "helmet",
        baseStats: { defense: 18, hp: 80 },
        enhancePerLevel: { defense: 4, hp: 25 },
        maxLevel: 10,
        requiredStage: 1,
        forgingRecipe: {
            ingredients: [
                { itemId: "iron_ore", quantity: 5 },
                { itemId: "demon_core", quantity: 2 },
            ],
            spiritStones: 350,
            forgingLevelRequired: 14,
            exp: 45,
        },
    },

    // ─── Amulet (护身符) ────────────────────────────────────────────────
    {
        id: "jade_amulet",
        name: "玉质护符",
        description: "以灵玉雕刻的护身符",
        icon: "🔮",
        slot: "amulet",
        baseStats: { defense: 3, hp: 15, meditationPercent: 0.03 },
        enhancePerLevel: { defense: 1, hp: 5, meditationPercent: 0.01 },
        maxLevel: 10,
        requiredStage: 0,
        forgingRecipe: {
            ingredients: [
                { itemId: "beast_bone", quantity: 2 },
                { itemId: "beast_hide", quantity: 3 },
            ],
            spiritStones: 60,
            forgingLevelRequired: 3,
            exp: 15,
        },
    },
    {
        id: "void_amulet",
        name: "虚空护符",
        description: "虚空之力凝聚，全方位提升",
        icon: "🔮",
        slot: "amulet",
        baseStats: { attack: 50, defense: 30, hp: 200, meditationPercent: 0.15 },
        enhancePerLevel: { attack: 10, defense: 8, hp: 50, meditationPercent: 0.03 },
        maxLevel: 10,
        requiredStage: 3,
        forgingRecipe: {
            ingredients: [
                { itemId: "void_crystal", quantity: 4 },
                { itemId: "demon_core", quantity: 6 },
                { itemId: "fire_crystal", quantity: 3 },
            ],
            spiritStones: 80000,
            forgingLevelRequired: 60,
            exp: 1200,
        },
    },

    // ─── Gloves (手套) - left & right ──────────────────────────────────
    {
        id: "iron_gloves",
        name: "灵铁手套",
        description: "增强攻击力的手套",
        icon: "🧤",
        slot: "glove_left",
        baseStats: { attack: 8 },
        enhancePerLevel: { attack: 2 },
        maxLevel: 10,
        requiredStage: 0,
        forgingRecipe: {
            ingredients: [
                { itemId: "iron_ore", quantity: 2 },
                { itemId: "beast_hide", quantity: 2 },
            ],
            spiritStones: 45,
            forgingLevelRequired: 2,
            exp: 12,
        },
    },
    {
        id: "demon_gloves",
        name: "妖魔爪套",
        description: "妖力加持的爪套",
        icon: "🧤",
        slot: "glove_left",
        baseStats: { attack: 28 },
        enhancePerLevel: { attack: 6 },
        maxLevel: 10,
        requiredStage: 1,
        forgingRecipe: {
            ingredients: [
                { itemId: "iron_ore", quantity: 6 },
                { itemId: "demon_core", quantity: 2 },
            ],
            spiritStones: 400,
            forgingLevelRequired: 13,
            exp: 48,
        },
    },
    {
        id: "fire_gauntlets",
        name: "火灵护手",
        description: "火属性护手，攻防兼备",
        icon: "🧤",
        slot: "glove_right",
        baseStats: { attack: 15, defense: 10 },
        enhancePerLevel: { attack: 3, defense: 2 },
        maxLevel: 10,
        requiredStage: 2,
        forgingRecipe: {
            ingredients: [
                { itemId: "fire_crystal", quantity: 3 },
                { itemId: "iron_ore", quantity: 8 },
            ],
            spiritStones: 3500,
            forgingLevelRequired: 28,
            exp: 160,
        },
    },
    {
        id: "void_gauntlets",
        name: "虚空战手",
        description: "虚空之力注入的战手",
        icon: "🧤",
        slot: "glove_right",
        baseStats: { attack: 60, defense: 30 },
        enhancePerLevel: { attack: 12, defense: 6 },
        maxLevel: 10,
        requiredStage: 3,
        forgingRecipe: {
            ingredients: [
                { itemId: "void_crystal", quantity: 3 },
                { itemId: "iron_ore", quantity: 12 },
            ],
            spiritStones: 45000,
            forgingLevelRequired: 48,
            exp: 750,
        },
    },

    // ─── Armor (盔甲) ──────────────────────────────────────────────────
    {
        id: "leather_armor",
        name: "灵兽皮甲",
        description: "以灵兽皮革制成的轻甲",
        icon: "🛡️",
        slot: "armor",
        baseStats: { defense: 8, hp: 30 },
        enhancePerLevel: { defense: 2, hp: 10 },
        maxLevel: 10,
        requiredStage: 0,
        forgingRecipe: {
            ingredients: [
                { itemId: "beast_hide", quantity: 5 },
                { itemId: "beast_bone", quantity: 1 },
            ],
            spiritStones: 40,
            forgingLevelRequired: 1,
            exp: 12,
        },
    },
    {
        id: "demon_armor",
        name: "妖甲",
        description: "以妖魔材料锻造的重甲",
        icon: "🛡️",
        slot: "armor",
        baseStats: { defense: 25, hp: 100 },
        enhancePerLevel: { defense: 6, hp: 30 },
        maxLevel: 10,
        requiredStage: 1,
        forgingRecipe: {
            ingredients: [
                { itemId: "beast_hide", quantity: 10 },
                { itemId: "demon_core", quantity: 2 },
                { itemId: "iron_ore", quantity: 5 },
            ],
            spiritStones: 400,
            forgingLevelRequired: 15,
            exp: 50,
        },
    },
    {
        id: "fire_armor",
        name: "火灵铠甲",
        description: "火属性防具，防御火焰攻击",
        icon: "🔥",
        slot: "armor",
        baseStats: { defense: 70, hp: 300 },
        enhancePerLevel: { defense: 15, hp: 80 },
        maxLevel: 10,
        requiredStage: 2,
        forgingRecipe: {
            ingredients: [
                { itemId: "iron_ore", quantity: 10 },
                { itemId: "fire_crystal", quantity: 3 },
                { itemId: "beast_hide", quantity: 15 },
            ],
            spiritStones: 4000,
            forgingLevelRequired: 30,
            exp: 180,
        },
    },
    {
        id: "void_armor",
        name: "虚空战甲",
        description: "虚空之力护体，刀枪不入",
        icon: "🌀",
        slot: "armor",
        baseStats: { defense: 200, hp: 1000 },
        enhancePerLevel: { defense: 40, hp: 200 },
        maxLevel: 10,
        requiredStage: 3,
        forgingRecipe: {
            ingredients: [
                { itemId: "void_crystal", quantity: 3 },
                { itemId: "iron_ore", quantity: 15 },
                { itemId: "beast_hide", quantity: 20 },
            ],
            spiritStones: 40000,
            forgingLevelRequired: 50,
            exp: 700,
        },
    },

    // ─── Rings (戒指) - left & right ───────────────────────────────────
    {
        id: "jade_ring",
        name: "灵玉戒指",
        description: "灵气加持的戒指",
        icon: "💍",
        slot: "ring_left",
        baseStats: { attack: 5, meditationPercent: 0.03 },
        enhancePerLevel: { attack: 1, meditationPercent: 0.01 },
        maxLevel: 10,
        requiredStage: 0,
        forgingRecipe: {
            ingredients: [
                { itemId: "beast_bone", quantity: 2 },
                { itemId: "iron_ore", quantity: 1 },
            ],
            spiritStones: 50,
            forgingLevelRequired: 3,
            exp: 12,
        },
    },
    {
        id: "demon_ring",
        name: "妖核指环",
        description: "以妖核为核心的指环，提升各项属性",
        icon: "💍",
        slot: "ring_left",
        baseStats: { attack: 10, defense: 10, meditationPercent: 0.08 },
        enhancePerLevel: { attack: 3, defense: 3, meditationPercent: 0.02 },
        maxLevel: 10,
        requiredStage: 1,
        forgingRecipe: {
            ingredients: [
                { itemId: "demon_core", quantity: 4 },
                { itemId: "iron_ore", quantity: 3 },
            ],
            spiritStones: 600,
            forgingLevelRequired: 20,
            exp: 70,
        },
    },
    {
        id: "fire_ring",
        name: "火灵之戒",
        description: "蕴含火灵气的戒指",
        icon: "💍",
        slot: "ring_right",
        baseStats: { attack: 30, hp: 100 },
        enhancePerLevel: { attack: 6, hp: 25 },
        maxLevel: 10,
        requiredStage: 2,
        forgingRecipe: {
            ingredients: [
                { itemId: "fire_crystal", quantity: 2 },
                { itemId: "iron_ore", quantity: 5 },
            ],
            spiritStones: 3000,
            forgingLevelRequired: 25,
            exp: 140,
        },
    },
    {
        id: "void_ring",
        name: "虚空之戒",
        description: "虚空力量凝结的神秘戒指",
        icon: "💍",
        slot: "ring_right",
        baseStats: { attack: 80, defense: 40, hp: 300 },
        enhancePerLevel: { attack: 15, defense: 8, hp: 60 },
        maxLevel: 10,
        requiredStage: 3,
        forgingRecipe: {
            ingredients: [
                { itemId: "void_crystal", quantity: 3 },
                { itemId: "demon_core", quantity: 5 },
            ],
            spiritStones: 60000,
            forgingLevelRequired: 55,
            exp: 900,
        },
    },

    // ─── Boots (靴子) ──────────────────────────────────────────────────
    {
        id: "spirit_boots",
        name: "灵步靴",
        description: "轻盈的灵气靴子",
        icon: "👢",
        slot: "boots",
        baseStats: { defense: 4, hp: 20 },
        enhancePerLevel: { defense: 1, hp: 6 },
        maxLevel: 10,
        requiredStage: 0,
        forgingRecipe: {
            ingredients: [
                { itemId: "beast_hide", quantity: 4 },
                { itemId: "beast_bone", quantity: 1 },
            ],
            spiritStones: 35,
            forgingLevelRequired: 2,
            exp: 10,
        },
    },
    {
        id: "demon_boots",
        name: "妖皮战靴",
        description: "妖兽皮制成的战靴",
        icon: "👢",
        slot: "boots",
        baseStats: { defense: 15, hp: 60 },
        enhancePerLevel: { defense: 4, hp: 18 },
        maxLevel: 10,
        requiredStage: 1,
        forgingRecipe: {
            ingredients: [
                { itemId: "beast_hide", quantity: 8 },
                { itemId: "demon_core", quantity: 1 },
            ],
            spiritStones: 300,
            forgingLevelRequired: 12,
            exp: 40,
        },
    },

    // ─── Weapons (held items, use glove slots) ──────────────────────────────────
    {
        id: "iron_sword",
        name: "铁剑",
        description: "普通铁剑，入门级法器",
        icon: "🗡️",
        slot: "glove_left",
        baseStats: { attack: 10 },
        enhancePerLevel: { attack: 3 },
        maxLevel: 10,
        requiredStage: 0,
        forgingRecipe: {
            ingredients: [
                { itemId: "iron_ore", quantity: 3 },
                { itemId: "beast_bone", quantity: 2 },
            ],
            spiritStones: 50,
            forgingLevelRequired: 1,
            exp: 15,
        },
    },
    {
        id: "demon_blade",
        name: "妖魔刀",
        description: "以妖核为芯炼制的法刀，蕴含妖力",
        icon: "⚔️",
        slot: "glove_right",
        baseStats: { attack: 35 },
        enhancePerLevel: { attack: 8 },
        maxLevel: 10,
        requiredStage: 1,
        forgingRecipe: {
            ingredients: [
                { itemId: "iron_ore", quantity: 8 },
                { itemId: "demon_core", quantity: 3 },
            ],
            spiritStones: 500,
            forgingLevelRequired: 15,
            exp: 60,
        },
    },
    {
        id: "fire_spirit_sword",
        name: "火灵剑",
        description: "以火晶石淬炼的灵剑，附带火焰之力",
        icon: "🔥",
        slot: "glove_left",
        baseStats: { attack: 100 },
        enhancePerLevel: { attack: 20 },
        maxLevel: 10,
        requiredStage: 2,
        forgingRecipe: {
            ingredients: [
                { itemId: "iron_ore", quantity: 15 },
                { itemId: "fire_crystal", quantity: 5 },
                { itemId: "demon_core", quantity: 5 },
            ],
            spiritStones: 5000,
            forgingLevelRequired: 30,
            exp: 200,
        },
    },
    {
        id: "void_sword",
        name: "虚空之刃",
        description: "以虚空结晶铸造的神兵，可撕裂空间",
        icon: "🌀",
        slot: "glove_right",
        baseStats: { attack: 350 },
        enhancePerLevel: { attack: 60 },
        maxLevel: 10,
        requiredStage: 3,
        forgingRecipe: {
            ingredients: [
                { itemId: "void_crystal", quantity: 5 },
                { itemId: "iron_ore", quantity: 20 },
                { itemId: "demon_core", quantity: 10 },
            ],
            spiritStones: 50000,
            forgingLevelRequired: 50,
            exp: 800,
        },
    },
];

/** Enhancement cost: spiritStones needed to enhance equipment from level to level+1 */
export function getEnhanceCost(equipDef: EquipmentDef, currentLevel: number): number {
    const baseCost = equipDef.forgingRecipe.spiritStones;
    return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

/** Additional material cost for enhancement */
export function getEnhanceMaterials(
    equipDef: EquipmentDef,
    currentLevel: number,
): { itemId: string; quantity: number }[] {
    // Each enhancement requires a fraction of original ingredients
    return equipDef.forgingRecipe.ingredients.map((ing) => ({
        itemId: ing.itemId,
        quantity: Math.max(1, Math.floor(ing.quantity * 0.3 * (1 + currentLevel * 0.1))),
    }));
}

export function getEquipment(id: string): EquipmentDef | undefined {
    return EQUIPMENT.find((e) => e.id === id);
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
