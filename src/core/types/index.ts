import Decimal from 'break_eternity.js';
export const SAVE_VERSION = 3;

// ─── Sub-stage definition ────────────────────────────────────────────────────
export interface SubStage {
  name: string;
  expRequired: number; // total cultivation progress (0-100) to fill this sub-stage
}

export interface CultivationStage {
  id: string;
  name: string;
  multiplier: number;
  breakCost: number;
  subStages: SubStage[]; // 9 sub-stages per major stage
}
export interface UpgradeDef { id: string; name: string; description: string; baseCost: number; costMultiplier: number; effect: (level: number) => number; maxLevel?: number; }
export interface ResourceState { spiritStones: string; exp: string; spiritStonesPerSec: number; expPerSec: number; spirit: number; spiritMax: number; spiritPerSec: number; }
export interface CultivationState { stageIndex: number; subStageIndex: number; progress: number; totalAscensions: number; activeTechniqueId: string | null; }

export interface ItemStack {
  itemId: string;
  quantity: number;
}

export interface Inventory {
  items: Record<string, number>;
}

export type SkillId = 'farming' | 'fishing' | 'alchemy';

export interface SkillState {
  level: number;
  exp: number;
  maxExp: number;
}

export interface HerbPlot {
  id: string;
  herbId: string | null;
  plantedAt: number | null;
  growthDurationMs: number;
  isReady: boolean;
  isUnlocked: boolean;
}

export interface FishingState {
  isActive: boolean;
  currentAreaId: string | null;
  progressMs: number;
  totalFishCaught: number;
}

export interface AlchemyState {
  isActive: boolean;
  currentRecipeId: string | null;
  progressMs: number;
  totalPillsCrafted: number;
}

// ─── Achievement state ────────────────────────────────────────────────────────
export interface AchievementState {
  unlocked: Record<string, boolean>; // achievementId -> true if unlocked
}

// ─── Quest progress state ─────────────────────────────────────────────────────
export interface QuestProgress {
  questId: string;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyQuestState {
  date: string;               // YYYY-MM-DD
  quests: QuestProgress[];    // today's active quests
  dailySpiritStonesEarned: number; // for spiritStones quest tracking
  dailyUpgradesBought: number;     // for upgrade quest tracking
}

// ─── Game stats for achievement/quest tracking ────────────────────────────────
export interface GameStats {
  totalHerbsHarvested: number;
  totalQuestsCompleted: number;
}

// ─── Extended GameState ───────────────────────────────────────────────────────
export interface GameState {
  resources: ResourceState;
  cultivation: CultivationState;
  upgrades: Record<string, number>;
  lastSaveTime: number;
  lastTickTime: number;
  version: number;
  inventory: Inventory;
  skills: Record<SkillId, SkillState>;
  herbPlots: HerbPlot[];
  fishing: FishingState;
  alchemy: AlchemyState;
  gatheringPillEndTime: number;
  achievements: AchievementState;
  dailyQuests: DailyQuestState;
  stats: GameStats;
}

export interface SettingsState { theme: 'dark' | 'light'; offlineCapHours: number; autoSaveInterval: number; showNotifications: boolean; }
export interface GameEventMap { 'tick': { deltaMs: number }; 'breakthrough': { newStageIndex: number; stageName: string }; 'upgrade:purchased': { id: string; level: number }; 'save:completed': { timestamp: number }; 'offline:applied': { elapsedMs: number; spiritStones: string; exp: string }; }
export function newDecimal(value: number | string): Decimal { return new Decimal(value); }
export function decimalToString(d: Decimal): string { return d.toString(); }
