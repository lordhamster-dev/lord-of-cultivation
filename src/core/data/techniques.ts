export interface TechniqueEffect {
  type: 'spiritStones' | 'exp' | 'fishing' | 'farming' | 'alchemy' | 'meditation';
  multiplier: number; // e.g., 1.2 = +20% bonus
}

export interface TechniqueDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  spiritCostPerSec: number;
  effects: TechniqueEffect[];
  requiredStage: number;           // Minimum major stage index
  requiredScrollItemId?: string;   // If set, must have this item to unlock
}

export const TECHNIQUES: TechniqueDef[] = [
  {
    id: 'basic_circulation',
    name: '基础吐纳诀',
    description: '最基础的修炼功法，打坐灵力恢复+20%',
    icon: '🌀',
    spiritCostPerSec: 0,
    effects: [{ type: 'meditation', multiplier: 1.2 }],
    requiredStage: 0,
  },
  {
    id: 'spirit_gathering_art',
    name: '聚灵诀',
    description: '专注于聚集灵气，打坐灵力恢复+50%',
    icon: '💫',
    spiritCostPerSec: 0,
    effects: [
      { type: 'meditation', multiplier: 1.5 },
    ],
    requiredStage: 0,
  },
  {
    id: 'five_elements_art',
    name: '五行归元诀',
    description: '融合五行灵气，所有生活技能效率+30%',
    icon: '☯️',
    spiritCostPerSec: 0,
    effects: [
      { type: 'fishing', multiplier: 1.3 },
      { type: 'farming', multiplier: 1.3 },
      { type: 'alchemy', multiplier: 1.3 },
    ],
    requiredStage: 1, // 筑基
  },
  {
    id: 'golden_core_art',
    name: '金丹真诀',
    description: '金丹期专属功法，打坐灵力恢复+100%',
    icon: '🌟',
    spiritCostPerSec: 0,
    effects: [
      { type: 'meditation', multiplier: 2.0 },
    ],
    requiredStage: 2, // 金丹
  },
  {
    id: 'nascent_soul_art',
    name: '元婴化形诀',
    description: '元婴期功法，打坐灵力恢复+80%，所有生活技能效率+80%',
    icon: '👁️',
    spiritCostPerSec: 0,
    effects: [
      { type: 'meditation', multiplier: 1.8 },
      { type: 'fishing', multiplier: 1.8 },
      { type: 'farming', multiplier: 1.8 },
      { type: 'alchemy', multiplier: 1.8 },
    ],
    requiredStage: 3, // 元婴
  },
  {
    id: 'god_transform_art',
    name: '化神天诀',
    description: '化神期功法，感知天地元气，打坐灵力恢复+150%',
    icon: '⚡',
    spiritCostPerSec: 0,
    effects: [
      { type: 'meditation', multiplier: 2.5 },
    ],
    requiredStage: 4, // 化神
  },
  {
    id: 'void_refining_art',
    name: '炼虚归元诀',
    description: '炼虚期功法，元神化虚，打坐灵力恢复+150%，所有生活技能效率+150%',
    icon: '🌌',
    spiritCostPerSec: 0,
    effects: [
      { type: 'meditation', multiplier: 2.5 },
      { type: 'fishing', multiplier: 2.5 },
      { type: 'farming', multiplier: 2.5 },
      { type: 'alchemy', multiplier: 2.5 },
    ],
    requiredStage: 5, // 炼虚
  },
  {
    id: 'mahayana_art',
    name: '大乘无极诀',
    description: '大乘期功法，三阳灌体，打坐灵力恢复+300%',
    icon: '☀️',
    spiritCostPerSec: 0,
    effects: [
      { type: 'meditation', multiplier: 4.0 },
    ],
    requiredStage: 7, // 大乘
  },
  {
    id: 'true_immortal_art',
    name: '真仙法则诀',
    description: '真仙境功法，领悟法则之力，打坐灵力恢复+300%，所有生活技能效率+300%',
    icon: '🌟',
    spiritCostPerSec: 0,
    effects: [
      { type: 'meditation', multiplier: 4.0 },
      { type: 'fishing', multiplier: 4.0 },
      { type: 'farming', multiplier: 4.0 },
      { type: 'alchemy', multiplier: 4.0 },
    ],
    requiredStage: 8, // 真仙
  },
];

export function getTechnique(id: string): TechniqueDef | undefined {
  return TECHNIQUES.find(t => t.id === id);
}

/** Get total multiplier for a given effect type from a technique */
export function getTechniqueMultiplier(techniqueId: string | null, type: TechniqueEffect['type']): number {
  if (!techniqueId) return 1;
  const technique = getTechnique(techniqueId);
  if (!technique) return 1;
  const effect = technique.effects.find(e => e.type === type);
  return effect ? effect.multiplier : 1;
}
