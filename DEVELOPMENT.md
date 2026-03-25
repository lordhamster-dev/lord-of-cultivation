# 修炼之主 — 详细开发文档 v2.0

> 参考：Melvor Idle 设计理念 · 基于现有 React + Zustand + TypeScript 技术栈

---

## 一、现有系统问题分析

### 1.1 当前核心缺陷

| 问题 | 描述 | 影响 |
|------|------|------|
| **无初始灵石** | `DEFAULT_STATE.resources.spiritStones = '0'`，且所有升级（聚灵阵最低10灵石）都需要先有灵石才能购买，造成死锁 | 新玩家完全无法开始游戏 |
| **无基础被动收益** | `computeProductionRates` 中 `spiritStonesPerSec = gatheringLevel`，0级聚灵阵产出0，无任何基础产出 | 进度彻底停滞 |
| **修炼进度无法积累** | 经验产出为0，修炼进度永远不会满，无法突破境界 | 核心循环断裂 |
| **系统过于单薄** | 仅有升级、突破两个核心循环，缺乏多样性 | 玩家留存率低 |
| **升级效果耦合混乱** | `spirit_vein` 对0级`spirit_gathering`乘以倍数仍为0 | 游戏设计逻辑漏洞 |

### 1.2 立即修复方案（Phase 1）

**修复1：给予初始资源**（`gameStore.ts`）
```ts
const DEFAULT_STATE: GameState = {
  resources: {
    spiritStones: '50',   // 给50初始灵石，够买1级聚灵阵
    exp: '0',
    ...
  },
}
```

**修复2：添加基础产出**（`ProductionSystem.ts`）
```ts
let spiritStonesPerSec = 0.5 + gatheringLevel;  // 基础0.5/秒
let expPerSec = 0.2 + meditationLevel;           // 基础0.2/秒
```

**修复3：降低初始升级费用**（`upgrades.ts`）
```ts
{ id: 'spirit_gathering', baseCost: 10, costMultiplier: 1.4 }  // 降低倍率
{ id: 'meditation',       baseCost: 10, costMultiplier: 1.4 }
```

---

## 二、整体架构设计（v2.0）

### 2.1 系统模块全景图

