import { useState, useEffect } from 'react';
import { useGameStore, selectSpiritStones } from '../../store/gameStore';
import { ProgressBar } from '../ui/ProgressBar';
import { SkillBar } from '../ui/SkillBar';
import { Button } from '../ui/Button';
import { NumberDisplay } from '../ui/NumberDisplay';
import { COMBAT_AREAS } from '../../core/data/enemies';
import { DUNGEONS, getDungeon } from '../../core/data/dungeons';
import { EQUIPMENT, getEquipment, getEnhanceCost, getEnhanceMaterials, getEquipmentTotalStats } from '../../core/data/equipment';
import type { EquipmentDef } from '../../core/data/equipment';
import { getPlayerCombatStats } from '../../core/systems/CombatSystem';
import { canForge, canEnhance } from '../../core/systems/EquipmentSystem';
import { getItem } from '../../core/data/items';
import type { EquipmentSlotId } from '../../core/types';

type BattleTab = 'combat' | 'dungeon' | 'equipment' | 'supply';

// ─── 9-Grid Equipment Slot Definitions ──────────────────────────────────────
const EQUIPMENT_GRID: { slot: EquipmentSlotId; label: string; icon: string }[] = [
  { slot: 'necklace', label: '项链', icon: '📿' },
  { slot: 'helmet', label: '头盔', icon: '⛑️' },
  { slot: 'amulet', label: '护身符', icon: '🔮' },
  { slot: 'glove_left', label: '左手', icon: '🧤' },
  { slot: 'armor', label: '盔甲', icon: '🛡️' },
  { slot: 'glove_right', label: '右手', icon: '🧤' },
  { slot: 'ring_left', label: '戒指', icon: '💍' },
  { slot: 'boots', label: '靴子', icon: '👢' },
  { slot: 'ring_right', label: '戒指', icon: '💍' },
];

function getSlotLabel(slot: EquipmentSlotId): string {
  return EQUIPMENT_GRID.find(g => g.slot === slot)?.label ?? slot;
}

// ─── Stat Display ───────────────────────────────────────────────────────────
function StatDisplay({ label, value }: { label: string; value: number | undefined }) {
  if (!value) return null;
  return (
    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
      {label} +{typeof value === 'number' && value < 1 ? `${(value * 100).toFixed(0)}%` : value}
    </span>
  );
}

function EquipmentCard({ def, currentLevel }: { def: EquipmentDef; currentLevel: number }) {
  const stats = getEquipmentTotalStats(def.id, currentLevel);
  return (
    <div className="p-2 rounded border border-slate-600 bg-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-lg">{def.icon}</span>
        <div>
          <div className="text-sm font-medium text-slate-200">
            {def.name}
            {currentLevel > 0 && <span className="text-amber-400 ml-1">+{currentLevel}</span>}
          </div>
          <div className="text-xs text-slate-500">{def.description}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        <StatDisplay label="⚔️攻击" value={stats.attack} />
        <StatDisplay label="🛡️防御" value={stats.defense} />
        <StatDisplay label="❤️生命" value={stats.hp} />
        <StatDisplay label="🧘打坐" value={stats.meditationPercent} />
      </div>
    </div>
  );
}

// ─── Consumable items for combat supplies ───────────────────────────────────
const HP_RECOVERY_ITEMS = [
  { id: 'golden_lotus', name: '金莲子', description: '回复30%生命值' },
  { id: 'moon_flower', name: '月华花', description: '回复30%生命值' },
  { id: 'fire_herb', name: '火灵草', description: '回复30%生命值' },
  { id: 'spirit_grass', name: '灵草', description: '回复30%生命值' },
];

const SPIRIT_RECOVERY_ITEMS = [
  { id: 'gathering_pill', name: '聚气丹', description: '回复30%灵力' },
];

