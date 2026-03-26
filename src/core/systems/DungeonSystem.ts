import type { DungeonState, CombatStats, Inventory, ItemStack } from '../types';
import { getDungeon } from '../data/dungeons';
import type { DungeonEnemyDef } from '../data/dungeons';

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialDungeonState(): DungeonState {
  return {
    isActive: false,
    currentDungeonId: null,
    currentFloor: 0,
    enemyHp: 0,
    enemyMaxHp: 0,
    playerHp: 0,
    dailyRuns: {},
    dailyDate: getTodayString(),
    totalDungeonClears: 0,
  };
}

/** Refresh daily dungeon runs if a new day */
export function refreshDungeonDaily(state: DungeonState): DungeonState {
  const today = getTodayString();
  if (state.dailyDate !== today) {
    return { ...state, dailyRuns: {}, dailyDate: today };
  }
  return state;
}

/** Check if player can enter a dungeon */
export function canEnterDungeon(
  state: DungeonState,
  dungeonId: string,
  stageIndex: number,
): boolean {
  const dungeon = getDungeon(dungeonId);
  if (!dungeon) return false;
  if (stageIndex < dungeon.requiredStage) return false;
  if (state.isActive) return false;
  const runs = state.dailyRuns[dungeonId] ?? 0;
  if (runs >= dungeon.maxDailyRuns) return false;
  return true;
}

/** Start a dungeon run */
export function startDungeon(
  state: DungeonState,
  dungeonId: string,
  playerMaxHp: number,
): DungeonState {
  const dungeon = getDungeon(dungeonId);
  if (!dungeon) return state;

  // Spawn first enemy on floor 1
  const floor = dungeon.floors[0];
  const enemy = floor.boss ?? floor.enemies[0];
  if (!enemy) return state;

  return {
    ...state,
    isActive: true,
    currentDungeonId: dungeonId,
    currentFloor: 1,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.hp,
    playerHp: playerMaxHp,
    dailyRuns: {
      ...state.dailyRuns,
      [dungeonId]: (state.dailyRuns[dungeonId] ?? 0) + 1,
    },
  };
}

function calculateDamage(attackerAttack: number, defenderDefense: number): number {
  const raw = Math.max(1, attackerAttack - defenderDefense * 0.5);
  const variance = 0.9 + Math.random() * 0.2;
  return Math.floor(raw * variance);
}

function rollDrops(enemy: DungeonEnemyDef): ItemStack[] {
  const drops: ItemStack[] = [];
  for (const drop of enemy.drops) {
    if (Math.random() < drop.chance) {
      const qty = drop.quantity[0] + Math.floor(Math.random() * (drop.quantity[1] - drop.quantity[0] + 1));
      if (qty > 0) {
        drops.push({ itemId: drop.itemId, quantity: qty });
      }
    }
  }
  return drops;
}

export interface DungeonTickResult {
  dungeon: DungeonState;
  inventory: Inventory;
  expGain: number;
  spiritStonesGain: number;
  recentDrops: ItemStack[];
  floorCleared: boolean;
  dungeonCompleted: boolean;
  bossDefeated: boolean;
}

/** Tick dungeon combat */
export function tickDungeon(
  dungeon: DungeonState,
  playerStats: CombatStats,
  inventory: Inventory,
  deltaMs: number,
): DungeonTickResult {
  const noResult: DungeonTickResult = {
    dungeon,
    inventory,
    expGain: 0,
    spiritStonesGain: 0,
    recentDrops: [],
    floorCleared: false,
    dungeonCompleted: false,
    bossDefeated: false,
  };

  if (!dungeon.isActive || !dungeon.currentDungeonId) return noResult;

  const dungeonDef = getDungeon(dungeon.currentDungeonId);
  if (!dungeonDef) return { ...noResult, dungeon: { ...dungeon, isActive: false } };

  const floorIndex = dungeon.currentFloor - 1;
  const floor = dungeonDef.floors[floorIndex];
  if (!floor) return { ...noResult, dungeon: { ...dungeon, isActive: false } };

  // Get current enemy
  const currentEnemy = floor.boss ?? floor.enemies[0];
  if (!currentEnemy) return { ...noResult, dungeon: { ...dungeon, isActive: false } };

  // Combat round (6 second duration for dungeons)
  const combatDurationMs = 4_000;
  const roundProgress = deltaMs / combatDurationMs;

  let enemyHp = dungeon.enemyHp;
  let playerHp = dungeon.playerHp;

  const playerDmg = calculateDamage(playerStats.attack, currentEnemy.defense) * Math.min(1, roundProgress);
  const enemyDmg = calculateDamage(currentEnemy.attack, playerStats.defense) * Math.min(1, roundProgress);

  enemyHp = Math.max(0, enemyHp - playerDmg);
  playerHp = Math.max(0, playerHp - enemyDmg);

  // Player defeated
  if (playerHp <= 0) {
    return {
      ...noResult,
      dungeon: { ...dungeon, isActive: false, playerHp: 0 },
    };
  }

  // Enemy still alive
  if (enemyHp > 0) {
    return {
      ...noResult,
      dungeon: { ...dungeon, enemyHp, playerHp },
    };
  }

  // Enemy defeated!
  const drops = rollDrops(currentEnemy);
  const newItems = { ...inventory.items };
  for (const drop of drops) {
    newItems[drop.itemId] = (newItems[drop.itemId] ?? 0) + drop.quantity;
  }

  const isBoss = currentEnemy.isBoss === true;
  const isLastFloor = dungeon.currentFloor >= dungeonDef.floors.length;

  if (isLastFloor) {
    // Dungeon completed!
    return {
      dungeon: {
        ...dungeon,
        isActive: false,
        enemyHp: 0,
        playerHp,
        totalDungeonClears: dungeon.totalDungeonClears + 1,
      },
      inventory: { ...inventory, items: newItems },
      expGain: currentEnemy.exp,
      spiritStonesGain: currentEnemy.spiritStones,
      recentDrops: drops,
      floorCleared: true,
      dungeonCompleted: true,
      bossDefeated: isBoss,
    };
  }

  // Move to next floor
  const nextFloorIndex = dungeon.currentFloor; // 0-based next floor
  const nextFloor = dungeonDef.floors[nextFloorIndex];
  const nextEnemy = nextFloor ? (nextFloor.boss ?? nextFloor.enemies[0]) : null;

  return {
    dungeon: {
      ...dungeon,
      currentFloor: dungeon.currentFloor + 1,
      enemyHp: nextEnemy?.hp ?? 0,
      enemyMaxHp: nextEnemy?.hp ?? 0,
      playerHp: Math.min(playerStats.maxHp, playerHp + playerStats.maxHp * 0.05), // heal 5% between floors
    },
    inventory: { ...inventory, items: newItems },
    expGain: currentEnemy.exp,
    spiritStonesGain: currentEnemy.spiritStones,
    recentDrops: drops,
    floorCleared: true,
    dungeonCompleted: false,
    bossDefeated: isBoss,
  };
}