```
┌─────────────────────────────────────────────────────────────────┐
│                        修炼之主 v2.0                             │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   修炼系统    │   生活系统    │  炼制系统    │    社交/成就系统    │
│  Cultivation │   Life       │  Crafting    │    Achievement     │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│ 境界突破      │ 药草种植      │ 炼药（丹药） │ 成就系统           │
│ 升级购买      │ 钓鱼         │ 炼器（法器） │ 日常任务           │
│ 功法修炼      │ 采矿         │ 符文制作     │ 里程碑奖励         │
│ 离线收益      │ 伐木         │ 烹饪         │ 统计数据           │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│              │   战斗系统（未来）           │                    │
│              │   Combat System             │                    │
│              ├──────────────┬──────────────┤                    │
│              │ 普通战斗      │ 副本系统     │                    │
│              │ 自动战斗      │ Boss战       │                    │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

### 2.2 技术架构调整建议

现有技术栈完全可以支撑扩展，仅需增加以下内容：

```
src/
├── core/
│   ├── engine/         # 现有：GameLoop, Ticker, EventBus（保持不变）
│   ├── systems/        # 扩展以下系统
│   │   ├── ResourceSystem.ts      # 现有（扩展资源类型）
│   │   ├── CultivationSystem.ts   # 现有（修复+扩展功法）
│   │   ├── ProductionSystem.ts    # 现有（修复基础产出）
│   │   ├── HerbSystem.ts          # 新增：药草种植
│   │   ├── FishingSystem.ts       # 新增：钓鱼
│   │   ├── AlchemySystem.ts       # 新增：炼药
│   │   ├── MiningSystem.ts        # 新增：采矿（可选）
│   │   ├── SkillSystem.ts         # 新增：技能/熟练度
│   │   └── AchievementSystem.ts   # 新增：成就
│   ├── data/
│   │   ├── stages.ts              # 现有（扩展境界）
│   │   ├── upgrades.ts            # 现有（重平衡）
│   │   ├── herbs.ts               # 新增：药草数据
│   │   ├── fish.ts                # 新增：鱼类数据
│   │   ├── recipes.ts             # 新增：炼药配方
│   │   └── achievements.ts        # 新增：成就定义
│   └── types/
│       └── index.ts               # 扩展：新增全局类型
├── store/
│   ├── gameStore.ts               # 现有（扩展新 action）
│   ├── settingsStore.ts           # 现有（保持不变）
│   ├── lifeStore.ts               # 新增：生活系统状态
│   └── skillStore.ts              # 新增：技能状态
├── save/
│   ├── SaveManager.ts             # 现有（扩展存档字段）
│   └── Migration.ts               # 扩展：添加 v2 迁移
├── hooks/
│   ├── useGameLoop.ts             # 现有
│   ├── useOfflineProgress.ts      # 现有
│   └── useSkillAction.ts          # 新增：技能操作 hook
└── components/
    ├── layout/                    # 现有（扩展导航）
    ├── panels/
    │   ├── CultivationPanel.tsx   # 现有（修复）
    │   ├── ResourcePanel.tsx      # 现有（扩展显示）
    │   ├── UpgradePanel.tsx       # 现有
    │   ├── SavePanel.tsx          # 现有
    │   ├── HerbPanel.tsx          # 新增
    │   ├── FishingPanel.tsx       # 新增
    │   ├── AlchemyPanel.tsx       # 新增
    │   └── AchievementPanel.tsx   # 新增
    └── ui/
        ├── Button.tsx             # 现有
        ├── ProgressBar.tsx        # 现有
        ├── NumberDisplay.tsx      # 现有
        ├── SkillBar.tsx           # 新增：技能经验条
        └── ItemSlot.tsx           # 新增：物品格子组件
```

---

## 三、扩展类型系统设计

### 3.1 资源类型扩展（`core/types/index.ts`）

```ts
// ─── 新增：物品系统 ───────────────────────────────────────────────
export interface ItemStack {
  itemId: string;
  quantity: number;
}

export interface Inventory {
  items: Record<string, number>;  // itemId -> quantity
  maxSlots: number;
}

// ─── 新增：技能系统 ───────────────────────────────────────────────
export type SkillId = 'herbalism' | 'fishing' | 'alchemy' | 'mining' | 'woodcutting';

export interface SkillState {
  level: number;       // 1-99（参考 Melvor Idle）
  exp: number;         // 当前经验
  maxExp: number;      // 升级所需经验
}

// ─── 新增：药草种植状态 ───────────────────────────────────────────
export interface HerbPlot {
  id: string;                    // 地块唯一ID
  herbId: string | null;         // 当前种植的药草ID
  plantedAt: number | null;      // 种植时间戳
  growthDurationMs: number;      // 生长周期（ms）
  isReady: boolean;              // 是否可收获
  isUnlocked: boolean;           // 是否解锁
}

// ─── 新增：钓鱼状态 ───────────────────────────────────────────────
export interface FishingState {
  isActive: boolean;
  currentAreaId: string | null;
  progressMs: number;
  totalFishCaught: number;
}

// ─── 新增：炼药状态 ───────────────────────────────────────────────
export interface AlchemyState {
  isActive: boolean;
  currentRecipeId: string | null;
  progressMs: number;
  totalPillsCrafted: number;
}

