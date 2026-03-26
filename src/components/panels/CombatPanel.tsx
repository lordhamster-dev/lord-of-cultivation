import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ProgressBar } from '../ui/ProgressBar';
import { SkillBar } from '../ui/SkillBar';
import { Button } from '../ui/Button';
import { COMBAT_AREAS } from '../../core/data/enemies';
import { getPlayerCombatStats } from '../../core/systems/CombatSystem';
import { getItem } from '../../core/data/items';

export function CombatPanel() {
  const combat = useGameStore(s => s.combat);
  const skills = useGameStore(s => s.skills);
  const stageIndex = useGameStore(s => s.cultivation.stageIndex);
  const equipment = useGameStore(s => s.equipment);
  const activeActivity = useGameStore(s => s.activeActivity);
  const spirit = useGameStore(s => s.resources.spirit);
  const startCombat = useGameStore(s => s.startCombat);
  const stopCombat = useGameStore(s => s.stopCombat);
  const combatLevel = skills.combat.level;

  const [selectedArea, setSelectedArea] = useState(COMBAT_AREAS[0].id);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 200);
    return () => clearInterval(id);
  }, []);

  const playerStats = getPlayerCombatStats(stageIndex, equipment, combatLevel);
  const activeArea = combat.currentAreaId
    ? COMBAT_AREAS.find(a => a.id === combat.currentAreaId)
    : null;

  const enemyHpPercent = combat.enemyMaxHp > 0
    ? (combat.enemyHp / combat.enemyMaxHp) * 100
    : 0;

  const playerHpPercent = playerStats.maxHp > 0
    ? (combat.playerHp / playerStats.maxHp) * 100
    : 0;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-amber-400">⚔️ 战斗</h2>

      <div className="bg-slate-800 rounded-lg p-3">
        <SkillBar skillName="战斗" skill={skills.combat} icon="⚔️" />
      </div>

      {/* Player Stats */}
      <div className="bg-slate-800 rounded-lg p-3 space-y-1">
        <div className="text-sm text-slate-300 font-medium">修士属性</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-red-400">⚔️ 攻击</div>
            <div className="text-slate-200 font-semibold">{playerStats.attack}</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400">🛡️ 防御</div>
            <div className="text-slate-200 font-semibold">{playerStats.defense}</div>
          </div>
          <div className="text-center">
            <div className="text-green-400">❤️ 生命</div>
            <div className="text-slate-200 font-semibold">{playerStats.maxHp}</div>
          </div>
        </div>
      </div>

      {!combat.isActive ? (
        <div className="space-y-3">
          {combat.lastCombatResult === 'defeat' && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-sm text-red-300 text-center">
              💀 你被击败了！提升境界或装备后再来挑战
            </div>
          )}

          <div className="text-sm text-slate-400">选择战斗区域:</div>
          <div className="space-y-2">
            {COMBAT_AREAS.map(area => {
              const unlocked = stageIndex >= area.requiredStage;
              return (
                <button
                  key={area.id}
                  onClick={() => unlocked && setSelectedArea(area.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                    !unlocked
                      ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                      : selectedArea === area.id
                      ? 'border-red-500/50 bg-red-500/10'
                      : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-200">{area.icon} {area.name}</span>
                    {!unlocked && <span className="text-xs text-slate-500">需要境界: {area.requiredStage + 1}</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{area.description}</div>
                  {unlocked && (
                    <div className="text-xs text-slate-500 mt-1">
                      敌人: {area.enemies.map(e => `${e.icon}${e.name}`).join('、')}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <Button
            variant="primary"
            onClick={() => startCombat(selectedArea)}
            className="w-full"
            disabled={activeActivity !== null || spirit <= 0 || !COMBAT_AREAS.find(a => a.id === selectedArea && stageIndex >= a.requiredStage)}
          >
            {activeActivity !== null && activeActivity !== 'combat' ? '有其他活动进行中' : spirit <= 0 ? '灵力不足' : '⚔️ 开始战斗'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-red-300 font-medium">⚔️ {activeArea?.name ?? ''} 战斗中...</span>
              <span className="text-xs text-slate-400">击杀 {combat.totalKills}</span>
            </div>

            {/* Player HP */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-400">我方 HP</span>
                <span className="text-slate-300">{Math.floor(combat.playerHp)} / {playerStats.maxHp}</span>
              </div>
              <ProgressBar value={playerHpPercent} color="bg-green-500" />
            </div>

            {/* Enemy HP */}
            {combat.enemyMaxHp > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">敌方 HP</span>
                  <span className="text-slate-300">{Math.floor(combat.enemyHp)} / {combat.enemyMaxHp}</span>
                </div>
                <ProgressBar value={enemyHpPercent} color="bg-red-500" />
              </div>
            )}
          </div>

          {/* Recent loot */}
          {combat.loot.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">最近掉落:</div>
              <div className="flex flex-wrap gap-1">
                {combat.loot.map((item, idx) => {
                  const def = getItem(item.itemId);
                  return (
                    <span key={idx} className="text-xs bg-amber-900/30 px-2 py-0.5 rounded text-amber-300">
                      {def?.name ?? item.itemId} ×{item.quantity}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <Button variant="danger" onClick={stopCombat} className="w-full">
            停止战斗
          </Button>
        </div>
      )}
    </div>
  );
}
