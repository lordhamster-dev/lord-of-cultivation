import Decimal from 'break_eternity.js';
export const SAVE_VERSION = 7;

// ─── Sub-stage definition ────────────────────────────────────────────────────
export interface SubStage {
  name: string;
  expRequired: number; // total cultivation progress (0-100) to fill this sub-stage
}

export type RealmTier = 'lower' | 'middle' | 'upper';

export interface CultivationStage {
  id: string;
  name: string;
  realm: RealmTier;
  realmName: string;        // 下境界 / 中境界 / 上境界
  multiplier: number;
  breakCost: number;
  breakPillId?: string;     // pill item ID that reduces breakthrough cost
  breakPillDiscount: number; // 0-1, e.g. 0.5 = 50% cost reduction when pill is used
  subStages: SubStage[];
}
export interface ResourceState { exp: string; spirit: number; spiritMax: number; spiritPerSec: number; }
export interface CultivationState { stageIndex: number; subStageIndex: number; progress: number; totalAscensions: number; activeTechniqueId: string | null; }

// ─── Activity types (only one active at a time, except herb growth) ─────────
export type ActivityType = 'meditation' | 'fishing' | 'alchemy' | 'combat' | 'dungeon' | null;

// ─── Meditation state ───────────────────────────────────────────────────────
export interface MeditationState {
  isActive: boolean;
}

export interface ItemStack {
  itemId: string;
  quantity: number;
}

export interface Inventory {
  items: Record<string, number>;
}

export type SkillId = 'farming' | 'fishing' | 'alchemy' | 'combat' | 'forging';

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
}

// ─── Combat types ─────────────────────────────────────────────────────────────
export interface CombatStats {
  attack: number;
  defense: number;
  hp: number;
  maxHp: number;
}

export interface CombatState {
  isActive: boolean;
  currentAreaId: string | null;
  currentEnemyId: string | null;
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  totalKills: number;
  totalBossKills: number;
  loot: { itemId: string; quantity: number }[];
  lastCombatResult: 'none' | 'victory' | 'defeat';
}

// ─── Dungeon types ────────────────────────────────────────────────────────────
export interface DungeonState {
  isActive: boolean;
  currentDungeonId: string | null;
  currentFloor: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  dailyRuns: Record<string, number>; // dungeonId -> runs today
  dailyDate: string; // YYYY-MM-DD
  totalDungeonClears: number;
}

// ─── Equipment types ──────────────────────────────────────────────────────────
export type EquipmentSlotId = 'necklace' | 'helmet' | 'amulet' | 'glove_left' | 'armor' | 'glove_right' | 'ring_left' | 'boots' | 'ring_right';

export interface EquipmentInstance {
  defId: string;
  level: number; // enhancement level 0-10
}

export interface EquipmentState {
  equipped: Partial<Record<EquipmentSlotId, EquipmentInstance>>;
  totalForged: number;
}

// ─── Combat supply types ──────────────────────────────────────────────────────
export interface CombatSupplyConfig {
  spiritItemId: string | null;    // item used for spirit recovery
  spiritItemCount: number;        // how many to bring
  spiritThreshold: number;        // auto-use when spirit% drops below this (0-100)
  hpItemId: string | null;        // item used for HP recovery
  hpItemCount: number;            // how many to bring
  hpThreshold: number;            // auto-use when HP% drops below this (0-100)
}

export interface CombatSupplyState {
  config: CombatSupplyConfig;
  spiritItemsUsed: number;        // items used this combat session
  hpItemsUsed: number;            // items used this combat session
}

// ─── Game stats for achievement/quest tracking ────────────────────────────────
export interface GameStats {
  totalHerbsHarvested: number;
  totalQuestsCompleted: number;
  totalMonstersKilled: number;
  totalBossesKilled: number;
  totalDungeonClears: number;
  totalEquipmentForged: number;
}

// ─── Extended GameState ───────────────────────────────────────────────────────
export interface GameState {
  resources: ResourceState;
  cultivation: CultivationState;
  activeActivity: ActivityType;
  meditation: MeditationState;
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
  combat: CombatState;
  dungeon: DungeonState;
  equipment: EquipmentState;
  combatSupply: CombatSupplyState;
}

export interface SettingsState { theme: 'dark' | 'light'; offlineCapHours: number; autoSaveInterval: number; showNotifications: boolean; }
export interface GameEventMap { 'tick': { deltaMs: number }; 'breakthrough': { newStageIndex: number; stageName: string }; 'save:completed': { timestamp: number }; }
export function newDecimal(value: number | string): Decimal { return new Decimal(value); }
export function decimalToString(d: Decimal): string { return d.toString(); }