// ─── 扩展：GameState ──────────────────────────────────────────────
export interface GameState {
  resources: ResourceState;
  cultivation: CultivationState;
  upgrades: Record<string, number>;
  // 新增字段
  inventory: Inventory;
  skills: Record<SkillId, SkillState>;
  herbPlots: HerbPlot[];
  fishing: FishingState;
  alchemy: AlchemyState;
  // 现有字段
  lastSaveTime: number;
  lastTickTime: number;
  version: number;
}
```

---

## 四、生活系统详细设计

### 4.1 药草种植系统（参考 Melvor Idle 农场）

#### 核心机制
- 类似 Melvor Idle 的 **Farming 技能**
- 有限地块（初始4块，可解锁到最多12块）
- 选择药草种植 → 等待生长时间 → 手动/自动收获
- 种植消耗**种子**（种子来源：钓鱼副产品、商店购买、副本掉落）
- 收获产出**药草**（炼药主要原料）
- 种植失败概率随技能等级降低

#### 药草数据设计（`core/data/herbs.ts`）

```ts
export interface HerbDef {
  id: string;
  name: string;           // 灵草名称
  seedItemId: string;     // 对应种子ID
  growthDurationMs: number;  // 生长时间（ms）
  minYield: number;       // 最低产量
  maxYield: number;       // 最高产量
  farmingLevelRequired: number;  // 所需种植等级
  exp: number;            // 收获经验
  description: string;
}

export const HERBS: HerbDef[] = [
  {
    id: 'spirit_grass',
    name: '灵草',
    seedItemId: 'spirit_grass_seed',
    growthDurationMs: 60_000,       // 1分钟
    minYield: 3, maxYield: 8,
    farmingLevelRequired: 1,
    exp: 10,
    description: '最基础的灵草，炼制聚气丹的原料',
  },
  {
    id: 'fire_herb',
    name: '火灵草',
    seedItemId: 'fire_herb_seed',
    growthDurationMs: 5 * 60_000,   // 5分钟
    minYield: 2, maxYield: 5,
    farmingLevelRequired: 10,
    exp: 35,
    description: '蕴含火灵气，炼制培元丹的主料',
  },
  {
    id: 'moon_flower',
    name: '月华花',
    seedItemId: 'moon_flower_seed',
    growthDurationMs: 30 * 60_000,  // 30分钟
    minYield: 1, maxYield: 3,
    farmingLevelRequired: 30,
    exp: 120,
    description: '月夜盛开，炼制筑基丹必须材料',
  },
  {
    id: 'golden_lotus',
    name: '金莲子',
    seedItemId: 'golden_lotus_seed',
    growthDurationMs: 2 * 60 * 60_000, // 2小时
    minYield: 1, maxYield: 2,
    farmingLevelRequired: 60,
    exp: 500,
    description: '传说中的灵药，炼制金丹境突破丹的核心材料',
  },
];
```

#### HerbSystem 核心逻辑（`core/systems/HerbSystem.ts`）

```ts
// 关键函数签名
function plantHerb(plotId: string, herbId: string, inventory: Inventory): boolean
function harvestHerb(plotId: string, skillLevel: number): { items: ItemStack[]; exp: number } | null
function tickHerbGrowth(plots: HerbPlot[], deltaMs: number): HerbPlot[]
function getYield(herb: HerbDef, skillLevel: number): number  // 技能越高产量越多
function unlockNextPlot(plots: HerbPlot[], spiritStones: Decimal): boolean
```

#### 地块解锁费用

| 地块编号 | 解锁费用（灵石）| 所需种植等级 |
|----------|----------------|--------------|
| 1-4      | 免费（初始）   | 1            |
| 5        | 1,000          | 5            |
| 6        | 5,000          | 15           |
| 7        | 20,000         | 25           |
| 8        | 100,000        | 40           |
| 9-12     | 后续版本       | 50+          |

---

### 4.2 钓鱼系统（参考 Melvor Idle 钓鱼技能）

#### 核心机制
- 选择**钓鱼区域** → 自动钓鱼（持续进行）
- 钓到**鱼类**（主要道具来源）、**宝物**（稀有掉落）、**垃圾**（药草种子、矿石碎片）
- 钓鱼速度随技能等级提升
- 特定区域需要特定技能等级解锁
- 参考 Melvor：使用**特殊鱼竿**可增加稀有物品概率

#### 钓鱼区域数据（`core/data/fish.ts`）

```ts
export interface FishDef {
  id: string;
  name: string;
  weight: number;       // 出现权重（越高越常见）
  exp: number;          // 钓到经验
  minLevel: number;     // 最低钓鱼等级
}

