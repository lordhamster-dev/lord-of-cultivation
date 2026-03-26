# 修炼之主 — Lord of Cultivation

> 一款基于浏览器的修仙放置游戏 | A browser-based Chinese cultivation idle game

[![Deploy to GitHub Pages](https://github.com/lordhamster-dev/lord-of-cultivation/actions/workflows/deploy.yml/badge.svg)](https://github.com/lordhamster-dev/lord-of-cultivation/actions/workflows/deploy.yml)

🎮 **Play now**: [lordhamster-dev.github.io/lord-of-cultivation](https://lordhamster-dev.github.io/lord-of-cultivation/)

---

## ✨ 游戏简介

从一名普通的练气期修士开始，积累灵石与经验，购买升级，突破境界，最终成就化神大道。

境界路线：**练气 → 筑基 → 金丹 → 元婴 → 化神**（每大境界含9个子境界）

### 🌿 生活系统（v2.0 新增）

| 系统 | 内容 |
|------|------|
| **药草种植** | 种植灵草、火灵草、月华花、金莲子，解锁更多地块 |
| **钓鱼** | 在灵湖、火山温泉、九天瑶池垂钓，获取鱼类与种子 |
| **炼药** | 用药草炼制丹药，提升产出或降低突破费用 |
| **背包系统** | 管理药草、种子、鱼类、丹药等物品 |
| **技能系统** | 种植、钓鱼、炼药、战斗、炼器技能各有 1–99 级，技能越高效率越强 |

### 🏆 进阶系统（v3.0 新增）

| 系统 | 内容 |
|------|------|
| **成就系统** | 25+ 个成就，涵盖修炼、钓鱼、种植、炼丹等多维度，含隐藏成就 |
| **功法系统** | 修炼功法消耗灵力，提升灵石/经验/技能产出，随境界解锁更强功法 |
| **日常任务** | 每日3个任务（钓鱼/种植/炼丹），完成可获取灵石与物品奖励，次日刷新 |
| **子境界细化** | 每大境界分9个子境界（初期/中期/后期各3层），修炼至后期三层方可大突破 |

### ⚔️ 战斗与炼器系统（v4.0 新增）

| 系统 | 内容 |
|------|------|
| **战斗系统** | 选择区域自动战斗，4大区域（灵兽森林/妖洞/焰域/虚空裂隙），击杀掉落材料 |
| **副本系统** | 3个副本（灵兽洞窟/妖魔殿/龙渊秘境），多层推进+Boss战，每日次数限制 |
| **炼器系统** | 消耗材料锻造武器/防具/法器，装备可强化至+10，提升战斗属性和产出加成 |
| **战斗技能** | 战斗/炼器技能各 1-99 级，技能越高战斗越强、炼器越精 |

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [React 19](https://react.dev) | UI 框架 |
| [Vite](https://vite.dev) | 构建工具 |
| [TypeScript](https://typescriptlang.org) | 类型安全 |
| [TailwindCSS v4](https://tailwindcss.com) | 样式框架 |
| [Zustand](https://zustand-demo.pmnd.rs) + [Immer](https://immerjs.github.io/immer/) | 状态管理 |
| [break_eternity.js](https://github.com/Patashu/break_eternity.js) | 大数支持 |

---

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

开发服务器默认运行于 `http://localhost:5173/lord-of-cultivation/`

---

## 🌐 GitHub Pages 部署

本项目通过 GitHub Actions 自动部署到 GitHub Pages。

- 推送到 `main` 分支后，CI 自动触发构建
- 构建产物部署到 `gh-pages` 分支
- 访问地址：`https://lordhamster-dev.github.io/lord-of-cultivation/`

Vite 配置中已设置 `base: '/lord-of-cultivation/'`，确保资源路径正确。

---

## 💾 存档系统

存档数据保存在浏览器 `localStorage` 中，Key 为 `lord_of_cultivation_save_v4`（旧版 v1/v2/v3 存档自动迁移）。

| 功能 | 说明 |
|------|------|
| 自动存档 | 每 30 秒自动保存 |
| 手动存档 | 在「存档」面板手动触发 |
| JSON 导出 | 下载 `.json` 存档文件到本地 |
| JSON 导入 | 从本地 `.json` 文件恢复存档 |
| Base64 导出 | 将存档编码为字符串，可粘贴分享 |
| Base64 导入 | 从字符串恢复存档 |
| 离线收益 | 关闭页面后最多累积 12 小时的离线收益 |

---

## 🎮 游戏截图

> _截图即将更新..._

---

## 📁 项目结构

```
src/
├── core/
│   ├── engine/         # GameLoop, Ticker, EventBus
│   ├── systems/        # ResourceSystem, CultivationSystem, ProductionSystem
│   │                   # HerbSystem, FishingSystem, AlchemySystem, SkillSystem
│   │                   # AchievementSystem, QuestSystem
│   │                   # CombatSystem, DungeonSystem, EquipmentSystem
│   ├── data/           # stages.ts, upgrades.ts, herbs.ts, fish.ts, recipes.ts, items.ts
│   │                   # achievements.ts, techniques.ts, quests.ts
│   │                   # enemies.ts, dungeons.ts, equipment.ts
│   └── types/          # 全局类型定义
├── store/              # Zustand stores (gameStore, settingsStore)
├── save/               # SaveManager, Migration (支持v1/v2/v3/v4迁移)
├── hooks/              # useGameLoop, useOfflineProgress
└── components/
    ├── layout/         # Header, Sidebar, Footer
    ├── panels/         # CultivationPanel, ResourcePanel, UpgradePanel, SavePanel
    │                   # HerbPanel, FishingPanel, AlchemyPanel, InventoryPanel
    │                   # AchievementPanel, QuestPanel
    │                   # CombatPanel, DungeonPanel, EquipmentPanel
    └── ui/             # Button, ProgressBar, NumberDisplay, SkillBar, ItemSlot
```

---

## 📄 开源协议

MIT License
