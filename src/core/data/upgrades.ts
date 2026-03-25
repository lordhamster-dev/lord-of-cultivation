import type { UpgradeDef } from '../types';

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'spirit_gathering',
    name: '聚灵阵',
    description: '每秒灵石产出 +1',
    baseCost: 10,
    costMultiplier: 1.4,
    effect: (level) => level,         // +1 spiritStones/sec per level
  },
  {
    id: 'meditation',
    name: '打坐冥想',
    description: '每秒经验 +1',
    baseCost: 10,
    costMultiplier: 1.4,
    effect: (level) => level,         // +1 exp/sec per level
  },
  {
    id: 'spirit_vein',
    name: '灵脉开凿',
    description: '灵石产出 ×1.5 每级',
    baseCost: 500,
    costMultiplier: 3,
    effect: (level) => Math.pow(1.5, level),  // multiplier
    maxLevel: 10,
  },
  {
    id: 'enlightenment',
    name: '顿悟',
    description: '经验获取 ×1.5 每级',
    baseCost: 750,
    costMultiplier: 3,
    effect: (level) => Math.pow(1.5, level),  // multiplier
    maxLevel: 10,
  },
  {
    id: 'alchemy',
    name: '炼丹术',
    description: '突破消耗灵石 -10% 每级',
    baseCost: 2000,
    costMultiplier: 4,
    effect: (level) => Math.max(0.1, 1 - level * 0.1), // cost reduction ratio
    maxLevel: 9,
  },
];

export function getUpgrade(id: string): UpgradeDef | undefined {
  return UPGRADES.find((u) => u.id === id);
}
