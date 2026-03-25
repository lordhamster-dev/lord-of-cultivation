# 修炼之主 — Lord of Cultivation

> 一款基于浏览器的修仙放置游戏 | A browser-based Chinese cultivation idle game

[![Deploy to GitHub Pages](https://github.com/lordhamster-dev/lord-of-cultivation/actions/workflows/deploy.yml/badge.svg)](https://github.com/lordhamster-dev/lord-of-cultivation/actions/workflows/deploy.yml)

🎮 **Play now**: [lordhamster-dev.github.io/lord-of-cultivation](https://lordhamster-dev.github.io/lord-of-cultivation/)

---

## ✨ 游戏简介

从一名普通的练气期修士开始，积累灵石与经验，购买升级，突破境界，最终成就化神大道。

境界路线：**练气 → 筑基 → 金丹 → 元婴 → 化神**

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

存档数据保存在浏览器 `localStorage` 中，Key 为 `lord_of_cultivation_save_v1`。

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
│   ├── data/           # stages.ts, upgrades.ts
│   └── types/          # 全局类型定义
├── store/              # Zustand stores (gameStore, settingsStore)
├── save/               # SaveManager, Migration
├── hooks/              # useGameLoop, useOfflineProgress
└── components/
    ├── layout/         # Header, Sidebar, Footer
    ├── panels/         # CultivationPanel, ResourcePanel, UpgradePanel, SavePanel
    └── ui/             # Button, ProgressBar, NumberDisplay
```

---

## 📄 开源协议

MIT License
