import type { GameState, AchievementState } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

/** Check all achievements and return updated state */
export function checkAchievements(
  achievements: AchievementState,
  state: GameState,
): { updated: AchievementState; newlyUnlocked: string[] } {
  const newUnlocked: string[] = [];
  const updated: AchievementState = {
    unlocked: { ...achievements.unlocked },
  };

  for (const ach of ACHIEVEMENTS) {
    if (updated.unlocked[ach.id]) continue;
    try {
      if (ach.condition(state)) {
        updated.unlocked[ach.id] = true;
        newUnlocked.push(ach.id);
      }
    } catch {
      // Ignore errors in achievement conditions
    }
  }

  return { updated, newlyUnlocked: newUnlocked };
}

export function createInitialAchievementState(): AchievementState {
  return { unlocked: {} };
}

export function getUnlockedCount(achievements: AchievementState): number {
  return Object.values(achievements.unlocked).filter(Boolean).length;
}

export function getTotalAchievements(): number {
  return ACHIEVEMENTS.filter(a => !a.isHidden).length;
}
