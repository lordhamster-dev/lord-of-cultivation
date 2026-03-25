import Decimal from 'break_eternity.js';
import type { ResourceState } from '../types';

/**
 * Calculate per-tick resource gains.
 * Returns the delta amounts to add.
 */
export function computeResourceGain(
  resources: ResourceState,
  deltaMs: number,
): { spiritStonesDelta: Decimal; expDelta: Decimal } {
  const seconds = deltaMs / 1000;
  const spiritStonesDelta = new Decimal(resources.spiritStonesPerSec).mul(seconds);
  const expDelta = new Decimal(resources.expPerSec).mul(seconds);
  return { spiritStonesDelta, expDelta };
}

/**
 * Apply a delta to resources, returning updated string values.
 */
export function applyResourceGain(
  resources: ResourceState,
  spiritStonesDelta: Decimal,
  expDelta: Decimal,
): { spiritStones: string; exp: string } {
  const newSpiritStones = new Decimal(resources.spiritStones).add(spiritStonesDelta);
  const newExp = new Decimal(resources.exp).add(expDelta);
  return {
    spiritStones: newSpiritStones.toString(),
    exp: newExp.toString(),
  };
}
