import type { EquipmentSlotId } from "../types";

// ─── Category-specific metadata types ───────────────────────────────────────

export interface EquipmentStatBonus {
    attack?: number;
    defense?: number;
    hp?: number;
    meditationPercent?: number; // e.g. 0.1 = +10% meditation efficiency
}

/** Growing metadata — herbs only */
export interface HerbGrowData {
    seedItemId: string;
    growthDurationMs: number;
    minYield: number;
    maxYield: number;
    farmingLevelRequired: number;
    exp: number; // farming skill exp per harvest
}

/** Alchemy craft data — craftable pill items only */
export interface RecipeData {
    ingredients: { itemId: string; quantity: number }[];
    outputQuantity: [number, number]; // [min, max]
    durationMs: number;
    alchemyLevelRequired: number;
    cultivationStageRequired: number;
    exp: number; // alchemy skill exp per craft
    failChance: number;
}

/** Combat-use effect — pills usable during combat/dungeon */
export interface PillCombatEffect {
    hpRecovery: number; // fraction of maxHp restored
    spiritRecovery: number; // fraction of spiritMax restored
}

/** Equipment-specific data — equipment items only */
export interface EquipData {
    slot: EquipmentSlotId;
    baseStats: EquipmentStatBonus;
    enhancePerLevel: EquipmentStatBonus;
    maxLevel: number;
    requiredStage: number;
    forgingRecipe: {
        ingredients: { itemId: string; quantity: number }[];
        spiritStones: number;
        forgingLevelRequired: number;
        exp: number; // forging skill exp
    };
}

// ─── Unified item definition ─────────────────────────────────────────────────

export type ItemCategory = "currency" | "seed" | "herb" | "fish" | "pill" | "material" | "equipment";

export interface ItemDef {
    id: string;
    name: string;
    description: string;
    category: ItemCategory;
    emoji: string;
    stackable: boolean;
    sellPrice?: number; // spirit stones; undefined = not sellable
    combatEffect?: PillCombatEffect; // pills usable in combat
    herbData?: HerbGrowData; // herbs
    recipeData?: RecipeData; // craftable pills
    equipData?: EquipData; // equipment
}

