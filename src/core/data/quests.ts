export type QuestType = "fish" | "herb" | "alchemy" | "breakthrough" | "spiritStones";

export interface QuestReward {
    spiritStones?: number;
    items?: { itemId: string; quantity: number }[];
    skillExp?: { skillId: string; amount: number };
}

export interface QuestDef {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: QuestType;
    target: number;
    reward: QuestReward;
    difficultyTier: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
}

export const QUEST_POOL: QuestDef[] = [
    // Fishing quests
    {
        id: "daily_fish_5",
        name: "晨间垂钓",
        description: "今日钓鱼5次",
        icon: "🎣",
        type: "fish",
        target: 5,
        reward: {
            items: [
                { itemId: "spirit_stone", quantity: 50 },
                { itemId: "spirit_grass_seed", quantity: 2 },
            ],
        },
        difficultyTier: 1,
    },
    {
        id: "daily_fish_20",
        name: "渔获丰收",
        description: "今日钓鱼20次",
        icon: "🐟",
        type: "fish",
        target: 20,
        reward: {
            items: [
                { itemId: "spirit_stone", quantity: 200 },
                { itemId: "fire_herb_seed", quantity: 1 },
            ],
        },
        difficultyTier: 2,
    },
    {
        id: "daily_fish_50",
        name: "垂钓苦修",
        description: "今日钓鱼50次",
        icon: "🏆",
        type: "fish",
        target: 50,
        reward: {
            items: [
                { itemId: "spirit_stone", quantity: 500 },
                { itemId: "jade_fish", quantity: 3 },
            ],
        },
        difficultyTier: 3,
    },

    // Herb quests
    {
        id: "daily_herb_3",
        name: "药圃打理",
        description: "今日收获药草3次",
        icon: "🌿",
        type: "herb",
        target: 3,
        reward: {
            items: [
                { itemId: "spirit_stone", quantity: 80 },
                { itemId: "spirit_grass_seed", quantity: 3 },
            ],
        },
        difficultyTier: 1,
    },
    {
        id: "daily_herb_10",
        name: "辛勤耕耘",
        description: "今日收获药草10次",
        icon: "🌱",
        type: "herb",
        target: 10,
        reward: {
            items: [
                { itemId: "spirit_stone", quantity: 300 },
                { itemId: "fire_herb_seed", quantity: 2 },
            ],
        },
        difficultyTier: 2,
    },
    {
        id: "daily_herb_25",
        name: "药圃大丰收",
        description: "今日收获药草25次",
        icon: "🌾",
        type: "herb",
        target: 25,
        reward: {
            items: [
                { itemId: "spirit_stone", quantity: 800 },
                { itemId: "moon_flower_seed", quantity: 1 },
            ],
        },
        difficultyTier: 3,
    },

    // Alchemy quests
    {
        id: "daily_alchemy_2",
        name: "丹炉初燃",
        description: "今日炼制丹药2颗",
        icon: "⚗️",
        type: "alchemy",
        target: 2,
        reward: { items: [{ itemId: "spirit_stone", quantity: 100 }] },
        difficultyTier: 1,
    },
    {
        id: "daily_alchemy_8",
        name: "丹火不熄",
        description: "今日炼制丹药8颗",
        icon: "💊",
        type: "alchemy",
        target: 8,
        reward: {
            items: [
                { itemId: "spirit_stone", quantity: 400 },
                { itemId: "spirit_grass", quantity: 5 },
            ],
        },
        difficultyTier: 2,
    },
    {
        id: "daily_alchemy_20",
        name: "炼丹成狂",
        description: "今日炼制丹药20颗",
        icon: "🔥",
        type: "alchemy",
        target: 20,
        reward: {
            items: [
                { itemId: "spirit_stone", quantity: 1000 },
                { itemId: "gathering_pill", quantity: 1 },
            ],
        },
        difficultyTier: 3,
    },

    // Spirit stones quests (earned via selling/combat)
    {
        id: "daily_stones_500",
        name: "积少成多",
        description: "今日累计获得500灵石",
        icon: "💎",
        type: "spiritStones",
        target: 500,
        reward: { items: [{ itemId: "spirit_grass_seed", quantity: 3 }] },
        difficultyTier: 1,
    },
    {
        id: "daily_stones_2000",
        name: "灵石滚滚",
        description: "今日累计获得2,000灵石",
        icon: "💰",
        type: "spiritStones",
        target: 2000,
        reward: { items: [{ itemId: "gathering_pill", quantity: 1 }] },
        difficultyTier: 2,
    },
];

/** Select today's daily quests: one from each tier using a better distribution */
export function getDailyQuests(seed: number): QuestDef[] {
    const tier1 = QUEST_POOL.filter((q) => q.difficultyTier === 1);
    const tier2 = QUEST_POOL.filter((q) => q.difficultyTier === 2);
    const tier3 = QUEST_POOL.filter((q) => q.difficultyTier === 3);

    // Use a simple LCG-style hash to improve distribution across days
    const hash = (n: number) => (n * 1664525 + 1013904223) >>> 0;
    const s1 = hash(seed);
    const s2 = hash(s1 + 1);
    const s3 = hash(s2 + 1);

    return [tier1[s1 % tier1.length], tier2[s2 % tier2.length], tier3[s3 % tier3.length]];
}

/** Get a date string YYYY-MM-DD for today */
export function getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Get a numeric seed from a date string */
export function getDateSeed(dateStr: string): number {
    return dateStr.split("-").reduce((acc, part) => acc * 100 + parseInt(part, 10), 0);
}

export function getQuest(id: string): QuestDef | undefined {
    return QUEST_POOL.find((q) => q.id === id);
}