export interface FishingAreaDef {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  baseDurationMs: number;    // 基础钓鱼时间（ms）
  fish: FishDef[];
  specialItems: {            // 特殊掉落（种子等）
    itemId: string;
    chance: number;          // 0-1
  }[];
}

export const FISHING_AREAS: FishingAreaDef[] = [
  {
    id: 'spirit_lake',
    name: '灵湖',
    description: '宗门旁的平静灵湖，适合初学者',
    requiredLevel: 1,
    baseDurationMs: 10_000,   // 10秒一次
    fish: [
      { id: 'carp', name: '灵鲤', weight: 60, exp: 5, minLevel: 1 },
      { id: 'spirit_fish', name: '灵鱼', weight: 30, exp: 15, minLevel: 5 },
      { id: 'jade_fish', name: '玉鱼', weight: 10, exp: 40, minLevel: 10 },
    ],
    specialItems: [
      { itemId: 'spirit_grass_seed', chance: 0.15 },
    ],
  },
  {
    id: 'volcano_lake',
    name: '火山温泉',
    description: '地底岩浆加热的温泉，有特殊鱼类',
    requiredLevel: 30,
    baseDurationMs: 15_000,
    fish: [
      { id: 'fire_carp', name: '赤炎鲤', weight: 50, exp: 80, minLevel: 30 },
      { id: 'lava_eel', name: '熔岩鳗', weight: 20, exp: 200, minLevel: 40 },
    ],
    specialItems: [
      { itemId: 'fire_herb_seed', chance: 0.1 },
      { itemId: 'fire_crystal', chance: 0.05 },
    ],
  },
  {
    id: 'sky_lake',
    name: '九天瑶池',
    description: '传说中的仙境湖泊',
    requiredLevel: 70,
    baseDurationMs: 20_000,
    fish: [
      { id: 'dragon_fish', name: '龙纹鱼', weight: 40, exp: 800, minLevel: 70 },
      { id: 'phoenix_carp', name: '凤尾鲤', weight: 10, exp: 3000, minLevel: 85 },
    ],
    specialItems: [
      { itemId: 'golden_lotus_seed', chance: 0.03 },
      { itemId: 'ancient_scroll', chance: 0.01 },
    ],
  },
];
```

#### 钓鱼时间公式

```
实际钓鱼时间 = baseDurationMs × (1 - skillBonus)
skillBonus = min(0.7, fishingLevel * 0.01)  // 最多减少70%时间
```

---

### 4.3 炼药系统（参考 Melvor Idle 炼金术）

#### 核心机制
- 消耗**药草**+**辅料** → 产出**丹药**
- 炼制需要时间（类似钓鱼，持续进行）
- 丹药效果：
  - **恢复型**：恢复修炼进度/灵石
  - **增益型**：临时提升灵石产出（持续效果，有时间限制）
  - **突破型**：降低突破消耗/提升突破成功率
- 炼制失败率随技能等级降低
- 高阶丹药需要特定境界才能炼制

#### 丹药配方数据（`core/data/recipes.ts`）

```ts
export interface AlchemyRecipeDef {
  id: string;
  name: string;
  description: string;
  ingredients: { itemId: string; quantity: number }[];
  outputItemId: string;
  outputQuantity: [number, number];  // [min, max]
  durationMs: number;                // 炼制时间
  alchemyLevelRequired: number;
  cultivationStageRequired: number;  // 0=练气起
  exp: number;
  failChance: number;                // 基础失败率
}