export const ITEMS: ItemDef[] = [
    // Currency
    {
        id: "spirit_stone",
        name: "灵石",
        description: "修仙世界的通用货币",
        category: "currency",
        emoji: "💰",
        stackable: true,
    },
    // Seeds
    {
        id: "spirit_grass_seed",
        name: "灵草种子",
        description: "种植灵草的种子",
        category: "seed",
        emoji: "🌱",
        stackable: true,
        sellPrice: 2,
    },
    {
        id: "fire_herb_seed",
        name: "火灵草种子",
        description: "种植火灵草的种子",
        category: "seed",
        emoji: "🌱",
        stackable: true,
        sellPrice: 5,
    },
    {
        id: "moon_flower_seed",
        name: "月华花种子",
        description: "种植月华花的种子",
        category: "seed",
        emoji: "🌱",
        stackable: true,
        sellPrice: 10,
    },
    {
        id: "golden_lotus_seed",
        name: "金莲子种子",
        description: "种植金莲子的种子",
        category: "seed",
        emoji: "🌱",
        stackable: true,
        sellPrice: 25,
    },
    // Herbs
    {
        id: "spirit_grass",
        name: "灵草",
        description: "最基础的灵草，炼制聚气丹的原料",
        category: "herb",
        emoji: "🌿",
        stackable: true,
        sellPrice: 5,
        herbData: {
            seedItemId: "spirit_grass_seed",
            growthDurationMs: 60_000,
            minYield: 3,
            maxYield: 8,
            farmingLevelRequired: 1,
            exp: 10,
        },
    },
    {
        id: "fire_herb",
        name: "火灵草",
        description: "蕴含火灵气，炼制培元丹的主料",
        category: "herb",
        emoji: "🔥",
        stackable: true,
        sellPrice: 15,
        herbData: {
            seedItemId: "fire_herb_seed",
            growthDurationMs: 5 * 60_000,
            minYield: 2,
            maxYield: 5,
            farmingLevelRequired: 10,
            exp: 35,
        },
    },
    {
        id: "moon_flower",
        name: "月华花",
        description: "月夜盛开，炼制筑基丹必须材料",
        category: "herb",
        emoji: "🌸",
        stackable: true,
        sellPrice: 30,
        herbData: {
            seedItemId: "moon_flower_seed",
            growthDurationMs: 30 * 60_000,
            minYield: 1,
            maxYield: 3,
            farmingLevelRequired: 30,
            exp: 120,
        },
    },
    {
        id: "golden_lotus",
        name: "金莲子",
        description: "传说中的灵药，炼制金丹境突破丹的核心材料",
        category: "herb",
        emoji: "🪷",
        stackable: true,
        sellPrice: 80,
        herbData: {
            seedItemId: "golden_lotus_seed",
            growthDurationMs: 2 * 60 * 60_000,
            minYield: 1,
            maxYield: 2,
            farmingLevelRequired: 60,
            exp: 500,
        },
    },
    // Fish
    {
        id: "carp",
        name: "灵鲤",
        description: "灵湖中常见的鱼类",
        category: "fish",
        emoji: "🐟",
        stackable: true,
        sellPrice: 3,
    },
    {
        id: "spirit_fish",
        name: "灵鱼",
        description: "蕴含灵气的鱼",
        category: "fish",
        emoji: "🐠",
        stackable: true,
        sellPrice: 8,
    },
    {
        id: "jade_fish",
        name: "玉鱼",
        description: "通体如玉的稀有鱼类",
        category: "fish",
        emoji: "🐡",
        stackable: true,
        sellPrice: 20,
    },
    {
        id: "fire_carp",
        name: "赤炎鲤",
        description: "生活在火山温泉的炎系鱼类",
        category: "fish",
        emoji: "🔴",
        stackable: true,
        sellPrice: 35,
    },
    {
        id: "lava_eel",
        name: "熔岩鳗",
        description: "极为罕见的熔岩鳗鱼",
        category: "fish",
        emoji: "🌋",
        stackable: true,
        sellPrice: 60,
    },
    {
        id: "dragon_fish",
        name: "龙纹鱼",
        description: "身具龙纹的神秘鱼类",
        category: "fish",
        emoji: "🐉",
        stackable: true,
        sellPrice: 100,
    },
    {
        id: "phoenix_carp",
        name: "凤尾鲤",
        description: "传说中的仙灵鱼类",
        category: "fish",
        emoji: "🦚",
        stackable: true,
        sellPrice: 200,
    },
    // Materials
    {
        id: "fire_crystal",
        name: "火晶石",
        description: "火山中凝聚的火属性晶石",
        category: "material",
        emoji: "🔮",
        stackable: true,
        sellPrice: 25,
    },
    {
        id: "beast_hide",
        name: "灵兽皮",
        description: "灵兽身上剥取的皮革，炼器基础材料",
        category: "material",
        emoji: "🐾",
        stackable: true,
        sellPrice: 20,
    },
    {
        id: "beast_bone",
        name: "灵兽骨",
        description: "灵兽的骨骼，蕴含灵气",
        category: "material",
        emoji: "🦴",
        stackable: true,
        sellPrice: 30,
    },
    {
        id: "iron_ore",
        name: "灵铁矿",
        description: "蕴含灵气的铁矿石，炼器核心材料",
        category: "material",
        emoji: "⛏️",
        stackable: true,
        sellPrice: 40,
    },
    {
        id: "demon_core",
        name: "妖核",
        description: "妖兽体内的核心，蕴含强大妖力",
        category: "material",
        emoji: "💀",
        stackable: true,
        sellPrice: 100,
    },
    {
        id: "void_crystal",
        name: "虚空结晶",
        description: "虚空中凝聚的稀有晶体，高阶炼器材料",
        category: "material",
        emoji: "✨",
        stackable: true,
        sellPrice: 250,
    },
    // Pills
    {
        id: "gathering_pill",
        name: "聚气丹",
        description: "服用后打坐灵力恢复效率+50%，持续5分钟",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 20,
        combatEffect: { hpRecovery: 0.05, spiritRecovery: 0.3 },
        recipeData: {
            ingredients: [{ itemId: "spirit_grass", quantity: 3 }],
            outputQuantity: [1, 3],
            durationMs: 30_000,
            alchemyLevelRequired: 1,
            cultivationStageRequired: 0,
            exp: 20,
            failChance: 0.2,
        },
    },
    // Breakthrough pills
    {
        id: "foundation_pill",
        name: "筑基丹",
        description: "突破筑基时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 50,
        combatEffect: { hpRecovery: 0.15, spiritRecovery: 0.05 },
        recipeData: {
            ingredients: [
                { itemId: "moon_flower", quantity: 2 },
                { itemId: "spirit_grass", quantity: 5 },
            ],
            outputQuantity: [1, 2],
            durationMs: 5 * 60_000,
            alchemyLevelRequired: 20,
            cultivationStageRequired: 0,
            exp: 150,
            failChance: 0.4,
        },
    },
    {
        id: "core_formation_pill",
        name: "结丹丹",
        description: "突破结丹时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 150,
        combatEffect: { hpRecovery: 0.2, spiritRecovery: 0.1 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 1 },
                { itemId: "moon_flower", quantity: 3 },
                { itemId: "fire_herb", quantity: 5 },
            ],
            outputQuantity: [1, 1],
            durationMs: 30 * 60_000,
            alchemyLevelRequired: 50,
            cultivationStageRequired: 1,
            exp: 800,
            failChance: 0.5,
        },
    },
    {
        id: "nascent_soul_pill",
        name: "元婴丹",
        description: "突破元婴时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 500,
        combatEffect: { hpRecovery: 0.25, spiritRecovery: 0.15 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 3 },
                { itemId: "fire_herb", quantity: 10 },
                { itemId: "demon_core", quantity: 5 },
            ],
            outputQuantity: [1, 1],
            durationMs: 60 * 60_000,
            alchemyLevelRequired: 70,
            cultivationStageRequired: 2,
            exp: 2000,
            failChance: 0.5,
        },
    },
    {
        id: "god_transform_pill",
        name: "化神丹",
        description: "突破化神时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 1500,
        combatEffect: { hpRecovery: 0.3, spiritRecovery: 0.2 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 5 },
                { itemId: "void_crystal", quantity: 3 },
                { itemId: "demon_core", quantity: 10 },
            ],
            outputQuantity: [1, 1],
            durationMs: 120 * 60_000,
            alchemyLevelRequired: 85,
            cultivationStageRequired: 3,
            exp: 5000,
            failChance: 0.5,
        },
    },
    {
        id: "void_refining_pill",
        name: "炼虚丹",
        description: "突破炼虚时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 5000,
        combatEffect: { hpRecovery: 0.35, spiritRecovery: 0.25 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 8 },
                { itemId: "void_crystal", quantity: 8 },
                { itemId: "demon_core", quantity: 15 },
            ],
            outputQuantity: [1, 1],
            durationMs: 180 * 60_000,
            alchemyLevelRequired: 90,
            cultivationStageRequired: 4,
            exp: 10000,
            failChance: 0.5,
        },
    },
    {
        id: "body_integration_pill",
        name: "合体丹",
        description: "突破合体时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 15000,
        combatEffect: { hpRecovery: 0.4, spiritRecovery: 0.3 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 12 },
                { itemId: "void_crystal", quantity: 15 },
                { itemId: "demon_core", quantity: 20 },
            ],
            outputQuantity: [1, 1],
            durationMs: 240 * 60_000,
            alchemyLevelRequired: 93,
            cultivationStageRequired: 5,
            exp: 20000,
            failChance: 0.5,
        },
    },
    {
        id: "mahayana_pill",
        name: "大乘丹",
        description: "突破大乘时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 50000,
        combatEffect: { hpRecovery: 0.5, spiritRecovery: 0.4 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 20 },
                { itemId: "void_crystal", quantity: 25 },
                { itemId: "demon_core", quantity: 30 },
            ],
            outputQuantity: [1, 1],
            durationMs: 360 * 60_000,
            alchemyLevelRequired: 96,
            cultivationStageRequired: 6,
            exp: 40000,
            failChance: 0.5,
        },
    },
    {
        id: "true_immortal_pill",
        name: "真仙丹",
        description: "突破真仙时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 200000,
        combatEffect: { hpRecovery: 0.6, spiritRecovery: 0.5 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 30 },
                { itemId: "void_crystal", quantity: 40 },
                { itemId: "demon_core", quantity: 50 },
            ],
            outputQuantity: [1, 1],
            durationMs: 480 * 60_000,
            alchemyLevelRequired: 97,
            cultivationStageRequired: 7,
            exp: 80000,
            failChance: 0.5,
        },
    },
    {
        id: "golden_immortal_pill",
        name: "金仙丹",
        description: "突破金仙时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 800000,
        combatEffect: { hpRecovery: 0.7, spiritRecovery: 0.6 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 50 },
                { itemId: "void_crystal", quantity: 60 },
                { itemId: "demon_core", quantity: 80 },
            ],
            outputQuantity: [1, 1],
            durationMs: 600 * 60_000,
            alchemyLevelRequired: 98,
            cultivationStageRequired: 8,
            exp: 150000,
            failChance: 0.5,
        },
    },
    {
        id: "taiyi_pill",
        name: "太乙丹",
        description: "突破太乙时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 3000000,
        combatEffect: { hpRecovery: 0.8, spiritRecovery: 0.7 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 80 },
                { itemId: "void_crystal", quantity: 100 },
                { itemId: "demon_core", quantity: 120 },
            ],
            outputQuantity: [1, 1],
            durationMs: 720 * 60_000,
            alchemyLevelRequired: 99,
            cultivationStageRequired: 9,
            exp: 300000,
            failChance: 0.5,
        },
    },
    {
        id: "daluo_pill",
        name: "大罗丹",
        description: "突破大罗时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 10000000,
        combatEffect: { hpRecovery: 0.9, spiritRecovery: 0.8 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 120 },
                { itemId: "void_crystal", quantity: 150 },
                { itemId: "demon_core", quantity: 200 },
            ],
            outputQuantity: [1, 1],
            durationMs: 900 * 60_000,
            alchemyLevelRequired: 99,
            cultivationStageRequired: 10,
            exp: 500000,
            failChance: 0.5,
        },
    },
    {
        id: "dao_ancestor_pill",
        name: "道祖丹",
        description: "突破道祖时消耗灵石减少50%",
        category: "pill",
        emoji: "💊",
        stackable: true,
        sellPrice: 50000000,
        combatEffect: { hpRecovery: 1.0, spiritRecovery: 1.0 },
        recipeData: {
            ingredients: [
                { itemId: "golden_lotus", quantity: 200 },
                { itemId: "void_crystal", quantity: 250 },
                { itemId: "demon_core", quantity: 300 },
            ],
            outputQuantity: [1, 1],
            durationMs: 1200 * 60_000,
            alchemyLevelRequired: 99,
            cultivationStageRequired: 11,
            exp: 1000000,
            failChance: 0.5,
        },
    },

    // ─── Equipment ────────────────────────────────────────────────────────────
    // Necklace
    {
        id: "spirit_necklace",
        name: "灵气项链",
        description: "提升灵力恢复的项链",
        category: "equipment",
        emoji: "📿",
        stackable: true,
        sellPrice: 40,
        equipData: {
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
    },
    {
        id: "demon_necklace",
        name: "妖魔项链",
        description: "蕴含妖力的项链，提升各项属性",
        category: "equipment",
        emoji: "📿",
        stackable: true,
        sellPrice: 250,
        equipData: {
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
    },
    // Helmet
    {
        id: "iron_helmet",
        name: "灵铁头盔",
        description: "灵铁锻造的头盔，保护头部",
        category: "equipment",
        emoji: "⛑️",
        stackable: true,
        sellPrice: 20,
        equipData: {
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
    },
    {
        id: "demon_helmet",
        name: "妖魔头冠",
        description: "妖魔材料打造的头冠",
        category: "equipment",
        emoji: "👑",
        stackable: true,
        sellPrice: 175,
        equipData: {
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
    },
    // Amulet
    {
        id: "jade_amulet",
        name: "玉质护符",
        description: "以灵玉雕刻的护身符",
        category: "equipment",
        emoji: "🔮",
        stackable: true,
        sellPrice: 30,
        equipData: {
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
    },
    {
        id: "void_amulet",
        name: "虚空护符",
        description: "虚空之力凝聚，全方位提升",
        category: "equipment",
        emoji: "🔮",
        stackable: true,
        sellPrice: 40000,
        equipData: {
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
    },
    // Gloves (left)
    {
        id: "iron_gloves",
        name: "灵铁手套",
        description: "增强攻击力的手套",
        category: "equipment",
        emoji: "🧤",
        stackable: true,
        sellPrice: 22,
        equipData: {
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
    },
    {
        id: "demon_gloves",
        name: "妖魔爪套",
        description: "妖力加持的爪套",
        category: "equipment",
        emoji: "🧤",
        stackable: true,
        sellPrice: 200,
        equipData: {
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
    },
    {
        id: "iron_sword",
        name: "铁剑",
        description: "普通铁剑，入门级法器",
        category: "equipment",
        emoji: "🗡️",
        stackable: true,
        sellPrice: 25,
        equipData: {
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
    },
    {
        id: "fire_spirit_sword",
        name: "火灵剑",
        description: "以火晶石淬炼的灵剑，附带火焰之力",
        category: "equipment",
        emoji: "🔥",
        stackable: true,
        sellPrice: 2500,
        equipData: {
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
    },
    // Gloves (right)
    {
        id: "fire_gauntlets",
        name: "火灵护手",
        description: "火属性护手，攻防兼备",
        category: "equipment",
        emoji: "🧤",
        stackable: true,
        sellPrice: 1750,
        equipData: {
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
    },
    {
        id: "void_gauntlets",
        name: "虚空战手",
        description: "虚空之力注入的战手",
        category: "equipment",
        emoji: "🧤",
        stackable: true,
        sellPrice: 22500,
        equipData: {
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
    },
    {
        id: "demon_blade",
        name: "妖魔刀",
        description: "以妖核为芯炼制的法刀，蕴含妖力",
        category: "equipment",
        emoji: "⚔️",
        stackable: true,
        sellPrice: 250,
        equipData: {
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
    },
    {
        id: "void_sword",
        name: "虚空之刃",
        description: "以虚空结晶铸造的神兵，可撕裂空间",
        category: "equipment",
        emoji: "🌀",
        stackable: true,
        sellPrice: 25000,
        equipData: {
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
    },
    // Armor
    {
        id: "leather_armor",
        name: "灵兽皮甲",
        description: "以灵兽皮革制成的轻甲",
        category: "equipment",
        emoji: "🛡️",
        stackable: true,
        sellPrice: 20,
        equipData: {
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
    },
    {
        id: "demon_armor",
        name: "妖甲",
        description: "以妖魔材料锻造的重甲",
        category: "equipment",
        emoji: "🛡️",
        stackable: true,
        sellPrice: 200,
        equipData: {
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
    },
    {
        id: "fire_armor",
        name: "火灵铠甲",
        description: "火属性防具，防御火焰攻击",
        category: "equipment",
        emoji: "🔥",
        stackable: true,
        sellPrice: 2000,
        equipData: {
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
    },
    {
        id: "void_armor",
        name: "虚空战甲",
        description: "虚空之力护体，刀枪不入",
        category: "equipment",
        emoji: "🌀",
        stackable: true,
        sellPrice: 20000,
        equipData: {
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
    },
    // Rings (left)
    {
        id: "jade_ring",
        name: "灵玉戒指",
        description: "灵气加持的戒指",
        category: "equipment",
        emoji: "💍",
        stackable: true,
        sellPrice: 25,
        equipData: {
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
    },
    {
        id: "demon_ring",
        name: "妖核指环",
        description: "以妖核为核心的指环，提升各项属性",
        category: "equipment",
        emoji: "💍",
        stackable: true,
        sellPrice: 300,
        equipData: {
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
    },
    // Rings (right)
    {
        id: "fire_ring",
        name: "火灵之戒",
        description: "蕴含火灵气的戒指",
        category: "equipment",
        emoji: "💍",
        stackable: true,
        sellPrice: 1500,
        equipData: {
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
    },
    {
        id: "void_ring",
        name: "虚空之戒",
        description: "虚空力量凝结的神秘戒指",
        category: "equipment",
        emoji: "💍",
        stackable: true,
        sellPrice: 30000,
        equipData: {
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
    },
    // Boots
    {
        id: "spirit_boots",
        name: "灵步靴",
        description: "轻盈的灵气靴子",
        category: "equipment",
        emoji: "👢",
        stackable: true,
        sellPrice: 17,
        equipData: {
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
    },
    {
        id: "demon_boots",
        name: "妖皮战靴",
        description: "妖兽皮制成的战靴",
        category: "equipment",
        emoji: "👢",
        stackable: true,
        sellPrice: 150,
        equipData: {
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
    },
];

export function getItem(id: string): ItemDef | undefined {
    return ITEMS.find((i) => i.id === id);
}

// ─── Derived lookup for backward compatibility ────────────────────────────────
export const PILL_COMBAT_EFFECTS: Record<string, PillCombatEffect> = Object.fromEntries(
    ITEMS.filter((i) => i.combatEffect).map((i) => [i.id, i.combatEffect!]),
);
