import Decimal from 'break_eternity.js';
import { useGameStore, selectStage, selectBreakthroughCost, selectBreakthroughCostWithoutPill, selectHasBreakthroughPill, selectIsAtFinalSubStage } from '../../store/gameStore';
import { STAGES, getFullStageName, getSubStageCount } from '../../core/data/stages';
import { TECHNIQUES } from '../../core/data/techniques';
import { getItem } from '../../core/data/items';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { NumberDisplay } from '../ui/NumberDisplay';
import type { RealmTier } from '../../core/types';

/** Group stages by realm for display */
const REALM_GROUPS: { realm: RealmTier; name: string; stages: typeof STAGES }[] = [
  { realm: 'lower', name: '下境界', stages: STAGES.filter(s => s.realm === 'lower') },
  { realm: 'middle', name: '中境界', stages: STAGES.filter(s => s.realm === 'middle') },
  { realm: 'upper', name: '上境界', stages: STAGES.filter(s => s.realm === 'upper') },
];

export function CultivationPanel() {
  const stage = useGameStore(selectStage);
  const stageIndex = useGameStore((s) => s.cultivation.stageIndex);
  const subStageIndex = useGameStore((s) => s.cultivation.subStageIndex);
  const progress = useGameStore((s) => s.cultivation.progress);
  const spiritStones = useGameStore((s) => s.resources.spiritStones);
  const spirit = useGameStore((s) => s.resources.spirit);
  const spiritMax = useGameStore((s) => s.resources.spiritMax);
  const spiritPerSec = useGameStore((s) => s.resources.spiritPerSec);
  const activeTechniqueId = useGameStore((s) => s.cultivation.activeTechniqueId);
  const breakthroughCost = useGameStore(selectBreakthroughCost);
  const breakthroughCostWithoutPill = useGameStore(selectBreakthroughCostWithoutPill);
  const hasPill = useGameStore(selectHasBreakthroughPill);
  const atFinalSubStage = useGameStore(selectIsAtFinalSubStage);
  const breakthrough = useGameStore((s) => s.breakthrough);
  const activateTechnique = useGameStore((s) => s.activateTechnique);

  const subStageCount = getSubStageCount(stageIndex);

  const canBreakthrough =
    progress >= 100 &&
    atFinalSubStage &&
    new Decimal(spiritStones).gte(breakthroughCost) &&
    stageIndex < STAGES.length - 1;

  const isMaxStage = stageIndex >= STAGES.length - 1;
  const fullStageName = getFullStageName(stageIndex, subStageIndex);

  const availableTechniques = TECHNIQUES.filter(t => t.requiredStage <= stageIndex);

  // Get next stage pill info
  const nextStage = STAGES[stageIndex + 1];
  const pillItem = nextStage?.breakPillId ? getItem(nextStage.breakPillId) : null;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-amber-400 font-bold text-xl">修炼</h2>

      {/* Stage journey grouped by realm */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <h3 className="text-slate-300 text-sm font-semibold mb-3">境界历程</h3>
        {REALM_GROUPS.map((group) => (
          <div key={group.realm}>
            <div className="text-xs text-slate-500 mb-1">{group.name}</div>
            <div className="flex items-center gap-1 flex-wrap mb-2">
              {group.stages.map((s, i) => {
                const globalIndex = STAGES.indexOf(s);
                return (
                  <div key={s.id} className="flex items-center gap-1">
                    <div
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        globalIndex < stageIndex
                          ? 'bg-amber-700/50 text-amber-300'
                          : globalIndex === stageIndex
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-700 text-slate-500'
                      }`}
                    >
                      {s.name}
                    </div>
                    {i < group.stages.length - 1 && (
                      <span className="text-slate-600 text-xs">→</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Current stage info */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">{stage?.realmName}</div>
            <div className="text-2xl font-bold text-amber-400">{fullStageName}</div>
            <div className="text-slate-400 text-sm">
              子境界 {subStageIndex + 1}/{subStageCount}
              {atFinalSubStage ? <span className="text-amber-300 ml-2">（可突破）</span> : ''}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-300 text-sm">
              倍率: <span className="text-amber-300">×{stage?.multiplier.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <ProgressBar value={progress} label="修炼进度" />

        {/* Sub-stage dots */}
        <div className="flex gap-1">
          {Array.from({ length: subStageCount }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full ${
                i < subStageIndex
                  ? 'bg-amber-500'
                  : i === subStageIndex
                  ? 'bg-amber-300'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Spirit resource */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300 font-medium">🌀 灵力</span>
          <span className="text-purple-300">{spirit.toFixed(1)} / {spiritMax}</span>
        </div>
        <ProgressBar value={(spirit / spiritMax) * 100} color="bg-purple-500" />
        <div className="text-xs text-slate-500 text-right">
          {spiritPerSec >= 0 ? `+${spiritPerSec.toFixed(1)}/秒` : `${spiritPerSec.toFixed(1)}/秒`}
        </div>
      </div>

      {/* Techniques */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <h3 className="text-slate-300 font-semibold text-sm">功法修炼</h3>
        {availableTechniques.length === 0 ? (
          <div className="text-slate-500 text-xs">达到筑基后可修炼更多功法</div>
        ) : null}
        <div className="space-y-2">
          {TECHNIQUES.map(tech => {
            const isLocked = tech.requiredStage > stageIndex;
            const isActive = activeTechniqueId === tech.id;
            return (
              <div
                key={tech.id}
                className={`p-3 rounded-lg border transition-all ${
                  isLocked
                    ? 'border-slate-700 bg-slate-800/50 opacity-40'
                    : isActive
                    ? 'border-purple-500/60 bg-purple-900/20'
                    : 'border-slate-600 bg-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tech.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{tech.name}</div>
                      <div className="text-xs text-slate-400">{tech.description}</div>
                    </div>
                  </div>
                  {!isLocked && (
                    <button
                      onClick={() => activateTechnique(isActive ? null : tech.id)}
                      className={`ml-2 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-red-800/60 text-red-300 hover:bg-red-700/60'
                          : spirit <= 0
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-purple-700/60 text-purple-200 hover:bg-purple-600/60'
                      }`}
                      disabled={!isActive && spirit <= 0}
                    >
                      {isActive ? '停止' : '修炼'}
                    </button>
                  )}
                </div>
                {!isLocked && (
                  <div className="text-xs text-slate-500 mt-1">
                    消耗: {tech.spiritCostPerSec}/秒灵力
                  </div>
                )}
                {isLocked && (
                  <div className="text-xs text-slate-500 mt-1">
                    需要境界: {STAGES[tech.requiredStage]?.name ?? ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {activeTechniqueId && (
          <div className="text-center text-xs text-purple-300">
            ✨ 正在修炼：{TECHNIQUES.find(t => t.id === activeTechniqueId)?.name}
          </div>
        )}
      </div>

      {/* Breakthrough section */}
      {!isMaxStage && (
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-slate-300 font-semibold">突破境界</h3>
          {!atFinalSubStage && (
            <p className="text-xs text-slate-400">
              需修炼至 <span className="text-amber-300">{stage?.subStages[subStageCount - 1]?.name ?? '最终'}</span> 才可大突破
            </p>
          )}
          <p className="text-slate-400 text-sm">
            下一境界: <span className="text-amber-300">{nextStage?.name}</span>
            {nextStage?.realmName !== stage?.realmName && (
              <span className="text-purple-300 ml-1">({nextStage?.realmName})</span>
            )}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">需要灵石:</span>
            <span className={new Decimal(spiritStones).gte(breakthroughCost) ? 'text-amber-300' : 'text-red-400'}>
              <NumberDisplay value={breakthroughCost} /> / <NumberDisplay value={spiritStones} />
            </span>
          </div>
          {/* Pill discount info */}
          {pillItem && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">💊 {pillItem.name}:</span>
              {hasPill ? (
                <span className="text-green-400">
                  已持有 (灵石消耗 -{(nextStage.breakPillDiscount * 100).toFixed(0)}%)
                  {hasPill && nextStage.breakPillDiscount > 0 && (
                    <span className="text-slate-500 line-through ml-1">
                      <NumberDisplay value={breakthroughCostWithoutPill} />
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-slate-500">未持有 (可减少{(nextStage.breakPillDiscount * 100).toFixed(0)}%灵石)</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">修炼进度:</span>
            <span className={progress >= 100 ? 'text-green-400' : 'text-slate-400'}>
              {progress.toFixed(1)}% {progress >= 100 ? '✓' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">子境界:</span>
            <span className={atFinalSubStage ? 'text-green-400' : 'text-slate-400'}>
              {subStageIndex + 1}/{subStageCount} {atFinalSubStage ? '✓' : ''}
            </span>
          </div>
          <Button
            variant="primary"
            onClick={() => breakthrough()}
            disabled={!canBreakthrough}
            className="w-full"
          >
            {canBreakthrough ? '⚡ 突破！' : '条件未满足'}
          </Button>
        </div>
      )}

      {isMaxStage && (
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 text-center">
          <div className="text-amber-400 font-bold text-lg">🏆 已达最高境界</div>
          <div className="text-slate-400 text-sm mt-1">道祖圆满，大道唯一</div>
        </div>
      )}
    </div>
  );
}
