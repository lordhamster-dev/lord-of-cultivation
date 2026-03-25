import { useGameStore } from '../../store/gameStore';
import { NumberDisplay } from '../ui/NumberDisplay';

export function ResourcePanel() {
  const spiritStones = useGameStore((s) => s.resources.spiritStones);
  const exp = useGameStore((s) => s.resources.exp);
  const spiritStonesPerSec = useGameStore((s) => s.resources.spiritStonesPerSec);
  const expPerSec = useGameStore((s) => s.resources.expPerSec);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-amber-400 font-bold text-xl">资源</h2>

      <div className="grid gap-4">
        <ResourceCard
          icon="💎"
          name="灵石"
          value={spiritStones}
          perSec={spiritStonesPerSec}
          color="text-amber-300"
        />
        <ResourceCard
          icon="✨"
          name="经验"
          value={exp}
          perSec={expPerSec}
          color="text-blue-300"
        />
      </div>

      <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-400">
        <p className="font-semibold text-slate-300 mb-2">说明</p>
        <ul className="space-y-1">
          <li>• 灵石用于购买升级和突破境界</li>
          <li>• 经验决定修炼进度增长速度</li>
          <li>• 每秒产量受境界倍率和升级影响</li>
        </ul>
      </div>
    </div>
  );
}

interface ResourceCardProps {
  icon: string;
  name: string;
  value: string;
  perSec: number;
  color: string;
}

function ResourceCard({ icon, name, value, perSec, color }: ResourceCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-slate-300 font-semibold">{name}</div>
          <div className="text-slate-500 text-xs">
            +<NumberDisplay value={perSec.toFixed(2)} />/秒
          </div>
        </div>
      </div>
      <div className={`text-xl font-bold ${color}`}>
        <NumberDisplay value={value} />
      </div>
    </div>
  );
}
