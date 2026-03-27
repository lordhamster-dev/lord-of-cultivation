export interface EnemyDrop {
    itemId: string;
    chance: number; // 0-1
    quantity: [number, number]; // [min, max]
}

export interface EnemyDef {
    id: string;
    name: string;
    icon: string;
    hp: number;
    attack: number;
    defense: number;
    exp: number; // combat skill exp
    spiritStones: number; // spirit stones reward
    drops: EnemyDrop[];
}

export interface CombatAreaDef {
    id: string;
    name: string;
    description: string;
    icon: string;
    requiredStage: number; // minimum cultivation stage index
    enemies: EnemyDef[];
    combatDurationMs: number; // time per round
}

export const COMBAT_AREAS: CombatAreaDef[] = [
    {
        id: "spirit_forest",
        name: "灵兽森林",
        description: "练气期修士的试炼之地，低级灵兽出没",
        icon: "🌲",
        requiredStage: 0,
        combatDurationMs: 5_000,
        enemies: [
            {
                id: "spirit_rabbit",
                name: "灵兔",
                icon: "🐇",
                hp: 30,
                attack: 5,
                defense: 2,
                exp: 8,
                spiritStones: 5,
                drops: [
                    { itemId: "beast_hide", chance: 0.4, quantity: [1, 2] },
                    { itemId: "spirit_grass_seed", chance: 0.15, quantity: [1, 1] },
                ],
            },
            {
                id: "wild_boar",
                name: "野灵猪",
                icon: "🐗",
                hp: 60,
                attack: 10,
                defense: 5,
                exp: 15,
                spiritStones: 10,
                drops: [
                    { itemId: "beast_hide", chance: 0.5, quantity: [1, 3] },
                    { itemId: "beast_bone", chance: 0.3, quantity: [1, 1] },
                ],
            },
        ],
    },
    {
        id: "demon_cave",
        name: "妖洞",
        description: "筑基期修士可以探索的危险洞穴",
        icon: "🕳️",
        requiredStage: 1,
        combatDurationMs: 6_000,
        enemies: [
            {
                id: "cave_bat",
                name: "洞穴蝙蝠",
                icon: "🦇",
                hp: 150,
                attack: 25,
                defense: 10,
                exp: 40,
                spiritStones: 30,
                drops: [
                    { itemId: "beast_hide", chance: 0.4, quantity: [2, 4] },
                    { itemId: "demon_core", chance: 0.2, quantity: [1, 1] },
                ],
            },
            {
                id: "rock_golem",
                name: "岩石傀儡",
                icon: "🗿",
                hp: 300,
                attack: 35,
                defense: 25,
                exp: 80,
                spiritStones: 60,
                drops: [
                    { itemId: "iron_ore", chance: 0.5, quantity: [1, 3] },
                    { itemId: "beast_bone", chance: 0.4, quantity: [1, 2] },
                    { itemId: "demon_core", chance: 0.15, quantity: [1, 1] },
                ],
            },
        ],
    },
    {
        id: "fire_domain",
        name: "焰域",
        description: "金丹期方可进入的火属性秘境",
        icon: "🔥",
        requiredStage: 2,
        combatDurationMs: 7_000,
        enemies: [
            {
                id: "flame_serpent",
                name: "火焰蛇",
                icon: "🐍",
                hp: 800,
                attack: 80,
                defense: 40,
                exp: 200,
                spiritStones: 200,
                drops: [
                    { itemId: "fire_crystal", chance: 0.35, quantity: [1, 2] },
                    { itemId: "demon_core", chance: 0.3, quantity: [1, 2] },
                    { itemId: "fire_herb_seed", chance: 0.1, quantity: [1, 1] },
                ],
            },
            {
                id: "magma_beast",
                name: "熔岩兽",
                icon: "🌋",
                hp: 1500,
                attack: 120,
                defense: 70,
                exp: 400,
                spiritStones: 400,
                drops: [
                    { itemId: "fire_crystal", chance: 0.5, quantity: [2, 4] },
                    { itemId: "iron_ore", chance: 0.4, quantity: [2, 5] },
                    { itemId: "demon_core", chance: 0.25, quantity: [1, 2] },
                ],
            },
        ],
    },
    {
        id: "void_realm",
        name: "虚空裂隙",
        description: "元婴期以上的修士才能在此存活",
        icon: "🌀",
        requiredStage: 3,
        combatDurationMs: 8_000,
        enemies: [
            {
                id: "void_phantom",
                name: "虚空幻影",
                icon: "👻",
                hp: 5000,
                attack: 300,
                defense: 150,
                exp: 1000,
                spiritStones: 1500,
                drops: [
                    { itemId: "void_crystal", chance: 0.3, quantity: [1, 2] },
                    { itemId: "demon_core", chance: 0.5, quantity: [2, 4] },
                    { itemId: "golden_lotus_seed", chance: 0.05, quantity: [1, 1] },
                ],
            },
            {
                id: "ancient_demon",
                name: "上古妖魔",
                icon: "👹",
                hp: 10000,
                attack: 500,
                defense: 250,
                exp: 2500,
                spiritStones: 3000,
                drops: [
                    { itemId: "void_crystal", chance: 0.5, quantity: [1, 3] },
                    { itemId: "demon_core", chance: 0.6, quantity: [3, 6] },
                    { itemId: "moon_flower_seed", chance: 0.1, quantity: [1, 1] },
                ],
            },
        ],
    },
];

export function getCombatArea(id: string): CombatAreaDef | undefined {
    return COMBAT_AREAS.find((a) => a.id === id);
}