export const ALCHEMY_RECIPES: AlchemyRecipeDef[] = [
  {
    id: 'gathering_pill',
    name: '聚气丹',
    description: '服用后灵石产出+50%，持续5分钟',
    ingredients: [
      { itemId: 'spirit_grass', quantity: 3 },
    ],
    outputItemId: 'gathering_pill',
    outputQuantity: [1, 3],
    durationMs: 30_000,
    alchemyLevelRequired: 1,
    cultivationStageRequired: 0,
    exp: 20,
    failChance: 0.2,
  },
  {
    id: 'foundation_pill',
    name: '筑基丹',
    description: '降低筑基突破所需灵石50%',
    ingredients: [
      { itemId: 'moon_flower', quantity: 2 },
      { itemId: 'spirit_grass', quantity: 5 },
    ],
    outputItemId: 'foundation_pill',
    outputQuantity: [1, 2],
    durationMs: 5 * 60_000,
    alchemyLevelRequired: 20,
    cultivationStageRequired: 0,
    exp: 150,
    failChance: 0.4,
  },
  {
    id: 'golden_core_pill',
    name: '金丹',
    description: '降低金丹突破所需灵石60%',
    ingredients: [
      { itemId: 'golden_lotus', quantity: 1 },
      { itemId: 'moon_flower', quantity: 3 },
      { itemId: 'fire_herb', quantity: 5 },
    ],
    outputItemId: 'golden_core_pill',
    outputQuantity: [1, 1],
    durationMs: 30 * 60_000,
    alchemyLevelRequired: 50,
    cultivationStageRequired: 1,  // 需达筑基
    exp: 800,
    failChance: 0.5,
  },
];
```

#### 炼药系统核心逻辑

```
实际炼制时间 = baseDurationMs × (1 - alchemyBonus)
alchemyBonus = min(0.6, alchemyLevel * 0.01)

实际失败率 = max(0, failChance - alchemyLevel * 0.005)

产量 = random(min, max) × (1 + masteryBonus)  // mastery 参考 Melvor
```

---

### 4.4 技能熟练度系统（核心骨架）

参考 Melvor Idle 的技能 + Mastery 双轨设计：

```ts
// 技能等级：1-99，经验曲线参考 RuneScape
// exp[level] = floor((level-1 + 300 * 2^((level-1)/7)) / 4)
// 累积经验从 level 1 → 99 约需 13,034,431 经验

export function getLevelFromExp(exp: number): number {
  // 标准经验表查找
}

export function getExpForLevel(level: number): number {
  // 返回该等级所需累积经验
}

// 技能被动效果（每10级一个里程碑）
export const SKILL_MILESTONES: Record<SkillId, Record<number, string>> = {
  herbalism: {
    10: '药草产量+10%',
    20: '解锁更多地块',
    50: '收获时有5%概率双倍产出',
    99: '药草永不枯萎',
  },
  fishing: {
    10: '钓鱼速度+10%',
    30: '解锁火山温泉',
    70: '解锁九天瑶池',
    99: '特殊掉落概率翻倍',
  },
  alchemy: {
    10: '炼制失败率-5%',
    20: '炼制速度+10%',
    50: '可炼制两批（产量翻倍）',
    99: '炼制永不失败',
  },
};
```

---

## 五、修炼系统重设计

### 5.1 境界扩展

在现有5个境界基础上，增加子境界（小境界）：

```ts
// 每个大境界分为9个小境界（初期/中期/后期 各3个）
// 例：练气初期一层、练气初期二层、...、练气后期三层 → 共9层 → 突破到筑基

export interface CultivationStage {
  id: string;
  name: string;           // 大境界名
  subStages: SubStage[];  // 9个小境界
  breakCost: number;      // 大境界突破消耗（突破到下一大境界）
  multiplier: number;
}

