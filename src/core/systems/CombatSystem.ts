import type { CombatState, CombatStats, Inventory, EquipmentState, ItemStack } from '../types';
import { getCombatArea } from '../data/enemies';
import type { EnemyDef, CombatAreaDef } from '../data/enemies';
import { getEquipmentTotalStats, getEquipment } from '../data/equipment';
import { STAGES } from '../data/stages';

/** Base stats by cultivation stage */
const BASE_STATS_BY_STAGE: CombatStats[] = [
  { attack: 10, defense: 5, hp: 100, maxHp: 100 },
  { attack: 30, defense: 15, hp: 300, maxHp: 300 },
  { attack: 100, defense: 50, hp: 1000, maxHp: 1000 },
  { attack: 350, defense: 150, hp: 4000, maxHp: 4000 },
  { attack: 1000, defense: 500, hp: 15000, maxHp: 15000 },
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

  // If no enemy spawned yet, spawn one
  let enemyHp = combat.enemyHp;
  let enemyMaxHp = combat.enemyMaxHp;
  let playerHp = combat.playerHp;

  if (enemyHp <= 0 && playerHp > 0) {
    // Spawn new enemy
    const enemy = rollEnemy(area);
    enemyHp = enemy.hp;
    enemyMaxHp = enemy.hp;
    playerHp = playerHp <= 0 ? playerStats.maxHp : playerHp;
  }

  if (playerHp <= 0) {
    // Player defeated - stop combat
    return {
      combat: { ...combat, isActive: false, playerHp: 0, lastCombatResult: 'defeat' },
      inventory,
      expGain: 0,
      spiritStonesGain: 0,
      recentDrops: [],
    };
  }

  // Simulate combat round based on time
  // Each round takes combatDurationMs, scale by deltaMs
  const roundProgress = deltaMs / combatDurationMs;
  if (roundProgress < 1) {
    // Not enough time for a full round yet - deal proportional damage
    // We use deterministic partial damage for smoother visuals
    const currentEnemy = area.enemies.find(e => e.hp === enemyMaxHp) ?? area.enemies[0];
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
      combat: { ...combat, enemyHp, enemyMaxHp, playerHp },
      inventory,
      expGain: 0,
      spiritStonesGain: 0,
      recentDrops: [],
    };
  }

  // Full round(s) completed
  const currentEnemy = area.enemies.find(e => e.hp === enemyMaxHp) ?? area.enemies[0];
  const playerDmg = calculateDamage(playerStats.attack, currentEnemy.defense);
  const enemyDmg = calculateDamage(currentEnemy.attack, playerStats.defense);

  enemyHp = Math.max(0, enemyHp - playerDmg);
  playerHp = Math.max(0, playerHp - enemyDmg);

  if (enemyHp <= 0) {
    const drops = rollDrops(currentEnemy);
    const newItems = { ...inventory.items };
    for (const drop of drops) {
      newItems[drop.itemId] = (newItems[drop.itemId] ?? 0) + drop.quantity;
    }

    return {
      combat: {
        ...combat,
        enemyHp: 0,
        enemyMaxHp: 0,
        playerHp: Math.min(playerStats.maxHp, playerHp + playerStats.maxHp * 0.1),
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
    combat: { ...combat, enemyHp, enemyMaxHp, playerHp },
    inventory,
    expGain: 0,
    spiritStonesGain: 0,
    recentDrops: [],
  };
}
