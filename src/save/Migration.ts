import type { GameState } from '../core/types';
import { SAVE_VERSION } from '../core/types';

/** Migrate a raw parsed save object to the current version. */
export function migrate(raw: Partial<GameState>): GameState {
  let data = raw;

  // Version 0 → 1 (initial version, nothing to migrate)
  if (!data.version || data.version < 1) {
    data = {
      ...data,
      version: 1,
    };
  }

  // Future migrations go here:
  // if (data.version < 2) { ... data.version = 2; }

  return data as GameState;
}

export { SAVE_VERSION };
