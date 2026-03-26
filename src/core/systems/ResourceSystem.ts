import Decimal from 'break_eternity.js';
import type { Inventory } from '../types';

/**
 * Get the number of spirit stones the player has (from inventory).
 */
export function getSpiritStoneCount(inventory: Inventory): number {
  return inventory.items['spirit_stone'] ?? 0;
}

/**
 * Add spirit stones to inventory.
 */
export function addSpiritStones(inventory: Inventory, amount: number): Inventory {
  const newItems = { ...inventory.items };
  newItems['spirit_stone'] = (newItems['spirit_stone'] ?? 0) + amount;
  return { ...inventory, items: newItems };
}

/**
 * Deduct spirit stones from inventory. Returns null if insufficient.
 */
export function deductSpiritStones(inventory: Inventory, amount: number): Inventory | null {
  const current = inventory.items['spirit_stone'] ?? 0;
  if (current < amount) return null;
  const newItems = { ...inventory.items };
  newItems['spirit_stone'] = current - amount;
  return { ...inventory, items: newItems };
}

/**
 * Apply exp gain (still uses Decimal for large numbers).
 */
export function applyExpGain(
  currentExp: string,
  expDelta: number,
): string {
  return new Decimal(currentExp).add(expDelta).toString();
}
