# 修炼之主 — Lord of Cultivation

> 一款基于浏览器的修仙放置游戏 | A browser-based Chinese cultivation idle game

[![Deploy to GitHub Pages](https://github.com/lordhamster-dev/lord-of-cultivation/actions/workflows/deploy.yml/badge.svg)](https://github.com/lordhamster-dev/lord-of-cultivation/actions/workflows/deploy.yml)

🎮 **Play now**: [lordhamster-dev.github.io/lord-of-cultivation](https://lordhamster-dev.github.io/lord-of-cultivation/)

---

## ✨ 游戏简介

从一名普通的炼气期修士开始，打坐修炼积累经验，炼草制丹、垂钓捕鱼、锻造装备、挑战副本，不断突破境界，最终成就道祖之位。

### 🧘 修炼系统

13 大境界横跨三界，炼气期拥有 13 层子境界，其余各境界分初期/中期/后期/大圆满四个阶段：

| 境界 | 阶段 |
|------|------|
| **下境界** | 炼气（13层）→ 筑基 → 结丹 → 元婴 → 化神 |
| **中境界** | 炼虚 → 合体 → 大乘 |
| **上境界** | 真仙 → 金仙 → 太乙 → 大罗 → 道祖 |

突破大境界需消耗灵石，持有对应**突破丹**可享受 50% 费用折扣。修炼**功法**（8种，随境界解锁）可大幅提升打坐效率与各系统产出。

### 🌿 生活系统

| 系统 | 内容 |
|------|------|
| **药草种植** | 4 种灵草（灵草/火灵草/月华花/金莲子），最多 8 块地，解锁需灵石与种植等级 |
| **钓鱼** | 3 处钓场（灵湖/火山温泉/九天瑶池），7 种鱼类，钓场随钓鱼等级解锁 |
| **炼药** | 16 种丹方，消耗药草炼制丹药，突破丹降低突破费用，补给丹可在战斗中自动使用 |
| **背包系统** | 37 种物品：种子、药草、鱼类、材料、丹药，可批量出售换取灵石 |
| **技能系统** | 种植/钓鱼/炼丹/战斗/炼器五大技能，各 1–99 级，等级越高效率越强 |

### 🏆 进阶系统

| 系统 | 内容 |
|------|------|
| **成就系统** | 41 个成就（含隐藏），涵盖修炼、战斗、钓鱼、种植、炼丹、炼器等多维度 |
| **日常任务** | 每日从 13 种任务中随机抽取 3 个（钓鱼/种植/炼丹），完成获取灵石与物品奖励 |

### ⚔️ 战斗与炼器系统

| 系统 | 内容 |
|------|------|
| **战斗系统** | 4 大区域（灵兽森林/妖洞/焰域/虚空裂隙），点击战斗按钮自动对战，击杀掉落材料与灵石 |
| **副本系统** | 3 个副本（灵兽洞窟/妖魔殿/龙渊秘境），多层推进 + Boss 战，每日挑战次数限制 |
| **战斗补给** | 可配置回血/回灵丹药及使用阈值，战斗中自动消耗 |
| **炼器系统** | 消耗战斗材料锻造装备，9 格装备栏（头盔/项链/护身符/左右手套/盔甲/左右戒指/靴子），18 件装备可强化至 +10 |

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev) | 19 | UI 框架 |
| [Vite](https://vite.dev) | 6 | 构建工具 |
| [TypeScript](https://typescriptlang.org) | ~5.7 | 类型安全 |
| [TailwindCSS](https://tailwindcss.com) | v4 | 样式框架 |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | 状态管理 |
| [Immer](https://immerjs.github.io/immer/) | 10 | 不可变状态更新 |
| [break_eternity.js](https://github.com/Patashu/break_eternity.js) | 2 | 大数支持（修炼经验） |

---

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:5173/lord-of-cultivation/）
npm run dev

# TypeScript 检查 + 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

---

## 🌐 GitHub Pages 部署

本项目通过 GitHub Actions 自动部署到 GitHub Pages。

- 推送到 `main` 分支后，CI 自动触发构建并部署到 `gh-pages` 分支
- 访问地址：`https://lordhamster-dev.github.io/lord-of-cultivation/`
- Vite 已配置 `base: '/lord-of-cultivation/'`，确保资源路径正确

---

## 💾 存档系统

存档保存在浏览器 `localStorage`，Key 为 `lord_of_cultivation_save_v7`，支持 v0→v7 全版本自动迁移。

| 功能 | 说明 |
|------|------|
| 自动存档 | 每 30 秒自动保存 |
| 手动存档 | 在「存档」面板手动触发 |
| JSON 导出/导入 | 下载/上传 `.json` 存档文件 |
| Base64 导出/导入 | 将存档编码为字符串，可粘贴分享 |
| 离线收益 | 关闭页面后最多累积 12 小时的离线收益 |

---

## 📁 项目结构

```
src/
├── core/
│   ├── engine/         # GameLoop (rAF), Ticker (delta time), EventBus (pub/sub)
│   ├── systems/        # 纯函数业务逻辑：
│   │                   #   CultivationSystem, ResourceSystem, SkillSystem
│   │                   #   HerbSystem, FishingSystem, AlchemySystem
│   │                   #   CombatSystem, DungeonSystem, EquipmentSystem
│   │                   #   AchievementSystem, QuestSystem, ProductionSystem
│   ├── data/           # 静态游戏内容（只含数据，无逻辑）：
│   │                   #   stages.ts      — 13 大境界定义
│   │                   #   items.ts       — 37 种物品
│   │                   #   herbs.ts       — 4 种药草
│   │                   #   fish.ts        — 7 种鱼 / 3 处钓场
│   │                   #   recipes.ts     — 16 种丹方
│   │                   #   enemies.ts     — 4 大战斗区域
│   │                   #   dungeons.ts    — 3 个副本
│   │                   #   equipment.ts   — 18 件装备 / 9 格槽位
│   │                   #   achievements.ts — 41 个成就
│   │                   #   quests.ts      — 13 种日常任务
│   │                   #   techniques.ts  — 8 种功法
│   └── types/          # 全局 TypeScript 类型定义（SAVE_VERSION = 7）
├── store/
│   └── gameStore.ts    # 单一 Zustand + Immer store，含全部 GameState 与 100+ 动作
├── save/
│   ├── SaveManager.ts  # localStorage 读写、JSON/Base64 导出导入
│   └── Migration.ts    # v0→v7 存档迁移链
├── hooks/              # useGameLoop, useOfflineProgress
└── components/
    ├── layout/         # Sidebar（10 标签）, Header, Footer
    ├── panels/         # 10 个功能面板：
    │                   #   CultivationPanel — 修炼/突破/功法
    │                   #   BattlePanel      — 战斗区域/副本/装备/补给/对战信息
    │                   #   ForgePanel       — 炼器锻造与强化
    │                   #   AlchemyPanel     — 炼丹
    │                   #   HerbPanel        — 药草种植
    │                   #   FishingPanel     — 钓鱼
    │                   #   InventoryPanel   — 背包
    │                   #   QuestPanel       — 日常任务
    │                   #   AchievementPanel — 成就
    │                   #   SavePanel        — 存档管理
    └── ui/             # Button, ProgressBar, SkillBar, ItemSlot, NumberDisplay
```

---

## 🎮 侧边栏导航

游戏共 10 个功能标签（桌面端侧栏，移动端底栏）：

背包 · 修炼 · 战斗 · 炼器 · 炼丹 · 种植 · 钓鱼 · 任务 · 成就 · 存档

---

## 📄 开源协议

MIT License
