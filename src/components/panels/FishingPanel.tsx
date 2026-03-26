import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ProgressBar } from '../ui/ProgressBar';
import { SkillBar } from '../ui/SkillBar';
import { Button } from '../ui/Button';
import { FISHING_AREAS } from '../../core/data/fish';
import { getFishingDuration } from '../../core/systems/FishingSystem';
import { getItem } from '../../core/data/items';

export function FishingPanel() {
  const fishing = useGameStore(s => s.fishing);
  const skills = useGameStore(s => s.skills);
  const activeActivity = useGameStore(s => s.activeActivity);
  const startFishing = useGameStore(s => s.startFishing);
  const stopFishing = useGameStore(s => s.stopFishing);
  const fishingLevel = skills.fishing.level;

  const [selectedArea, setSelectedArea] = useState('');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 500);
    return () => clearInterval(id);
  }, []);

  const activeArea = fishing.currentAreaId
    ? FISHING_AREAS.find(a => a.id === fishing.currentAreaId)
    : null;

  const duration = activeArea ? getFishingDuration(activeArea, fishingLevel) : 0;
  const progress = duration > 0 ? Math.min(100, (fishing.progressMs / duration) * 100) : 0;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-amber-400">🎣 垂钓</h2>

      <div className="bg-slate-800 rounded-lg p-3">
        <SkillBar skillName="钓鱼" skill={skills.fishing} icon="🎣" />
      </div>

      {fishing.isActive && activeArea ? (
        <div className="space-y-3">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-amber-300 font-medium">🎣 {activeArea.name} 钓鱼中...</span>
              <span className="text-xs text-slate-400">总计 {fishing.totalFishCaught} 条</span>
            </div>
            <ProgressBar value={progress} color="bg-blue-500" label={`${Math.floor(progress)}%`} />
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-2">可能钓到:</div>
            <div className="flex flex-wrap gap-1">
              {activeArea.fish.filter(f => f.minLevel <= fishingLevel).map(f => (
                <span key={f.id} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                  {f.name}
                </span>
              ))}
              {activeArea.specialItems.map(s => {
                const item = getItem(s.itemId);
                return item ? (
                  <span key={s.itemId} className="text-xs bg-amber-900/30 px-2 py-0.5 rounded text-amber-400">
                    {item.emoji}{item.name} ({(s.chance * 100).toFixed(0)}%)
                  </span>
                ) : null;
              })}
            </div>
          </div>

          <Button variant="danger" onClick={stopFishing} className="w-full">
            停止钓鱼
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-slate-400">选择钓鱼地点:</div>
          <div className="grid grid-cols-2 gap-2">
            {FISHING_AREAS.map(area => {
              const unlocked = area.requiredLevel <= fishingLevel;
              const isSelected = selectedArea === area.id;
              return (
                <div key={area.id}>
                  <button
                    onClick={() => unlocked && setSelectedArea(isSelected ? '' : area.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      !unlocked
                        ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-medium text-xs text-slate-200">{area.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{area.description}</div>
                    {!unlocked
                      ? <div className="text-xs text-slate-500 mt-0.5">需要 Lv.{area.requiredLevel}</div>
                      : <div className="text-xs text-slate-500 mt-0.5">{area.fish.filter(f => f.minLevel <= fishingLevel).length} 种鱼</div>
                    }
                  </button>

                  {isSelected && unlocked && (
                    <div className="mt-1 bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700">
                      <div className="text-xs text-slate-400">可钓鱼类:</div>
                      <div className="flex flex-wrap gap-1">
                        {area.fish.filter(f => f.minLevel <= fishingLevel).map(f => (
                          <span key={f.id} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                            {f.name}
                          </span>
                        ))}
                        {area.fish.filter(f => f.minLevel > fishingLevel).map(f => (
                          <span key={f.id} className="text-xs bg-slate-700/50 px-2 py-0.5 rounded text-slate-500 line-through">
                            {f.name} (Lv.{f.minLevel})
                          </span>
                        ))}
                      </div>
                      {area.specialItems.length > 0 && (
                        <>
                          <div className="text-xs text-slate-400">特殊掉落:</div>
                          <div className="flex flex-wrap gap-1">
                            {area.specialItems.map(s => {
                              const item = getItem(s.itemId);
                              return item ? (
                                <span key={s.itemId} className="text-xs bg-amber-900/30 px-2 py-0.5 rounded text-amber-400">
                                  {item.emoji}{item.name} ({(s.chance * 100).toFixed(0)}%)
                                </span>
                              ) : null;
                            })}
                          </div>
                        </>
                      )}
                      <Button
                        variant="primary"
                        onClick={() => startFishing(area.id)}
                        className="w-full"
                        disabled={activeActivity !== null}
                      >
                        {activeActivity !== null ? '有其他活动进行中' : '开始钓鱼'}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
