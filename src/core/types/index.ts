import Decimal from 'break_eternity.js';

// ─── Save Version ───────────────────────────────────────────────────────────
export const SAVE_VERSION = 1;

// ─── Cultivation Stage ───────────────────────────────────────────────────────
export interface CultivationStage {
  id: string;
  name: string;
  multiplier: number;
  breakCost: number;
}

// ─── Upgrade Definition ──────────────────────────────────────────────────────
export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: (level: number) => number;
  maxLevel?: number;
}

// ─── Resource State ──────────────────────────────────────────────────────────
export interface ResourceState {
  spiritStones: string;       // Decimal serialized
  exp: string;                // Decimal serialized
  spiritStonesPerSec: number;
  expPerSec: number;
}

// ─── Cultivation State ───────────────────────────────────────────────────────
export interface CultivationState {
  stageIndex: number;         // index into STAGES array
  progress: number;           // 0–100
  totalAscensions: number;
}

// ─── Game State ──────────────────────────────────────────────────────────────
export interface GameState {
  resources: ResourceState;
  cultivation: CultivationState;
  upgrades: Record<string, number>;  // upgradeId -> level
  lastSaveTime: number;
  lastTickTime: number;
  version: number;
}

// ─── Settings ────────────────────────────────────────────────────────────────
export interface SettingsState {
  theme: 'dark' | 'light';
  offlineCapHours: number;
  autoSaveInterval: number;   // milliseconds
  showNotifications: boolean;
}

// ─── Event Map ───────────────────────────────────────────────────────────────
export interface GameEventMap {
  'tick': { deltaMs: number };
  'breakthrough': { newStageIndex: number; stageName: string };
  'upgrade:purchased': { id: string; level: number };
  'save:completed': { timestamp: number };
  'offline:applied': { elapsedMs: number; spiritStones: string; exp: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function newDecimal(value: number | string): Decimal {
  return new Decimal(value);
}

export function decimalToString(d: Decimal): string {
  return d.toString();
}
