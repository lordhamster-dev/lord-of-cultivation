export interface DungeonFloor {
  floor: number;
  enemies: DungeonEnemyDef[];
  boss?: DungeonEnemyDef;
}

export interface DungeonEnemyDef {
  id: string;
  name: string;
  icon: string;
  hp: number;
  attack: number;
  defense: number;
  exp: number;
  spiritStones: number;
  drops: { itemId: string; chance: number; quantity: [number, number] }[];
  isBoss?: boolean;
}

export interface DungeonDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredStage: number;
  maxDailyRuns: number;
  floors: DungeonFloor[];
}

export const DUNGEONS: DungeonDef[] = [
  {
    id: 'spirit_cave',
    name: '灵兽洞窟',
    description: '入门级副本，适合练气期修士',
    icon: '🏔️',
    requiredStage: 0,
    maxDailyRuns: 3,
    floors: [
      {
        floor: 1,
        enemies: [
          { id: 'cave_rat', name: '洞穴鼠', icon: '🐀', hp: 40, attack: 8, defense: 3, exp: 10, spiritStones: 8, drops: [{ itemId: 'beast_hide', chance: 0.5, quantity: [1, 2] }] },
          { id: 'cave_spider', name: '洞穴蜘蛛', icon: '🕷️', hp: 50, attack: 10, defense: 4, exp: 12, spiritStones: 10, drops: [{ itemId: 'beast_hide', chance: 0.4, quantity: [1, 1] }] },
        ],
      },
      {
        floor: 2,
        enemies: [
          { id: 'cave_wolf', name: '洞穴灵狼', icon: '🐺', hp: 80, attack: 15, defense: 8, exp: 20, spiritStones: 15, drops: [{ itemId: 'beast_bone', chance: 0.4, quantity: [1, 2] }] },
        ],
      },
      {
        floor: 3,
        enemies: [],
        boss: {
          id: 'cave_bear_king', name: '灵熊王', icon: '🐻', hp: 200, attack: 25, defense: 15, exp: 80, spiritStones: 100,
          drops: [
            { itemId: 'beast_bone', chance: 0.8, quantity: [2, 4] },
            { itemId: 'iron_ore', chance: 0.5, quantity: [1, 3] },
            { itemId: 'spirit_grass_seed', chance: 0.3, quantity: [2, 5] },
          ],
          isBoss: true,
        },
      },
    ],
  },
  {
    id: 'demon_palace',
    name: '妖魔殿',
    description: '筑基期以上方可挑战的中级副本',
    icon: '🏯',
    requiredStage: 1,
    maxDailyRuns: 2,
    floors: [
      {
        floor: 1,
        enemies: [
          { id: 'demon_guard', name: '妖魔护卫', icon: '👺', hp: 200, attack: 30, defense: 15, exp: 50, spiritStones: 40, drops: [{ itemId: 'demon_core', chance: 0.3, quantity: [1, 1] }] },
          { id: 'demon_mage', name: '妖魔法师', icon: '🧙', hp: 150, attack: 40, defense: 10, exp: 60, spiritStones: 50, drops: [{ itemId: 'demon_core', chance: 0.35, quantity: [1, 1] }] },
        ],
      },
      {
        floor: 2,
        enemies: [
          { id: 'demon_elite', name: '妖魔精英', icon: '😈', hp: 400, attack: 50, defense: 25, exp: 100, spiritStones: 80, drops: [{ itemId: 'iron_ore', chance: 0.4, quantity: [1, 3] }, { itemId: 'demon_core', chance: 0.4, quantity: [1, 2] }] },
        ],
      },
      {
        floor: 3,
        enemies: [],
        boss: {
          id: 'demon_lord', name: '妖魔之主', icon: '👿', hp: 1000, attack: 80, defense: 40, exp: 400, spiritStones: 500,
          drops: [
            { itemId: 'demon_core', chance: 1, quantity: [3, 6] },
            { itemId: 'fire_crystal', chance: 0.5, quantity: [1, 3] },
            { itemId: 'fire_herb_seed', chance: 0.3, quantity: [1, 2] },
          ],
          isBoss: true,
        },
      },
    ],
  },
  {
    id: 'dragon_abyss',
    name: '龙渊秘境',
    description: '金丹期以上才能进入的高阶副本',
    icon: '🐉',
    requiredStage: 2,
    maxDailyRuns: 1,
    floors: [
      {
        floor: 1,
        enemies: [
          { id: 'dragon_guard', name: '龙渊守卫', icon: '🦎', hp: 1000, attack: 100, defense: 50, exp: 250, spiritStones: 200, drops: [{ itemId: 'iron_ore', chance: 0.5, quantity: [2, 5] }] },
        ],
      },
      {
        floor: 2,
        enemies: [
          { id: 'dragon_elite', name: '龙渊精英', icon: '🐲', hp: 2000, attack: 150, defense: 80, exp: 500, spiritStones: 400, drops: [{ itemId: 'void_crystal', chance: 0.3, quantity: [1, 2] }, { itemId: 'demon_core', chance: 0.5, quantity: [2, 4] }] },
        ],
      },
      {
        floor: 3,
        enemies: [],
        boss: {
          id: 'ancient_dragon', name: '上古龙魂', icon: '🐉', hp: 5000, attack: 250, defense: 120, exp: 2000, spiritStones: 3000,
          drops: [
            { itemId: 'void_crystal', chance: 0.8, quantity: [2, 5] },
            { itemId: 'demon_core', chance: 1, quantity: [5, 10] },
            { itemId: 'golden_lotus_seed', chance: 0.2, quantity: [1, 1] },
            { itemId: 'moon_flower_seed', chance: 0.4, quantity: [1, 3] },
          ],
          isBoss: true,
        },
      },
    ],
  },
];

export function getDungeon(id: string): DungeonDef | undefined {
  return DUNGEONS.find(d => d.id === id);
}
