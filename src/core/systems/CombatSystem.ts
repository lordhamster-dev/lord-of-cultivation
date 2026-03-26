import type { CombatState, CombatStats, Inventory, EquipmentState, ItemStack } from '../types';
import { getCombatArea } from '../data/enemies';
import type { EnemyDef, CombatAreaDef } from '../data/enemies';
import { getEquipmentTotalStats } from '../data/equipment';

/** Base stats by cultivation stage (13 stages) */
const BASE_STATS_BY_STAGE: CombatStats[] = [
  // 下境界
  { attack: 10, defense: 5, hp: 100, maxHp: 100 },       // 炼气
  { attack: 30, defense: 15, hp: 300, maxHp: 300 },       // 筑基
  { attack: 100, defense: 50, hp: 1000, maxHp: 1000 },    // 结丹
  { attack: 350, defense: 150, hp: 4000, maxHp: 4000 },   // 元婴
  { attack: 1000, defense: 500, hp: 15000, maxHp: 15000 }, // 化神
  // 中境界
  { attack: 3000, defense: 1500, hp: 50000, maxHp: 50000 },     // 炼虚
  { attack: 10000, defense: 5000, hp: 200000, maxHp: 200000 },  // 合体
  { attack: 35000, defense: 15000, hp: 800000, maxHp: 800000 }, // 大乘
  // 上境界
  { attack: 100000, defense: 50000, hp: 3000000, maxHp: 3000000 },      // 真仙
  { attack: 350000, defense: 150000, hp: 10000000, maxHp: 10000000 },   // 金仙
  { attack: 1000000, defense: 500000, hp: 40000000, maxHp: 40000000 },  // 太乙
  { attack: 3500000, defense: 1500000, hp: 150000000, maxHp: 150000000 }, // 大罗
  { attack: 10000000, defense: 5000000, hp: 500000000, maxHp: 500000000 }, // 道祖
];

/** Compute player combat stats from stage + equipment + combat skill */
export function getPlayerCombatStats(
  stageIndex: number,
  equipment: EquipmentState,
  combatLevel: number,
): CombatStats {
  const base = BASE_STATS_BY_STAGE[stageIndex] ?? BASE_STATS_BY_STAGE[0];
  let attack = base.attack;
  let defense = base.defense;
  let maxHp = base.maxHp;

  // Add equipment bonuses
  for (const instance of Object.values(equipment.equipped)) {
    if (!instance) continue;
    const stats = getEquipmentTotalStats(instance.defId, instance.level);
    attack += stats.attack ?? 0;
    defense += stats.defense ?? 0;
    maxHp += stats.hp ?? 0;
  }

  // Combat skill bonus: +1% attack and defense per level
  const skillBonus = 1 + combatLevel * 0.01;
  attack = Math.floor(attack * skillBonus);
  defense = Math.floor(defense * skillBonus);

  return { attack, defense, hp: maxHp, maxHp };
}

/** Calculate damage dealt */
function calculateDamage(attackerAttack: number, defenderDefense: number): number {
  const raw = Math.max(1, attackerAttack - defenderDefense * 0.5);
  // Add 10% variance
  const variance = 0.9 + Math.random() * 0.2;
  return Math.floor(raw * variance);
}

/** Roll an enemy from the area weighted by relative frequency */
function rollEnemy(area: CombatAreaDef): EnemyDef {
  const enemies = area.enemies;
  if (enemies.length === 1) return enemies[0];
  const idx = Math.floor(Math.random() * enemies.length);
  return enemies[idx];
}

/** Roll drops from a defeated enemy */
function rollDrops(enemy: EnemyDef): ItemStack[] {
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

export function createInitialCombatState(): CombatState {
  return {
    isActive: false,
    currentAreaId: null,
    currentEnemyId: null,
    enemyHp: 0,
    enemyMaxHp: 0,
    playerHp: 0,
    totalKills: 0,
    totalBossKills: 0,
    loot: [],
    lastCombatResult: 'none',
  };
}

export interface CombatTickResult {
  combat: CombatState;
  inventory: Inventory;
  expGain: number;
  spiritStonesGain: number;
  recentDrops: ItemStack[];
}

/** Main combat tick - called each game frame */
export function tickCombat(
  combat: CombatState,
  playerStats: CombatStats,
  inventory: Inventory,
  deltaMs: number,
  combatDurationMs: number,
): CombatTickResult {
  if (!combat.isActive || !combat.currentAreaId) {
    return { combat, inventory, expGain: 0, spiritStonesGain: 0, recentDrops: [] };
  }

  const area = getCombatArea(combat.currentAreaId);
  if (!area) {
    return { combat: { ...combat, isActive: false }, inventory, expGain: 0, spiritStonesGain: 0, recentDrops: [] };
  }

  let enemyHp = combat.enemyHp;
  let enemyMaxHp = combat.enemyMaxHp;
  let playerHp = combat.playerHp;
  let currentEnemyId = combat.currentEnemyId;

  // If no enemy spawned yet or previous enemy is dead, spawn a new one
  if (enemyHp <= 0 && playerHp > 0) {
    const enemy = rollEnemy(area);
    enemyHp = enemy.hp;
    enemyMaxHp = enemy.hp;
    currentEnemyId = enemy.id;
    playerHp = playerHp <= 0 ? playerStats.maxHp : playerHp;
  }

  if (playerHp <= 0) {
    return {
      combat: { ...combat, isActive: false, playerHp: 0, lastCombatResult: 'defeat' },
      inventory,
      expGain: 0,
      spiritStonesGain: 0,
      recentDrops: [],
    };
  }

  // Look up the current enemy by ID
  const currentEnemy = area.enemies.find(e => e.id === currentEnemyId) ?? area.enemies[0];

  // Simulate combat round based on time
  const roundProgress = Math.min(1, deltaMs / combatDurationMs);
  const playerDmg = calculateDamage(playerStats.attack, currentEnemy.defense) * roundProgress;
  const enemyDmg = calculateDamage(currentEnemy.attack, playerStats.defense) * roundProgress;

  enemyHp = Math.max(0, enemyHp - playerDmg);
  playerHp = Math.max(0, playerHp - enemyDmg);

  if (enemyHp <= 0) {
    // Enemy defeated
    const drops = rollDrops(currentEnemy);
    const newItems = { ...inventory.items };
    for (const drop of drops) {
      newItems[drop.itemId] = (newItems[drop.itemId] ?? 0) + drop.quantity;
    }

    return {
      combat: {
        ...combat,
        currentEnemyId: null,
        enemyHp: 0,
        enemyMaxHp: 0,
        playerHp: Math.min(playerStats.maxHp, playerHp + playerStats.maxHp * 0.1), // heal 10% on kill
        totalKills: combat.totalKills + 1,
        lastCombatResult: 'victory',
        loot: drops,
      },
      inventory: { ...inventory, items: newItems },
      expGain: currentEnemy.exp,
      spiritStonesGain: currentEnemy.spiritStones,
      recentDrops: drops,
    };
  }

  if (playerHp <= 0) {
    return {
      combat: { ...combat, enemyHp, playerHp: 0, isActive: false, lastCombatResult: 'defeat' },
      inventory,
      expGain: 0,
      spiritStonesGain: 0,
      recentDrops: [],
    };
  }

  return {
    combat: { ...combat, currentEnemyId, enemyHp, enemyMaxHp, playerHp },
    inventory,
    expGain: 0,
    spiritStonesGain: 0,
    recentDrops: [],
  };
}
