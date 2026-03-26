import type { GameState } from '../types';

export type AchievementCategory = 'cultivation' | 'fishing' | 'farming' | 'alchemy' | 'general' | 'combat' | 'equipment';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: (state: GameState) => boolean;
  reward?: {
    type: 'spiritStones' | 'item' | 'skillExp';
    value: number | string;
  };
  isHidden?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // General
  {
    id: 'first_stone',
    name: '灵石初现',
    description: '积累100枚灵石',
    icon: '💎',
    category: 'general',
    condition: (s) => {
      try { return parseFloat(s.resources.spiritStones) >= 100; } catch { return false; }
    },
  },
  {
    id: 'thousand_stones',
    name: '千石之财',
    description: '积累1,000枚灵石',
    icon: '💎',
    category: 'general',
    condition: (s) => {
      try { return parseFloat(s.resources.spiritStones) >= 1000; } catch { return false; }
    },
  },
  {
    id: 'million_stones',
    name: '灵石如山',
    description: '积累1,000,000枚灵石',
    icon: '💰',
    category: 'general',
    condition: (s) => {
      try { return parseFloat(s.resources.spiritStones) >= 1_000_000; } catch { return false; }
    },
    isHidden: true,
  },

  // Cultivation
  {
    id: 'first_breakthrough',
    name: '踏上修仙路',
    description: '完成第一次境界突破',
    icon: '⚡',
    category: 'cultivation',
    condition: (s) => s.cultivation.stageIndex >= 1,
  },
  {
    id: 'reach_foundation',
    name: '筑基成功',
    description: '突破至筑基期',
    icon: '🏯',
    category: 'cultivation',
    condition: (s) => s.cultivation.stageIndex >= 1,
  },
  {
    id: 'reach_core',
    name: '金丹圆满',
    description: '突破至金丹期',
    icon: '🌟',
    category: 'cultivation',
    condition: (s) => s.cultivation.stageIndex >= 2,
  },
  {
    id: 'reach_nascent',
    name: '元婴出世',
    description: '突破至元婴期',
    icon: '👶',
    category: 'cultivation',
    condition: (s) => s.cultivation.stageIndex >= 3,
  },
  {
    id: 'reach_god',
    name: '化神大成',
    description: '突破至化神期，成就大道',
    icon: '🌈',
    category: 'cultivation',
    condition: (s) => s.cultivation.stageIndex >= 4,
  },
  {
    id: 'use_technique',
    name: '功法初悟',
    description: '首次修炼功法',
    icon: '📜',
    category: 'cultivation',
    condition: (s) => s.cultivation.activeTechniqueId !== null,
  },

  // Fishing
  {
    id: 'first_fish',
    name: '垂钓新手',
    description: '钓到第一条鱼',
    icon: '🐟',
    category: 'fishing',
    condition: (s) => s.fishing.totalFishCaught >= 1,
  },
  {
    id: 'fish_100',
    name: '溪边常客',
    description: '共钓到100条鱼',
    icon: '🎣',
    category: 'fishing',
    condition: (s) => s.fishing.totalFishCaught >= 100,
  },
  {
    id: 'fish_1000',
    name: '垂钓大师',
    description: '共钓到1,000条鱼',
    icon: '🏆',
    category: 'fishing',
    condition: (s) => s.fishing.totalFishCaught >= 1000,
    isHidden: true,
  },
  {
    id: 'fishing_lv30',
    name: '火山探险',
    description: '钓鱼等级达到30，解锁火山温泉',
    icon: '🌋',
    category: 'fishing',
    condition: (s) => s.skills.fishing.level >= 30,
  },
  {
    id: 'fishing_lv70',
    name: '九天揽月',
    description: '钓鱼等级达到70，解锁九天瑶池',
    icon: '🌙',
    category: 'fishing',
    condition: (s) => s.skills.fishing.level >= 70,
    isHidden: true,
  },

  // Farming
  {
    id: 'first_herb',
    name: '草药入门',
    description: '首次收获药草',
    icon: '🌿',
    category: 'farming',
    condition: (s) => s.stats.totalHerbsHarvested >= 1,
  },
  {
    id: 'herb_100',
    name: '草药达人',
    description: '共收获100棵药草',
    icon: '🌱',
    category: 'farming',
    condition: (s) => s.stats.totalHerbsHarvested >= 100,
  },
  {
    id: 'herb_1000',
    name: '药圃大师',
    description: '共收获1,000棵药草',
    icon: '🌾',
    category: 'farming',
    condition: (s) => s.stats.totalHerbsHarvested >= 1000,
    isHidden: true,
  },
  {
    id: 'unlock_plot_5',
    name: '扩建药圃',
    description: '解锁第5块药草地',
    icon: '🏡',
    category: 'farming',
    condition: (s) => s.herbPlots.filter(p => p.isUnlocked).length >= 5,
  },

  // Alchemy
  {
    id: 'first_pill',
    name: '炼丹入门',
    description: '炼制第一颗丹药',
    icon: '💊',
    category: 'alchemy',
    condition: (s) => s.alchemy.totalPillsCrafted >= 1,
  },
  {
    id: 'pill_50',
    name: '炼丹小成',
    description: '共炼制50颗丹药',
    icon: '⚗️',
    category: 'alchemy',
    condition: (s) => s.alchemy.totalPillsCrafted >= 50,
  },
  {
    id: 'pill_500',
    name: '丹道大师',
    description: '共炼制500颗丹药',
    icon: '🏆',
    category: 'alchemy',
    condition: (s) => s.alchemy.totalPillsCrafted >= 500,
    isHidden: true,
  },
  {
    id: 'craft_foundation_pill',
    name: '筑基有望',
    description: '炼制筑基丹',
    icon: '🏯',
    category: 'alchemy',
    condition: (s) => (s.inventory.items['foundation_pill'] ?? 0) > 0,
  },

  // Hidden
  {
    id: 'all_skills_10',
    name: '十八般武艺',
    description: '所有技能达到10级',
    icon: '✨',
    category: 'general',
    condition: (s) => Object.values(s.skills).every(sk => sk.level >= 10),
    isHidden: true,
  },
  {
    id: 'daily_quest_complete',
    name: '日常修仙',
    description: '完成一次日常任务',
    icon: '📋',
    category: 'general',
    condition: (s) => s.stats.totalQuestsCompleted >= 1,
  },
  {
    id: 'daily_quest_10',
    name: '勤修不怠',
    description: '共完成10次日常任务',
    icon: '📋',
    category: 'general',
    condition: (s) => s.stats.totalQuestsCompleted >= 10,
  },

  // Combat
  {
    id: 'first_kill',
    name: '初战告捷',
    description: '击杀第一只怪物',
    icon: '⚔️',
    category: 'combat',
    condition: (s) => s.stats.totalMonstersKilled >= 1,
  },
  {
    id: 'kill_100',
    name: '百战百胜',
    description: '击杀100只怪物',
    icon: '⚔️',
    category: 'combat',
    condition: (s) => s.stats.totalMonstersKilled >= 100,
  },
  {
    id: 'kill_1000',
    name: '杀伐果断',
    description: '击杀1000只怪物',
    icon: '💀',
    category: 'combat',
    condition: (s) => s.stats.totalMonstersKilled >= 1000,
    isHidden: true,
  },
  {
    id: 'first_boss',
    name: '斩妖除魔',
    description: '击杀第一个Boss',
    icon: '👹',
    category: 'combat',
    condition: (s) => s.stats.totalBossesKilled >= 1,
  },
  {
    id: 'first_dungeon',
    name: '副本探索者',
    description: '通关第一个副本',
    icon: '🏔️',
    category: 'combat',
    condition: (s) => s.stats.totalDungeonClears >= 1,
  },
  {
    id: 'dungeon_10',
    name: '副本征服者',
    description: '通关10个副本',
    icon: '🏆',
    category: 'combat',
    condition: (s) => s.stats.totalDungeonClears >= 10,
    isHidden: true,
  },

  // Equipment
  {
    id: 'first_forge',
    name: '初涉炼器',
    description: '炼制第一件装备',
    icon: '🔨',
    category: 'equipment',
    condition: (s) => s.stats.totalEquipmentForged >= 1,
  },
  {
    id: 'forge_10',
    name: '炼器大师',
    description: '炼制10件装备',
    icon: '🔨',
    category: 'equipment',
    condition: (s) => s.stats.totalEquipmentForged >= 10,
  },
  {
    id: 'combat_lv10',
    name: '战斗初成',
    description: '战斗技能达到10级',
    icon: '⚔️',
    category: 'combat',
    condition: (s) => s.skills.combat.level >= 10,
  },
  {
    id: 'forging_lv10',
    name: '炼器小成',
    description: '炼器技能达到10级',
    icon: '🔨',
    category: 'equipment',
    condition: (s) => s.skills.forging.level >= 10,
  },
];

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
