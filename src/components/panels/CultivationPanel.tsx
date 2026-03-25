import Decimal from 'break_eternity.js';
import { useGameStore, selectStage, selectBreakthroughCost } from '../../store/gameStore';
import { STAGES } from '../../core/data/stages';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { NumberDisplay } from '../ui/NumberDisplay';

export function CultivationPanel() {
  const stage = useGameStore(selectStage);
  const stageIndex = useGameStore((s) => s.cultivation.stageIndex);
  const progress = useGameStore((s) => s.cultivation.progress);
  const spiritStones = useGameStore((s) => s.resources.spiritStones);
  const breakthroughCost = useGameStore(selectBreakthroughCost);
  const breakthrough = useGameStore((s) => s.breakthrough);

  const canBreakthrough =
    progress >= 100 &&
    new Decimal(spiritStones).gte(breakthroughCost) &&
    stageIndex < STAGES.length - 1;

  const isMaxStage = stageIndex >= STAGES.length - 1;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-amber-400 font-bold text-xl">修炼</h2>

      {/* Stage journey */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-slate-300 text-sm font-semibold mb-3">境界历程</h3>
        <div className="flex items-center gap-1 flex-wrap">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div
                className={`px-3 py-1 rounded text-sm font-medium ${
                  i < stageIndex
                    ? 'bg-amber-700/50 text-amber-300'
                    : i === stageIndex
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                {s.name}
              </div>
              {i < STAGES.length - 1 && (
                <span className="text-slate-600">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current stage info */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-amber-400">{stage?.name}</div>
            <div className="text-slate-400 text-sm">当前境界</div>
          </div>
          <div className="text-right">
            <div className="text-slate-300 text-sm">
              倍率: <span className="text-amber-300">×{stage?.multiplier}</span>
            </div>
          </div>
        </div>

        <ProgressBar value={progress} label="修炼进度" />
      </div>

      {/* Breakthrough section */}
      {!isMaxStage && (
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-slate-300 font-semibold">突破境界</h3>
          <p className="text-slate-400 text-sm">
            下一境界: <span className="text-amber-300">{STAGES[stageIndex + 1]?.name}</span>
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">需要灵石:</span>
            <span className={new Decimal(spiritStones).gte(breakthroughCost) ? 'text-amber-300' : 'text-red-400'}>
              <NumberDisplay value={breakthroughCost} /> / <NumberDisplay value={spiritStones} />
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">修炼进度:</span>
            <span className={progress >= 100 ? 'text-green-400' : 'text-slate-400'}>
              {progress.toFixed(1)}% {progress >= 100 ? '✓' : ''}
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
          <div className="text-slate-400 text-sm mt-1">化神圆满，道法自然</div>
        </div>
      )}
    </div>
  );
}