export interface SubStage {
  name: string;    // 如"练气一层"
  expRequired: number;  // 到达下一小层所需经验
}
```

### 5.2 功法系统（新增）

新增**功法**概念，类似 Melvor Idle 的"Prayer"系统：

- 每个境界可**修炼不同功法**
- 每种功法给予不同增益（灵石、经验、钓鱼、炼药等加成）
- 功法消耗**灵力**（新资源），灵力随时间自然恢复

```ts
export interface TechniquesDef {
  id: string;
  name: string;            // 如"紫府元君诀"
  description: string;
  spiritCostPerSec: number;   // 每秒消耗灵力
  effects: TechniqueEffect[];
  requiredStage: number;      // 需要的大境界
  requiredScrollItemId?: string;  // 需要功法秘籍（物品）
}
```

---

## 六、存档系统升级

### 6.1 存档版本迁移（`save/Migration.ts`）

增加 v1→v2 迁移逻辑：

```ts
export function migrateV1toV2(state: any): GameState {
  return {
    ...state,
    version: 2,
    inventory: { items: {}, maxSlots: 50 },
    skills: {
      herbalism: { level: 1, exp: 0, maxExp: 83 },
      fishing:   { level: 1, exp: 0, maxExp: 83 },
      alchemy:   { level: 1, exp: 0, maxExp: 83 },
      mining:    { level: 1, exp: 0, maxExp: 83 },
      woodcutting: { level: 1, exp: 0, maxExp: 83 },
    },
    herbPlots: createInitialHerbPlots(4),
    fishing: { isActive: false, currentAreaId: null, progressMs: 0, totalFishCaught: 0 },
    alchemy: { isActive: false, currentRecipeId: null, progressMs: 0, totalPillsCrafted: 0 },
  };
}
```

### 6.2 存档 Key 更新

```ts
const SAVE_KEY = 'lord_of_cultivation_save_v2';  // 新版本用新Key，自动触发迁移
```

---

## 七、UI/UX 设计规范

### 7.1 导航结构

参考 Melvor Idle 左侧导航栏设计：

```
侧边栏菜单：
├── ⚡ 修炼     （现有 CultivationPanel）
├── 💰 资源     （现有 ResourcePanel）
├── ⬆️ 升级     （现有 UpgradePanel）
├── 🌿 药草种植  （新增 HerbPanel）
├── 🎣 钓鱼     （新增 FishingPanel）
├── ⚗️ 炼药     （新增 AlchemyPanel）
├── 🎒 背包     （新增 InventoryPanel）
├── 🏆 成就     （新增 AchievementPanel）
└── 💾 存档     （现有 SavePanel）
```

### 7.2 技能面板通用模板（参考 Melvor Idle）

每个技能面板标准布局：
1. **技能等级条**：当前等级 + 经验进度条 + 熟练度奖励节点
2. **操作区**：选择当前操作（如：选择钓鱼区域/选择药草/选择配方）
3. **开始/停止按钮**：技能操作的启停控制
4. **进度条**：当前操作进度
5. **最近掉落**：最近获得的物品列表（滚动日志）
6. **统计信息**：总计操作次数、最高记录等

### 7.3 背包系统

```
背包格子设计：
- 初始50格，可用灵石扩展到100格
- 物品分类筛选（药草/鱼类/丹药/材料/其他）
- 悬浮显示物品详情（名称、描述、数量、使用效果）
- 可直接从背包使用丹药（触发增益效果）
```

---

## 八、数值平衡设计

### 8.1 时间规划（参考 Melvor Idle 进度节奏）

| 阶段 | 目标内容 | 估计游戏时间 |
|------|----------|--------------|
| 新手（0-1h） | 购买聚灵阵、冥想，练气突破 | 30-60分钟 |
| 初级（1-5h） | 解锁钓鱼/种植，积累灵石，筑基 | 3-5小时 |
| 中级（5-20h） | 炼药提速，解锁更多地块，金丹 | 15小时 |
| 高级（20h+） | 高阶功法，元婴/化神，副本 | 持续游玩 |

### 8.2 修炼速度平衡

```
练气期：
  - 基础产出：0.5灵石/秒，0.2经验/秒
  - 聚灵阵Lv1后：1.5灵石/秒
  - 修炼进度：100%经验满 → 可突破
  - 突破费用：100灵石（需约3-5分钟基础积累）

