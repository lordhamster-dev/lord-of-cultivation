export interface TechniqueEffect {
  type: 'spiritStones' | 'exp' | 'fishing' | 'farming' | 'alchemy';
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
    description: '最基础的修炼功法，灵石产出+20%',
    icon: '🌀',
    spiritCostPerSec: 0.5,
    effects: [{ type: 'spiritStones', multiplier: 1.2 }],
    requiredStage: 0,
  },
  {
    id: 'spirit_gathering_art',
    name: '聚灵诀',
    description: '专注于聚集灵气，灵石产出+50%，修炼经验+20%',
    icon: '💫',
    spiritCostPerSec: 2,
    effects: [
      { type: 'spiritStones', multiplier: 1.5 },
      { type: 'exp', multiplier: 1.2 },
    ],
    requiredStage: 0,
  },
  {
    id: 'five_elements_art',
    name: '五行归元诀',
    description: '融合五行灵气，所有生活技能效率+30%',
    icon: '☯️',
    spiritCostPerSec: 5,
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
    description: '金丹期专属功法，灵石产出+100%，修炼经验+50%',
    icon: '🌟',
    spiritCostPerSec: 10,
    effects: [
      { type: 'spiritStones', multiplier: 2.0 },
      { type: 'exp', multiplier: 1.5 },
    ],
    requiredStage: 2, // 金丹
  },
  {
    id: 'nascent_soul_art',
    name: '元婴化形诀',
    description: '元婴期功法，一切产出+80%',
    icon: '👁️',
    spiritCostPerSec: 20,
    effects: [
      { type: 'spiritStones', multiplier: 1.8 },
      { type: 'exp', multiplier: 1.8 },
      { type: 'fishing', multiplier: 1.8 },
      { type: 'farming', multiplier: 1.8 },
      { type: 'alchemy', multiplier: 1.8 },
    ],
    requiredStage: 3, // 元婴
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
