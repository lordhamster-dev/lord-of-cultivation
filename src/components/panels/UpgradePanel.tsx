import Decimal from 'break_eternity.js';
import { useGameStore } from '../../store/gameStore';
import { UPGRADES } from '../../core/data/upgrades';
import { getUpgradeCost } from '../../core/systems/ProductionSystem';
import { Button } from '../ui/Button';
import { NumberDisplay } from '../ui/NumberDisplay';

export function UpgradePanel() {
  const spiritStones = useGameStore((s) => s.resources.spiritStones);
  const upgrades = useGameStore((s) => s.upgrades);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-amber-400 font-bold text-xl">升级</h2>

      <div className="space-y-3">
        {UPGRADES.map((def) => {
          const level = upgrades[def.id] ?? 0;
          const cost = getUpgradeCost(def.id, level);
          const canAfford = new Decimal(spiritStones).gte(cost);
          const isMaxLevel = def.maxLevel !== undefined && level >= def.maxLevel;

          return (
            <div key={def.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 font-semibold">{def.name}</span>
                    <span className="bg-amber-900/50 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                      Lv.{level}{def.maxLevel ? `/${def.maxLevel}` : ''}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{def.description}</p>
                  {!isMaxLevel && (
                    <p className="text-slate-500 text-xs mt-1">
                      费用: <span className={canAfford ? 'text-amber-300' : 'text-red-400'}>
                        <NumberDisplay value={cost} /> 灵石
                      </span>
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isMaxLevel ? 'ghost' : canAfford ? 'primary' : 'secondary'}
                  disabled={isMaxLevel || !canAfford}
                  onClick={() => buyUpgrade(def.id)}
                  className="shrink-0"
                >
                  {isMaxLevel ? '满级' : '购买'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