export function BattlePanel() {
  const combat = useGameStore(s => s.combat);
  const dungeon = useGameStore(s => s.dungeon);
  const skills = useGameStore(s => s.skills);
  const stageIndex = useGameStore(s => s.cultivation.stageIndex);
  const equipment = useGameStore(s => s.equipment);
  const inventory = useGameStore(s => s.inventory);
  const activeActivity = useGameStore(s => s.activeActivity);
  const spirit = useGameStore(s => s.resources.spirit);
  const spiritMax = useGameStore(s => s.resources.spiritMax);
  const spiritStones = useGameStore(selectSpiritStones);
  const stats = useGameStore(s => s.stats);
  const combatSupply = useGameStore(s => s.combatSupply);

  const startCombat = useGameStore(s => s.startCombat);
  const stopCombat = useGameStore(s => s.stopCombat);
  const startDungeon = useGameStore(s => s.startDungeon);
  const forgeEquipment = useGameStore(s => s.forgeEquipment);
  const enhanceEquipment = useGameStore(s => s.enhanceEquipment);
  const unequipItem = useGameStore(s => s.unequipItem);
  const updateCombatSupplyConfig = useGameStore(s => s.updateCombatSupplyConfig);

  const combatLevel = skills.combat.level;
  const forgingLevel = skills.forging.level;

  const [activeTab, setActiveTab] = useState<BattleTab>('combat');
  const [selectedArea, setSelectedArea] = useState(COMBAT_AREAS[0].id);
  const [selectedGridSlot, setSelectedGridSlot] = useState<EquipmentSlotId | null>(null);
  const [selectedForge, setSelectedForge] = useState<string | null>(null);
  const [equipAction, setEquipAction] = useState<'view' | 'forge' | 'enhance'>('view');
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

  const activeDungeon = dungeon.currentDungeonId
    ? getDungeon(dungeon.currentDungeonId)
    : null;
  const dungeonEnemyHpPercent = dungeon.enemyMaxHp > 0
    ? (dungeon.enemyHp / dungeon.enemyMaxHp) * 100
    : 0;
  const dungeonPlayerHpPercent = playerStats.maxHp > 0
    ? (dungeon.playerHp / playerStats.maxHp) * 100
    : 0;

  // Get current dungeon enemy name
  let currentDungeonEnemyName = '';
  if (activeDungeon && dungeon.isActive) {
    const floorIndex = dungeon.currentFloor - 1;
    const floor = activeDungeon.floors[floorIndex];
    if (floor) {
      const enemy = floor.boss ?? floor.enemies[0];
      if (enemy) {
        currentDungeonEnemyName = `${enemy.icon} ${enemy.name}${enemy.isBoss ? ' 🔥BOSS' : ''}`;
      }
    }
  }

  const tabs: { id: BattleTab; label: string }[] = [
    { id: 'combat', label: '⚔️ 战斗区域' },
    { id: 'dungeon', label: '🏔️ 副本' },
    { id: 'equipment', label: '🛡️ 装备' },
    { id: 'supply', label: '🎒 补给' },
  ];

  const isInCombat = combat.isActive || dungeon.isActive;

  return (
    <div className="p-4 space-y-4">
      {/* Header with skill bar + action buttons */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-amber-400 shrink-0">⚔️ 战斗</h2>
        <div className="flex-1">
          <SkillBar skillName="战斗" skill={skills.combat} icon="⚔️" />
        </div>
        <div className="shrink-0">
          {combat.isActive ? (
            <Button variant="danger" size="sm" onClick={stopCombat}>
              停止战斗
            </Button>
          ) : dungeon.isActive ? (
            <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">副本进行中</span>
          ) : (
            activeTab === 'combat' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => startCombat(selectedArea)}
                disabled={activeActivity !== null || spirit <= 0 || !COMBAT_AREAS.find(a => a.id === selectedArea && stageIndex >= a.requiredStage)}
              >
                {activeActivity !== null && activeActivity !== 'combat' ? '有活动进行中' : spirit <= 0 ? '灵力不足' : '⚔️ 开始战斗'}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Player Stats with spirit display */}
      <div className="bg-slate-800 rounded-lg p-3 space-y-1">
        <div className="text-sm text-slate-300 font-medium">修士属性</div>
        <div className="grid grid-cols-4 gap-2 text-xs">
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
          <div className="text-center">
            <div className="text-purple-400">✨ 灵力</div>
            <div className="text-slate-200 font-semibold">{Math.floor(spirit)}/{spiritMax}</div>
          </div>
        </div>
      </div>

      {/* Active combat display */}
      {combat.isActive && (
        <div className="bg-slate-800 border border-red-600/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-red-300 font-medium">⚔️ {activeArea?.name ?? ''} 战斗中...</span>
            <span className="text-xs text-slate-400">击杀 {combat.totalKills}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-400">我方 HP</span>
              <span className="text-slate-300">{Math.floor(combat.playerHp)} / {playerStats.maxHp}</span>
            </div>
            <ProgressBar value={playerHpPercent} color="bg-green-500" />
          </div>
          {combat.enemyMaxHp > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-400">敌方 HP</span>
                <span className="text-slate-300">{Math.floor(combat.enemyHp)} / {combat.enemyMaxHp}</span>
              </div>
              <ProgressBar value={enemyHpPercent} color="bg-red-500" />
            </div>
          )}
          {combat.loot.length > 0 && (
            <div className="text-xs text-slate-400">
              最近掉落: {combat.loot.map((item, idx) => {
                const def = getItem(item.itemId);
                return <span key={idx} className="bg-amber-900/30 px-1.5 py-0.5 rounded text-amber-300 mr-1">{def?.name ?? item.itemId} ×{item.quantity}</span>;
              })}
            </div>
          )}
          {combatSupply.hpItemsUsed > 0 || combatSupply.spiritItemsUsed > 0 ? (
            <div className="text-xs text-slate-500">
              补给已使用: {combatSupply.hpItemsUsed > 0 && `生命×${combatSupply.hpItemsUsed}`} {combatSupply.spiritItemsUsed > 0 && `灵力×${combatSupply.spiritItemsUsed}`}
            </div>
          ) : null}
        </div>
      )}

      {/* Active dungeon display */}
      {dungeon.isActive && (
        <div className="bg-slate-800 border border-red-600/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-red-300 font-medium">
              {activeDungeon?.icon} {activeDungeon?.name} — 第{dungeon.currentFloor}层
            </span>
            <span className="text-xs text-slate-400">
              {dungeon.currentFloor}/{activeDungeon?.floors.length ?? 0}
            </span>
          </div>
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
          {currentDungeonEnemyName && (
            <div className="text-center text-sm text-red-300">
              当前敌人: {currentDungeonEnemyName}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-400">我方 HP</span>
              <span className="text-slate-300">{Math.floor(dungeon.playerHp)} / {playerStats.maxHp}</span>
            </div>
            <ProgressBar value={dungeonPlayerHpPercent} color="bg-green-500" />
          </div>
          {dungeon.enemyMaxHp > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-400">敌方 HP</span>
                <span className="text-slate-300">{Math.floor(dungeon.enemyHp)} / {dungeon.enemyMaxHp}</span>
              </div>
              <ProgressBar value={dungeonEnemyHpPercent} color="bg-red-500" />
            </div>
          )}
          <div className="text-xs text-slate-500 text-center">副本进行中，自动战斗...</div>
        </div>
      )}

      {/* Defeat messages */}
      {!combat.isActive && combat.lastCombatResult === 'defeat' && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-sm text-red-300 text-center">
          💀 你被击败了！提升境界或装备后再来挑战
        </div>
      )}
      {!dungeon.isActive && dungeon.playerHp === 0 && dungeon.currentDungeonId && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-sm text-red-300 text-center">
          💀 副本挑战失败！提升实力后再来
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 border border-slate-600 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Combat Areas Tab ──────────────────────────────────────── */}
      {activeTab === 'combat' && !combat.isActive && (
        <div className="space-y-3">
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
        </div>
      )}

      {/* ─── Dungeon Tab ───────────────────────────────────────────── */}
      {activeTab === 'dungeon' && !dungeon.isActive && (
        <div className="space-y-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">副本通关总数</span>
              <span className="text-amber-300">{stats.totalDungeonClears}</span>
            </div>
          </div>
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
      )}

      {/* ─── Equipment Tab ─────────────────────────────────────────── */}
      {activeTab === 'equipment' && (
        <div className="space-y-3">
          {/* Equipment sub-tabs */}
          <div className="flex gap-1">
            {[
              { id: 'view' as const, label: '👤 装备栏' },
              { id: 'forge' as const, label: '🔨 炼器' },
              { id: 'enhance' as const, label: '⬆️ 强化' },
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setEquipAction(sub.id)}
                className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                  equipAction === sub.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-slate-400 border border-slate-600 hover:text-slate-200'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Forging skill bar */}
          <div className="bg-slate-800 rounded-lg p-3">
            <SkillBar skillName="炼器" skill={skills.forging} icon="🔨" />
          </div>

          {/* ─── Equipment Grid View (9 slots) ─────────────────────── */}
          {equipAction === 'view' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {EQUIPMENT_GRID.map(({ slot, label, icon }) => {
                  const instance = equipment.equipped[slot];
                  const def = instance ? getEquipment(instance.defId) : null;
                  const isSelected = selectedGridSlot === slot;

                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedGridSlot(isSelected ? null : slot)}
                      className={`p-2 rounded-lg border text-center transition-colors cursor-pointer min-h-[80px] flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : instance
                          ? 'border-slate-500 bg-slate-800'
                          : 'border-slate-700 bg-slate-800/50'
                      }`}
                    >
                      <div className="text-lg">{def ? def.icon : icon}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                      {def && instance ? (
                        <div className="text-xs text-amber-400 mt-0.5 truncate w-full">
                          {def.name}{instance.level > 0 ? ` +${instance.level}` : ''}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 mt-0.5">空</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected slot detail */}
              {selectedGridSlot && (() => {
                const instance = equipment.equipped[selectedGridSlot];
                const def = instance ? getEquipment(instance.defId) : null;

                return (
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 space-y-2">
                    <div className="text-sm text-slate-300 font-medium">{getSlotLabel(selectedGridSlot)}</div>
                    {def && instance ? (
                      <>
                        <EquipmentCard def={def} currentLevel={instance.level} />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => { unequipItem(selectedGridSlot); setSelectedGridSlot(null); }}
                          className="w-full"
                        >
                          卸下装备
                        </Button>
                      </>
                    ) : (
                      <div className="text-sm text-slate-600 text-center py-2">
                        — 未装备 —<br />
                        <span className="text-xs text-slate-500">去炼器页面制造装备</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Stats summary */}
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">已炼制装备</span>
                  <span className="text-amber-300">{equipment.totalForged}</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── Forge Sub-tab ──────────────────────────────────────── */}
          {equipAction === 'forge' && (
            <div className="space-y-3">
              <div className="text-sm text-slate-400">选择要炼制的装备:</div>
              <div className="space-y-2">
                {EQUIPMENT.map(def => {
                  const isForgeAvailable = canForge(def, inventory, spiritStones, forgingLevel, stageIndex);
                  const isLevelLocked = forgingLevel < def.forgingRecipe.forgingLevelRequired;
                  const isStageLocked = stageIndex < def.requiredStage;
                  const isSelected = selectedForge === def.id;

                  const currentEquipped = equipment.equipped[def.slot];
                  const isAlreadyEquipped = currentEquipped?.defId === def.id;

                  return (
                    <div key={def.id}>
                      <button
                        onClick={() => setSelectedForge(isSelected ? null : def.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                          isLevelLocked || isStageLocked
                            ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{def.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-slate-200">{def.name}</div>
                              <div className="text-xs text-slate-500">{def.description}</div>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <div className="text-slate-500">{getSlotLabel(def.slot)}</div>
                            {isAlreadyEquipped && <div className="text-amber-400">已装备</div>}
                          </div>
                        </div>
                        {(isLevelLocked || isStageLocked) && (
                          <div className="text-xs text-red-400 mt-1">
                            {isStageLocked ? `需要境界 ${def.requiredStage + 1}` : `需要炼器 Lv.${def.forgingRecipe.forgingLevelRequired}`}
                          </div>
                        )}
                      </button>

                      {isSelected && !isLevelLocked && !isStageLocked && (
                        <div className="ml-4 mt-2 bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700">
                          <div className="text-xs text-slate-400">所需材料:</div>
                          <div className="flex flex-wrap gap-1">
                            {def.forgingRecipe.ingredients.map((ing, i) => {
                              const item = getItem(ing.itemId);
                              const have = inventory.items[ing.itemId] ?? 0;
                              const enough = have >= ing.quantity;
                              return (
                                <span key={i} className={`text-xs px-2 py-0.5 rounded ${enough ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                                  {item?.name ?? ing.itemId} {have}/{ing.quantity}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-xs text-slate-400">
                            灵石: <span className={spiritStones >= def.forgingRecipe.spiritStones ? 'text-amber-300' : 'text-red-400'}>
                              <NumberDisplay value={def.forgingRecipe.spiritStones} />
                            </span>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => forgeEquipment(def.id)}
                            disabled={!isForgeAvailable}
                            className="w-full"
                          >
                            {isAlreadyEquipped ? '🔨 重新炼制（覆盖）' : '🔨 炼制'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Enhance Sub-tab ────────────────────────────────────── */}
          {equipAction === 'enhance' && (
            <div className="space-y-3">
              <div className="text-sm text-slate-400">选择要强化的装备:</div>
              {EQUIPMENT_GRID.map(({ slot }) => {
                const instance = equipment.equipped[slot];
                if (!instance) return null;
                const def = getEquipment(instance.defId);
                if (!def) return null;

                const isMaxLevel = instance.level >= def.maxLevel;
                const enhanceable = canEnhance(instance, inventory, spiritStones);
                const cost = isMaxLevel ? 0 : getEnhanceCost(def, instance.level);
                const materials = isMaxLevel ? [] : getEnhanceMaterials(def, instance.level);
                const isSelected = selectedGridSlot === slot;

                return (
                  <div key={slot}>
                    <button
                      onClick={() => setSelectedGridSlot(isSelected ? null : slot)}
                      className="w-full text-left"
                    >
                      <EquipmentCard def={def} currentLevel={instance.level} />
                    </button>

                    {isSelected && (
                      <div className="ml-4 mt-2 bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700">
                        {isMaxLevel ? (
                          <div className="text-sm text-amber-400 text-center">✨ 已达最高强化等级</div>
                        ) : (
                          <>
                            <div className="text-xs text-slate-400">
                              强化 +{instance.level} → +{instance.level + 1}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {materials.map((mat, i) => {
                                const item = getItem(mat.itemId);
                                const have = inventory.items[mat.itemId] ?? 0;
                                const enough = have >= mat.quantity;
                                return (
                                  <span key={i} className={`text-xs px-2 py-0.5 rounded ${enough ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                                    {item?.name ?? mat.itemId} {have}/{mat.quantity}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="text-xs text-slate-400">
                              灵石: <span className={spiritStones >= cost ? 'text-amber-300' : 'text-red-400'}>
                                <NumberDisplay value={cost} />
                              </span>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => enhanceEquipment(slot)}
                              disabled={!enhanceable}
                              className="w-full"
                            >
                              ⬆️ 强化
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {!EQUIPMENT_GRID.some(s => equipment.equipped[s.slot]) && (
                <div className="text-sm text-slate-600 text-center py-4">暂无装备可强化，请先去炼器</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Supply Tab ────────────────────────────────────────────── */}
      {activeTab === 'supply' && (
        <div className="space-y-4">
          <div className="text-sm text-slate-400">战斗补给设置 — 自动在战斗/副本中使用物品回复</div>

          {/* HP Recovery */}
          <div className="bg-slate-800 rounded-lg p-3 space-y-2">
            <div className="text-sm text-green-400 font-medium">❤️ 生命回复</div>
            <div className="text-xs text-slate-500">选择用于回复生命值的物品（每次回复30%最大生命值）</div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => updateCombatSupplyConfig({ hpItemId: null })}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${
                  combatSupply.config.hpItemId === null
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'text-slate-400 border border-slate-600'
                }`}
              >
                不使用
              </button>
              {HP_RECOVERY_ITEMS.map(item => {
                const qty = inventory.items[item.id] ?? 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateCombatSupplyConfig({ hpItemId: item.id })}
                    disabled={qty === 0}
                    className={`px-2 py-1 rounded text-xs cursor-pointer ${
                      combatSupply.config.hpItemId === item.id
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : qty > 0
                        ? 'text-slate-400 border border-slate-600 hover:text-slate-200'
                        : 'text-slate-600 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {item.name} (×{qty})
                  </button>
                );
              })}
            </div>
            {combatSupply.config.hpItemId && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">携带数量:</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={combatSupply.config.hpItemCount}
                    onChange={e => updateCombatSupplyConfig({ hpItemCount: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })}
                    className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-slate-200 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">生命低于</span>
                  <input
                    type="number"
                    min={5}
                    max={95}
                    value={combatSupply.config.hpThreshold}
                    onChange={e => updateCombatSupplyConfig({ hpThreshold: Math.max(5, Math.min(95, parseInt(e.target.value) || 30)) })}
                    className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-slate-200 text-xs"
                  />
                  <span className="text-slate-400">% 时自动使用</span>
                </div>
              </div>
            )}
          </div>

          {/* Spirit Recovery */}
          <div className="bg-slate-800 rounded-lg p-3 space-y-2">
            <div className="text-sm text-purple-400 font-medium">✨ 灵力回复</div>
            <div className="text-xs text-slate-500">选择用于回复灵力的物品（每次回复30%最大灵力）</div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => updateCombatSupplyConfig({ spiritItemId: null })}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${
                  combatSupply.config.spiritItemId === null
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'text-slate-400 border border-slate-600'
                }`}
              >
                不使用
              </button>
              {SPIRIT_RECOVERY_ITEMS.map(item => {
                const qty = inventory.items[item.id] ?? 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateCombatSupplyConfig({ spiritItemId: item.id })}
                    disabled={qty === 0}
                    className={`px-2 py-1 rounded text-xs cursor-pointer ${
                      combatSupply.config.spiritItemId === item.id
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : qty > 0
                        ? 'text-slate-400 border border-slate-600 hover:text-slate-200'
                        : 'text-slate-600 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {item.name} (×{qty})
                  </button>
                );
              })}
            </div>
            {combatSupply.config.spiritItemId && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">携带数量:</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={combatSupply.config.spiritItemCount}
                    onChange={e => updateCombatSupplyConfig({ spiritItemCount: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })}
                    className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-slate-200 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">灵力低于</span>
                  <input
                    type="number"
                    min={5}
                    max={95}
                    value={combatSupply.config.spiritThreshold}
                    onChange={e => updateCombatSupplyConfig({ spiritThreshold: Math.max(5, Math.min(95, parseInt(e.target.value) || 30)) })}
                    className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-slate-200 text-xs"
                  />
                  <span className="text-slate-400">% 时自动使用</span>
                </div>
              </div>
            )}
          </div>

          {/* Supply status during combat */}
          {isInCombat && (
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-sm text-amber-400 font-medium">当前战斗补给状态</div>
              <div className="text-xs text-slate-400 mt-1">
                生命物品已使用: {combatSupply.hpItemsUsed} / {combatSupply.config.hpItemCount}
              </div>
              <div className="text-xs text-slate-400">
                灵力物品已使用: {combatSupply.spiritItemsUsed} / {combatSupply.config.spiritItemCount}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
