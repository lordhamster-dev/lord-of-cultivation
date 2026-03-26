# Copilot Instructions

## Project Overview

**Lord of Cultivation (修炼之主)** is a browser-based Chinese cultivation idle/incremental game built with React 19 + TypeScript + Zustand + TailwindCSS 4, bundled with Vite. Players progress through 13 cultivation stages across 3 realms via meditation, combat, dungeons, alchemy, fishing, and herbalism.

## Commands

```bash
npm run dev      # Dev server at http://localhost:5173/lord-of-cultivation/
npm run build    # tsc -b && vite build (TypeScript check then bundle)
npm run lint     # ESLint across all source files
npm run preview  # Preview production build locally
```

There is no test suite.

## Architecture

The app uses a strict three-layer separation:

```
UI (components/) → State (store/gameStore.ts) → Logic (core/systems/) + Data (core/data/)
```

- **`src/core/data/*.ts`** — Static game content (stages, items, enemies, recipes, etc.). Each file exports a `const PLURAL` array and `get*` lookup functions. No logic.
- **`src/core/systems/*.ts`** — Pure functions operating on plain objects. No store dependencies. Systems include `CultivationSystem`, `CombatSystem`, `DungeonSystem`, `EquipmentSystem`, `HerbSystem`, `FishingSystem`, `AlchemySystem`, etc.
- **`src/store/gameStore.ts`** — Single Zustand store with Immer middleware containing the full `GameState` and 100+ action methods. Imports all systems and orchestrates them.
- **`src/core/engine/`** — `GameLoop.ts` (rAF-based), `EventBus.ts` (pub/sub), `Ticker.ts` (delta time). The loop calls `gameStore.tick()` each frame.
- **`src/save/`** — `SaveManager.ts` (localStorage + JSON/Base64 export) and `Migration.ts` (v0→v7 migration chain). Current `SAVE_VERSION = 7`, localStorage key `lord_of_cultivation_save_v7`.

## State Management

Uses Zustand with Immer. State is mutated directly inside `set()` callbacks — no spreading required:

```typescript
set((state) => {
  state.cultivation.progress += delta;
  state.inventory.items['spirit_stone'] = (state.inventory.items['spirit_stone'] ?? 0) + 5;
});
```

Selectors at the bottom of `gameStore.ts` (e.g., `selectStage`, `selectSpiritStones`, `selectBreakthroughCost`) are the preferred way for components to derive computed values.

**Activity mutex**: Only one of `meditation | fishing | alchemy | combat | dungeon` can be active at a time (stored as `activeActivity: ActivityType`). Herb plot growth ticks regardless of active activity.

## Key Conventions

### Naming
- Item/area/recipe IDs: `snake_case` (e.g., `spirit_stone`, `fire_herb`, `lava_domain`)
- Function prefixes: `create*` (init state), `compute*` (derived values), `tick*` (per-frame updates), `get*` (data lookup), `start*` (begin activities in the store)
- State keys: descriptive plurals (`herbPlots`, `dailyQuests`)

### Adding New Content
1. Add type definitions to `src/core/types/index.ts`
2. Add static data to a file in `src/core/data/` (array + `get*` accessor)
3. Add business logic to a system in `src/core/systems/` (pure functions)
4. Wire into `gameStore.ts` — add state to `GameState`, add actions, call from `tick()` if time-based
5. If the new state needs to persist, bump `SAVE_VERSION` and add a migration step in `src/save/Migration.ts`

### Save Versioning
When adding new fields to `GameState`, always:
- Increment `SAVE_VERSION` in `src/core/types/index.ts`
- Update the localStorage key in `src/save/SaveManager.ts`
- Add a migration in `src/save/Migration.ts` (chain onto the previous highest version)

### Large Numbers
Cultivation EXP uses `Decimal` from `break_eternity.js`. The `exp` field in `ResourceState` is stored as a `string` (serialized Decimal). Always use `new Decimal(state.resources.exp)` before arithmetic.

### ESLint Gotcha
The `react-hooks/rules-of-hooks` lint rule triggers on any function whose name starts with `use`. If you need to name a store action `useItem`, use `consumeItem` instead.

### Equipment System
9-grid layout with slots: `necklace | helmet | amulet | glove_left | armor | glove_right | ring_left | boots | ring_right`. Enhancement goes +0 to +10.

### Cultivation Stages
13 stages across 3 realms (下境界/中境界/上境界): 炼气 has 13 sub-stages; all others have 4 (初期/中期/后期/大圆满). Each non-炼气 stage has a `breakPillId` that grants 50% cost reduction on breakthrough when consumed.
