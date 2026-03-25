import { useGameStore } from '../../store/gameStore';
import { ACHIEVEMENTS } from '../../core/data/achievements';
import { getUnlockedCount, getTotalAchievements } from '../../core/systems/AchievementSystem';
import type { AchievementCategory } from '../../core/data/achievements';
import { useState } from 'react';

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  cultivation: '修炼',
  fishing: '钓鱼',
  farming: '种植',
  alchemy: '炼丹',
  general: '综合',
};

export function AchievementPanel() {
  const achievements = useGameStore(s => s.achievements);
  const [filter, setFilter] = useState<AchievementCategory | 'all'>('all');

  const unlocked = getUnlockedCount(achievements);
  const total = getTotalAchievements();

  const visible = ACHIEVEMENTS.filter(a => {
    if (a.isHidden && !achievements.unlocked[a.id]) return false;
    if (filter !== 'all' && a.category !== filter) return false;
    return true;
  });

  const categories: (AchievementCategory | 'all')[] = ['all', 'cultivation', 'fishing', 'farming', 'alchemy', 'general'];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-amber-400">🏆 成就</h2>

      {/* Progress */}
      <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
        <span className="text-slate-300 text-sm">已解锁成就</span>
        <span className="text-amber-400 font-bold">{unlocked} / {total}</span>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              filter === cat
                ? 'bg-amber-500 text-slate-900 font-semibold'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Achievement list */}
      <div className="space-y-2">
        {visible.map(ach => {
          const isUnlocked = !!achievements.unlocked[ach.id];
          return (
            <div
              key={ach.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isUnlocked
                  ? 'bg-amber-900/20 border-amber-700/50'
                  : 'bg-slate-800 border-slate-700 opacity-60'
              }`}
            >
              <div className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-40'}`}>
                {ach.icon}
              </div>
              <div className="flex-1">
                <div className={`font-medium text-sm ${isUnlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                  {ach.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{ach.description}</div>
              </div>
              {isUnlocked && (
                <div className="text-green-400 text-xs font-bold">✓ 已解锁</div>
              )}
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-8">该分类暂无成就</div>
        )}
      </div>
    </div>
  );
}
