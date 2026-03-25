import type { SkillState } from '../types';

export function getExpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(total / 4);
}

export function getLevelFromExp(exp: number): number {
  let level = 1;
  while (level < MAX_SKILL_LEVEL && getExpForLevel(level + 1) <= exp) {
    level++;
  }
  return level;
}

export function getExpForNextLevel(level: number): number {
  return getExpForLevel(level + 1);
}

export const MAX_SKILL_LEVEL = 99;

export function addSkillExp(skill: SkillState, expGain: number): SkillState {
  const newExp = skill.exp + expGain;
  const newLevel = Math.min(MAX_SKILL_LEVEL, getLevelFromExp(newExp));
  const maxExp = newLevel < MAX_SKILL_LEVEL ? getExpForNextLevel(newLevel) : getExpForLevel(MAX_SKILL_LEVEL);
  return { level: newLevel, exp: newExp, maxExp };
}

export function createInitialSkillState(): SkillState {
  return { level: 1, exp: 0, maxExp: getExpForNextLevel(1) };
}
