import { useState, useEffect } from 'react';
import { useGameStore, selectSpiritStones } from '../../store/gameStore';
import { SkillBar } from '../ui/SkillBar';
import { Button } from '../ui/Button';
import { NumberDisplay } from '../ui/NumberDisplay';
import { EQUIPMENT, getEquipment, getEnhanceCost, getEnhanceMaterials, getEquipmentTotalStats } from '../../core/data/equipment';
import { STAGES } from '../../core/data/stages';
import type { EquipmentDef } from '../../core/data/equipment';
import { canForge, canEnhance } from '../../core/systems/EquipmentSystem';
import { getItem } from '../../core/data/items';
import type { EquipmentSlotId } from '../../core/types';

type ForgeTab = 'forge' | 'enhance';

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

export function ForgePanel() {
  const skills = useGameStore(s => s.skills);
  const stageIndex = useGameStore(s => s.cultivation.stageIndex);
  const equipment = useGameStore(s => s.equipment);
  const inventory = useGameStore(s => s.inventory);
  const spiritStones = useGameStore(selectSpiritStones);
  const forgeEquipment = useGameStore(s => s.forgeEquipment);
  const enhanceEquipment = useGameStore(s => s.enhanceEquipment);

  const forgingLevel = skills.forging.level;

  const [activeTab, setActiveTab] = useState<ForgeTab>('forge');
  const [selectedForge, setSelectedForge] = useState<string | null>(null);
  const [selectedGridSlot, setSelectedGridSlot] = useState<EquipmentSlotId | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-amber-400">🔨 炼器</h2>

      <div className="bg-slate-800 rounded-lg p-3">
        <SkillBar skillName="炼器" skill={skills.forging} icon="🔨" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {[
          { id: 'forge' as const, label: '🔨 炼制装备' },
          { id: 'enhance' as const, label: '⬆️ 强化装备' },
        ].map(tab => (
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

      {/* ─── Forge Tab ──────────────────────────────────────────────── */}
      {activeTab === 'forge' && (
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
                        {isStageLocked ? `需要境界: ${STAGES[def.requiredStage]?.name ?? def.requiredStage}` : `需要炼器 Lv.${def.forgingRecipe.forgingLevelRequired}`}
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

      {/* ─── Enhance Tab ────────────────────────────────────────────── */}
      {activeTab === 'enhance' && (
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
            <div className="text-sm text-slate-600 text-center py-4">暂无装备可强化，请先去炼制装备</div>
          )}
        </div>
      )}
    </div>
  );
}
