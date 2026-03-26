import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { DUNGEONS, getDungeon } from '../../core/data/dungeons';
import { getPlayerCombatStats } from '../../core/systems/CombatSystem';

export function DungeonPanel() {
  const dungeon = useGameStore(s => s.dungeon);
  const activeActivity = useGameStore(s => s.activeActivity);
  const spirit = useGameStore(s => s.resources.spirit);
  const stageIndex = useGameStore(s => s.cultivation.stageIndex);
  const skills = useGameStore(s => s.skills);
  const equipment = useGameStore(s => s.equipment);
  const stats = useGameStore(s => s.stats);
  const startDungeon = useGameStore(s => s.startDungeon);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 200);
    return () => clearInterval(id);
  }, []);

  const playerStats = getPlayerCombatStats(stageIndex, equipment, skills.combat.level);

  const activeDungeon = dungeon.currentDungeonId
    ? getDungeon(dungeon.currentDungeonId)
    : null;

  const enemyHpPercent = dungeon.enemyMaxHp > 0
    ? (dungeon.enemyHp / dungeon.enemyMaxHp) * 100
    : 0;

  const playerHpPercent = playerStats.maxHp > 0
    ? (dungeon.playerHp / playerStats.maxHp) * 100
    : 0;

  // Get current enemy name
  let currentEnemyName = '';
  if (activeDungeon && dungeon.isActive) {
    const floorIndex = dungeon.currentFloor - 1;
    const floor = activeDungeon.floors[floorIndex];
    if (floor) {
      const enemy = floor.boss ?? floor.enemies[0];
      if (enemy) {
        currentEnemyName = `${enemy.icon} ${enemy.name}${enemy.isBoss ? ' 🔥BOSS' : ''}`;
      }
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-amber-400">🏔️ 副本</h2>

      <div className="bg-slate-800 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">副本通关总数</span>
          <span className="text-amber-300">{stats.totalDungeonClears}</span>
        </div>
      </div>

      {!dungeon.isActive ? (
        <div className="space-y-3">
          {dungeon.playerHp === 0 && dungeon.currentDungeonId && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-sm text-red-300 text-center">
              💀 副本挑战失败！提升实力后再来
            </div>
          )}

          <div className="text-sm text-slate-400">选择副本:</div>
          <div className="space-y-3">
            {DUNGEONS.map(d => {
              const unlocked = stageIndex >= d.requiredStage;
              const runsToday = dungeon.dailyRuns[d.id] ?? 0;
              const canEnter = unlocked && runsToday < d.maxDailyRuns && activeActivity === null && spirit > 0;

              return (
                <div
                  key={d.id}
                  className={`p-3 rounded-lg border ${
                    !unlocked
                      ? 'border-slate-700 bg-slate-800/50 opacity-50'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-200">{d.icon} {d.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{d.description}</div>
                      {unlocked && (
                        <div className="text-xs text-slate-500 mt-1">
                          层数: {d.floors.length} | 今日剩余: {d.maxDailyRuns - runsToday}/{d.maxDailyRuns}
                        </div>
                      )}
                      {!unlocked && (
                        <div className="text-xs text-red-400 mt-1">需要境界: {d.requiredStage + 1}</div>
                      )}
                    </div>
                    {unlocked && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => startDungeon(d.id)}
                        disabled={!canEnter}
                      >
                        {runsToday >= d.maxDailyRuns ? '次数用完' : activeActivity !== null ? '有活动进行中' : spirit <= 0 ? '灵力不足' : '挑战'}
                      </Button>
                    )}
                  </div>

                  {/* Floor preview */}
                  {unlocked && (
                    <div className="mt-2 flex gap-1">
                      {d.floors.map((floor, i) => (
                        <div key={i} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">
                          第{floor.floor}层
                          {floor.boss && <span className="text-red-400 ml-1">BOSS</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-slate-800 border border-red-600/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-red-300 font-medium">
                {activeDungeon?.icon} {activeDungeon?.name} — 第{dungeon.currentFloor}层
              </span>
              <span className="text-xs text-slate-400">
                {dungeon.currentFloor}/{activeDungeon?.floors.length ?? 0}
              </span>
            </div>

            {/* Floor progress dots */}
            {activeDungeon && (
              <div className="flex gap-1">
                {activeDungeon.floors.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full ${
                      i < dungeon.currentFloor - 1
                        ? 'bg-green-500'
                        : i === dungeon.currentFloor - 1
                        ? 'bg-red-500'
                        : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Current enemy */}
            {currentEnemyName && (
              <div className="text-center text-sm text-red-300">
                当前敌人: {currentEnemyName}
              </div>
            )}

            {/* Player HP */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-400">我方 HP</span>
                <span className="text-slate-300">{Math.floor(dungeon.playerHp)} / {playerStats.maxHp}</span>
              </div>
              <ProgressBar value={playerHpPercent} color="bg-green-500" />
            </div>

            {/* Enemy HP */}
            {dungeon.enemyMaxHp > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">敌方 HP</span>
                  <span className="text-slate-300">{Math.floor(dungeon.enemyHp)} / {dungeon.enemyMaxHp}</span>
                </div>
                <ProgressBar value={enemyHpPercent} color="bg-red-500" />
              </div>
            )}

            <div className="text-xs text-slate-500 text-center">
              副本进行中，自动战斗...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