筑基期：
  - 阶段倍率5×，约7.5灵石/秒（升级1级后）
  - 突破费用：1000灵石（约2-3分钟筑基期积累）
  - 参考聚气丹：获得效果使产出×1.5，加速进程

以此类推，每个境界的突破等待时间控制在5-20分钟（在线）
或2-8小时（离线）之间，保持合理的放置游戏节奏
```

---

## 九、成就系统

参考 Melvor Idle 成就设计：

```ts
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
  reward?: {
    type: 'spiritStones' | 'item' | 'skillExp';
    value: number | string;
  };
  isHidden?: boolean;  // 隐藏成就
}

// 示例成就
const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_stone', name: '第一块灵石', description: '首次获得灵石', ... },
  { id: 'breakthrough_1', name: '踏上修仙路', description: '完成第一次突破', ... },
  { id: 'master_angler', name: '垂钓大师', description: '总计钓鱼1000次', ... },
  { id: 'hidden_golden_lotus', name: '?????', description: '???', isHidden: true, ... },
];
```

---

## 十、未来系统规划（后续版本）

### 10.1 战斗系统（v3.0）

```
设计方向（参考 Melvor Idle Combat）：
- 自动战斗（放置式），选择敌人区域后自动进行
- 角色属性：攻击、防御、生命值（由境界+功法决定）
- 敌人掉落：材料、装备、功法秘籍
- 消耗：灵力/生命值，需要丹药恢复
- 装备系统：武器、法宝（提升属性，可炼器打造）
```

### 10.2 副本系统（v3.5）

```
设计方向：
- 多层地下城，每层有不同精英怪和Boss
- Boss战：特殊机制（需要特定丹药/功法）
- 副本奖励：高阶功法秘籍、稀有材料、限定成就
- 每日/每周次数限制（增加日活设计）
- 多人共享排行榜（对比进度）
```

### 10.3 炼器系统（v4.0）

```
- 消耗矿石（采矿获得）+ 特殊材料
- 产出：法器（提升修炼速度）、炉鼎（提升炼药速度）
- 法器强化系统（消耗灵石+材料提升品质）
```

---

## 十一、开发优先级排期

### Phase 1（紧急修复）✅
- [x] 修复初始灵石问题（给50初始灵石）
- [x] 修复基础产出（增加基础 0.5 灵石/秒，0.2 经验/秒）
- [x] 平衡初级升级费用（`costMultiplier` 1.5 → 1.4）

### Phase 2（生活系统核心）✅
- [x] 实现物品/背包系统（ItemStack, Inventory）
- [x] 实现技能系统骨架（SkillSystem, SkillBar组件）
- [x] 实现钓鱼系统（数据 + 系统 + 面板）
- [x] 实现药草种植系统（数据 + 系统 + 面板）
- [x] 实现炼药系统（数据 + 系统 + 面板）
- [x] 存档系统升级至v2（迁移脚本）

### Phase 3（内容丰富化）
- [ ] 成就系统
- [ ] 功法系统
- [ ] 日常任务系统
- [ ] 境界子境界细化

### Phase 4（战斗与副本）
- [ ] 战斗系统（自动战斗）
- [ ] 副本系统
- [ ] 炼器系统

---

## 十二、关键实现注意事项

1. **Tick 驱动所有系统**：新增的钓鱼、药草生长都应接入现有 `GameLoop` 的 `tick` 事件，通过 `EventBus` 分发，保持统一的时间管理

2. **大数安全**：灵石已使用 `break_eternity.js`，但技能经验值和物品数量目前不需要大数（99级最大经验约1300万），可直接用 `number`

3. **离线收益扩展**：`useOfflineProgress.ts` 需扩展，支持离线期间药草自动生长（但钓鱼/炼药不应有离线收益，与 Melvor Idle 一致）

4. **存档体积**：背包物品种类预计50+种，地块8个，存档大小可控，不超过50KB

5. **响应式设计**：参考现有 TailwindCSS 布局，面板切换保持现有 Sidebar 结构，移动端适配保持单栏布局
