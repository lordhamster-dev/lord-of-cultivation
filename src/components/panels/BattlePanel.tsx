import { useEffect, useMemo, useState } from "react";
import { DUNGEONS, getDungeon } from "../../core/data/dungeons";
import { COMBAT_AREAS } from "../../core/data/enemies";
import type { EquipmentDef } from "../../core/data/equipment";
import { getEquipment, getEquipmentTotalStats } from "../../core/data/equipment";
import { getItem, ITEMS, PILL_COMBAT_EFFECTS } from "../../core/data/items";
import { STAGES } from "../../core/data/stages";
import { getPlayerCombatStats } from "../../core/systems/CombatSystem";
import type { EquipmentSlotId } from "../../core/types";
import { useGameStore } from "../../store/gameStore";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { SkillBar } from "../ui/SkillBar";

// ─── 9-Grid Equipment Slot Definitions ──────────────────────────────────────
const EQUIPMENT_GRID: { slot: EquipmentSlotId; label: string; icon: string }[] = [
    { slot: "necklace", label: "项链", icon: "📿" },
    { slot: "helmet", label: "头盔", icon: "⛑️" },
    { slot: "amulet", label: "护身符", icon: "🔮" },
    { slot: "glove_left", label: "左手", icon: "🧤" },
    { slot: "armor", label: "盔甲", icon: "🛡️" },
    { slot: "glove_right", label: "右手", icon: "🧤" },
    { slot: "ring_left", label: "戒指", icon: "💍" },
    { slot: "boots", label: "靴子", icon: "👢" },
    { slot: "ring_right", label: "戒指", icon: "💍" },
];

function getSlotLabel(slot: EquipmentSlotId): string {
    return EQUIPMENT_GRID.find((g) => g.slot === slot)?.label ?? slot;
}

function StatBadge({ label, value }: { label: string; value: number | undefined }) {
    if (!value) return null;
    return (
        <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
            {label}+{value < 1 ? `${(value * 100).toFixed(0)}%` : value}
        </span>
    );
}

function EquipmentCard({ def, currentLevel }: { def: EquipmentDef; currentLevel: number }) {
    const stats = getEquipmentTotalStats(def.id, currentLevel);
    return (
        <div className="p-2 rounded border border-slate-600 bg-slate-800">
            <div className="flex items-center gap-2">
                <span className="text-base">{def.icon}</span>
                <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">
                        {def.name}
                        {currentLevel > 0 && <span className="text-amber-400 ml-1">+{currentLevel}</span>}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{def.description}</div>
                </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
                <StatBadge label="⚔️" value={stats.attack} />
                <StatBadge label="🛡️" value={stats.defense} />
                <StatBadge label="❤️" value={stats.hp} />
                <StatBadge label="🧘" value={stats.meditationPercent} />
            </div>
        </div>
    );
}

export function BattlePanel() {
    // ── Store subscriptions ────────────────────────────────────────────────────
    const combat = useGameStore((s) => s.combat);
    const dungeon = useGameStore((s) => s.dungeon);
    const skills = useGameStore((s) => s.skills);
    const stageIndex = useGameStore((s) => s.cultivation.stageIndex);
    const equipment = useGameStore((s) => s.equipment);
    const inventory = useGameStore((s) => s.inventory);
    const activeActivity = useGameStore((s) => s.activeActivity);
    const spirit = useGameStore((s) => s.resources.spirit);
    const spiritMax = useGameStore((s) => s.resources.spiritMax);
    const stats = useGameStore((s) => s.stats);
    const combatSupply = useGameStore((s) => s.combatSupply);

    const startCombat = useGameStore((s) => s.startCombat);
    const stopCombat = useGameStore((s) => s.stopCombat);
    const startDungeon = useGameStore((s) => s.startDungeon);
    const unequipItem = useGameStore((s) => s.unequipItem);
    const equipFromInventory = useGameStore((s) => s.equipFromInventory);
    const updateCombatSupplyConfig = useGameStore((s) => s.updateCombatSupplyConfig);

    // ── UI state ───────────────────────────────────────────────────────────────
    const [selectedGridSlot, setSelectedGridSlot] = useState<EquipmentSlotId | null>(null);
    const [areaTab, setAreaTab] = useState<"combat" | "dungeon">("combat");
    const [areaExpanded, setAreaExpanded] = useState(true);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const id = setInterval(() => forceUpdate((n) => n + 1), 200);
        return () => clearInterval(id);
    }, []);

    // ── Derived values ─────────────────────────────────────────────────────────
    const combatLevel = skills.combat.level;
    const playerStats = getPlayerCombatStats(stageIndex, equipment, combatLevel);
    const isInCombat = combat.isActive;
    const isInDungeon = dungeon.isActive;
    const currentPlayerHp = isInCombat ? combat.playerHp : isInDungeon ? dungeon.playerHp : playerStats.maxHp;
    const playerHpPct = playerStats.maxHp > 0 ? (currentPlayerHp / playerStats.maxHp) * 100 : 0;
    const spiritPct = spiritMax > 0 ? (spirit / spiritMax) * 100 : 0;

    const activeArea = combat.currentAreaId ? COMBAT_AREAS.find((a) => a.id === combat.currentAreaId) : null;
    const activeDungeon = dungeon.currentDungeonId ? getDungeon(dungeon.currentDungeonId) : null;

    const currentEnemy = (() => {
        if (isInCombat && activeArea && combat.currentEnemyId) {
            return activeArea.enemies.find((e) => e.id === combat.currentEnemyId) ?? activeArea.enemies[0] ?? null;
        }
        if (isInDungeon && activeDungeon) {
            const floor = activeDungeon.floors[dungeon.currentFloor - 1];
            return floor ? (floor.boss ?? floor.enemies[0] ?? null) : null;
        }
        return null;
    })();

    const enemyHp = isInCombat ? combat.enemyHp : isInDungeon ? dungeon.enemyHp : 0;
    const enemyMaxHp = isInCombat ? combat.enemyMaxHp : isInDungeon ? dungeon.enemyMaxHp : 0;
    const enemyHpPct = enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0;

    const combatAreaDropMaps = useMemo(
        () =>
            COMBAT_AREAS.map((area) => {
                const dropMap = new Map<string, number>();
                area.enemies.forEach((e) =>
                    e.drops.forEach((d) => {
                        dropMap.set(d.itemId, Math.max(dropMap.get(d.itemId) ?? 0, d.chance));
                    }),
                );
                return { areaId: area.id, dropMap };
            }),
        [],
    );

    const dungeonBossDrops = useMemo(
        () =>
            DUNGEONS.map((d) => {
                const boss = d.floors.find((f) => f.boss)?.boss ?? null;
                return { dungeonId: d.id, boss };
            }),
        [],
    );

    // Pills with combat effects in inventory
    const inventoryPills = useMemo(
        () =>
            ITEMS.filter((item) => item.category === "pill" && PILL_COMBAT_EFFECTS[item.id])
                .map((item) => ({
                    ...item,
                    qty: inventory.items[item.id] ?? 0,
                    effects: PILL_COMBAT_EFFECTS[item.id]!,
                }))
                .filter((p) => p.qty > 0),
        [inventory.items],
    );

    // Equipment items stored in inventory
    const inventoryEquipment = useMemo(
        () =>
            Object.entries(inventory.items)
                .filter(([id, qty]) => qty > 0 && !!getEquipment(id))
                .map(([id, qty]) => ({ def: getEquipment(id)!, qty })),
        [inventory.items],
    );

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="p-4 space-y-3">
            {/* Title */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-amber-400">⚔️ 战斗</h2>
                <div className="flex items-center gap-2">
                    {isInCombat && (
                        <Button variant="danger" size="sm" onClick={stopCombat}>
                            停止战斗
                        </Button>
                    )}
                    {isInDungeon && (
                        <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">副本进行中</span>
                    )}
                </div>
            </div>

            {/* Skill bar */}
            <div className="bg-slate-800 rounded-lg p-3">
                <SkillBar skillName="战斗" skill={skills.combat} icon="⚔️" />
            </div>

            {/* Collapsible: 战斗区域 / 副本 tabs */}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
                <button
                    onClick={() => setAreaExpanded(!areaExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    <span>{areaTab === "combat" ? "⚔️ 战斗区域" : "🏔️ 副本"}</span>
                    <span className="text-slate-400 text-xs">{areaExpanded ? "▲" : "▼"}</span>
                </button>
                {areaExpanded && (
                    <>
                        {/* Tab switcher */}
                        <div className="flex border-b border-slate-700">
                            {(["combat", "dungeon"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setAreaTab(tab)}
                                    className={`flex-1 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                                        areaTab === tab
                                            ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/5"
                                            : "text-slate-400 hover:text-slate-200"
                                    }`}
                                >
                                    {tab === "combat" ? "⚔️ 战斗区域" : "🏔️ 副本"}
                                </button>
                            ))}
                        </div>

                        {/* Combat areas */}
                        {areaTab === "combat" && (
                            <div className="p-2 space-y-2">
                                {COMBAT_AREAS.map((area) => {
                                    const unlocked = stageIndex >= area.requiredStage;
                                    const { dropMap } = combatAreaDropMaps.find((m) => m.areaId === area.id)!;
                                    const canFight = unlocked && activeActivity === null && spirit > 0;
                                    return (
                                        <div
                                            key={area.id}
                                            className={`p-3 rounded-lg border ${
                                                !unlocked
                                                    ? "border-slate-700 bg-slate-800/50 opacity-50"
                                                    : "border-slate-600 bg-slate-800"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-slate-200">
                                                        {area.icon} {area.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {area.description}
                                                    </div>
                                                    {unlocked ? (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {area.enemies.map((e) => `${e.icon}${e.name}`).join("、")} |{" "}
                                                            {(area.combatDurationMs / 1000).toFixed(0)}s/回合
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-red-400 mt-1">
                                                            需要境界:{" "}
                                                            {STAGES[area.requiredStage]?.name ?? area.requiredStage}
                                                        </div>
                                                    )}
                                                </div>
                                                {unlocked && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => startCombat(area.id)}
                                                        disabled={!canFight || isInCombat || isInDungeon}
                                                    >
                                                        {isInDungeon
                                                            ? "副本中"
                                                            : isInCombat
                                                              ? "战斗中"
                                                              : activeActivity !== null
                                                                ? "活动中"
                                                                : spirit <= 0
                                                                  ? "灵力不足"
                                                                  : "⚔️ 战斗"}
                                                    </Button>
                                                )}
                                            </div>
                                            {unlocked && dropMap.size > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {Array.from(dropMap.entries()).map(([itemId, chance]) => {
                                                        const itemDef = getItem(itemId);
                                                        return itemDef ? (
                                                            <span
                                                                key={itemId}
                                                                className="text-xs bg-slate-700/60 px-1.5 py-0.5 rounded text-amber-400"
                                                            >
                                                                {itemDef.emoji}
                                                                {itemDef.name} {(chance * 100).toFixed(0)}%
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Dungeons */}
                        {areaTab === "dungeon" && (
                            <div className="p-2 space-y-2">
                                <div className="flex justify-between text-xs text-slate-400 px-1">
                                    <span>副本通关总数</span>
                                    <span className="text-amber-300">{stats.totalDungeonClears}</span>
                                </div>
                                {DUNGEONS.map((d) => {
                                    const unlocked = stageIndex >= d.requiredStage;
                                    const runsToday = dungeon.dailyRuns[d.id] ?? 0;
                                    const canEnter =
                                        unlocked && runsToday < d.maxDailyRuns && activeActivity === null && spirit > 0;
                                    const boss = dungeonBossDrops.find((b) => b.dungeonId === d.id)?.boss ?? null;
                                    return (
                                        <div
                                            key={d.id}
                                            className={`p-3 rounded-lg border ${
                                                !unlocked
                                                    ? "border-slate-700 bg-slate-800/50 opacity-50"
                                                    : "border-slate-600 bg-slate-800"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-slate-200">
                                                        {d.icon} {d.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{d.description}</div>
                                                    {unlocked ? (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {d.floors.length}层 | 今日剩余: {d.maxDailyRuns - runsToday}
                                                            /{d.maxDailyRuns}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-red-400 mt-1">
                                                            需要境界: {STAGES[d.requiredStage]?.name ?? d.requiredStage}
                                                        </div>
                                                    )}
                                                </div>
                                                {unlocked && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => startDungeon(d.id)}
                                                        disabled={!canEnter}
                                                    >
                                                        {runsToday >= d.maxDailyRuns
                                                            ? "次数用完"
                                                            : activeActivity !== null
                                                              ? "有活动进行中"
                                                              : spirit <= 0
                                                                ? "灵力不足"
                                                                : "挑战"}
                                                    </Button>
                                                )}
                                            </div>
                                            {unlocked && (
                                                <div className="mt-2 flex gap-1">
                                                    {d.floors.map((floor, i) => (
                                                        <div
                                                            key={i}
                                                            className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-400"
                                                        >
                                                            {floor.floor}层
                                                            {floor.boss && (
                                                                <span className="text-red-400 ml-1">BOSS</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {unlocked && boss && boss.drops.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    <span className="text-xs text-red-400">BOSS:</span>
                                                    {boss.drops.map((drop) => {
                                                        const dropItem = getItem(drop.itemId);
                                                        return dropItem ? (
                                                            <span
                                                                key={drop.itemId}
                                                                className="text-xs bg-slate-700/60 px-1.5 py-0.5 rounded text-amber-400"
                                                            >
                                                                {dropItem.emoji}
                                                                {dropItem.name} {(drop.chance * 100).toFixed(0)}%
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Player (left) | Enemy (right) */}
            <div className="grid grid-cols-2 gap-3">
                {/* ─ Player column ─────────────────────────────────────────────────── */}
                <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">修士</div>

                    {/* Player identity */}
                    <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <div className="text-2xl">🧘</div>
                        <div className="text-sm font-medium text-blue-300 mt-0.5 leading-tight">
                            {STAGES[stageIndex]?.name}
                        </div>
                    </div>

                    {/* HP bar — always red */}
                    <div className="bg-slate-800 rounded-lg p-2 space-y-0.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-red-400">❤️ 生命</span>
                            <span className="text-slate-300">
                                {Math.floor(currentPlayerHp)}/{playerStats.maxHp}
                            </span>
                        </div>
                        <ProgressBar value={playerHpPct} color="bg-red-500" />
                    </div>

                    {/* Spirit bar */}
                    <div className="bg-slate-800 rounded-lg p-2 space-y-0.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-purple-400">✨ 灵力</span>
                            <span className="text-slate-300">
                                {Math.floor(spirit)}/{spiritMax}
                            </span>
                        </div>
                        <ProgressBar value={spiritPct} color="bg-purple-500" />
                    </div>

                    {/* Stats */}
                    <div className="bg-slate-800 rounded-lg p-2">
                        <div className="text-xs text-slate-400 font-medium mb-1">📊 属性</div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-red-400">⚔️ 攻击</span>
                                <span className="text-slate-200 font-semibold">{playerStats.attack}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-400">🛡️ 防御</span>
                                <span className="text-slate-200 font-semibold">{playerStats.defense}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-400">❤️ 上限</span>
                                <span className="text-slate-200 font-semibold">{playerStats.maxHp}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-amber-400">🏆 击杀</span>
                                <span className="text-slate-200 font-semibold">{combat.totalKills}</span>
                            </div>
                        </div>
                        {isInCombat && combat.loot.length > 0 && (
                            <div className="pt-1 border-t border-slate-700 mt-1">
                                <div className="text-xs text-slate-500 mb-0.5">最近掉落:</div>
                                <div className="flex flex-wrap gap-1">
                                    {combat.loot.map((item, idx) => {
                                        const itemDef = getItem(item.itemId);
                                        return (
                                            <span
                                                key={idx}
                                                className="text-xs bg-amber-900/30 px-1.5 py-0.5 rounded text-amber-300"
                                            >
                                                {itemDef?.name ?? item.itemId} ×{item.quantity}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Equipment 9-grid */}
                    <div className="bg-slate-800 rounded-lg p-2 space-y-1">
                        <div className="text-xs text-slate-400 font-medium">🛡️ 装备</div>
                        <div className="grid grid-cols-3 gap-1">
                            {EQUIPMENT_GRID.map(({ slot, label }) => {
                                const instance = equipment.equipped[slot];
                                const def = instance ? getEquipment(instance.defId) : null;
                                const isSelected = selectedGridSlot === slot;
                                return (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedGridSlot(isSelected ? null : slot)}
                                        className={`p-1 rounded-lg border text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[52px] ${
                                            isSelected
                                                ? "border-amber-500/50 bg-amber-500/10"
                                                : instance
                                                  ? "border-slate-500 bg-slate-800"
                                                  : "border-slate-700 bg-slate-800/50"
                                        }`}
                                    >
                                        <div className="text-sm">{def ? def.icon : ""}</div>
                                        {def ? (
                                            <div className="text-xs text-amber-400 leading-tight">{def.name}</div>
                                        ) : (
                                            <div className="text-xs text-slate-600 leading-tight">{label}</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedGridSlot &&
                            (() => {
                                const instance = equipment.equipped[selectedGridSlot];
                                const def = instance ? getEquipment(instance.defId) : null;
                                const slotInventoryEquip = inventoryEquipment.filter(
                                    (e) => e.def.slot === selectedGridSlot,
                                );
                                return (
                                    <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700 space-y-1">
                                        {def && instance ? (
                                            <>
                                                <EquipmentCard def={def} currentLevel={instance.level} />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        unequipItem(selectedGridSlot);
                                                        setSelectedGridSlot(null);
                                                    }}
                                                >
                                                    卸下
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="text-xs text-slate-500 text-center py-1">
                                                {getSlotLabel(selectedGridSlot)} — 未装备
                                            </div>
                                        )}
                                        {slotInventoryEquip.length > 0 && (
                                            <div className="space-y-1 pt-1 border-t border-slate-700">
                                                <div className="text-xs text-slate-400">背包中可装备:</div>
                                                {slotInventoryEquip.map(({ def: eDef, qty }) => (
                                                    <div
                                                        key={eDef.id}
                                                        className="flex items-center justify-between gap-1"
                                                    >
                                                        <span className="text-xs text-slate-300">
                                                            {eDef.icon} {eDef.name} ×{qty}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => {
                                                                equipFromInventory(eDef.id);
                                                                setSelectedGridSlot(null);
                                                            }}
                                                        >
                                                            装备
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                    </div>

                    {/* Supply (pills only) */}
                    <div className="bg-slate-800 rounded-lg p-2 space-y-1.5">
                        <div className="text-xs font-medium text-amber-400">🎒 战斗补给</div>

                        {/* HP pill */}
                        <div className="space-y-1">
                            <div className="text-xs text-red-400">❤️ 回血</div>
                            <select
                                value={combatSupply.config.hpItemId ?? ""}
                                onChange={(e) => updateCombatSupplyConfig({ hpItemId: e.target.value || null })}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-slate-200 text-xs"
                            >
                                <option value="">不使用</option>
                                {inventoryPills
                                    .filter((p) => p.effects.hpRecovery > 0)
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}({p.qty}) +{Math.round(p.effects.hpRecovery * 100)}%HP
                                        </option>
                                    ))}
                            </select>
                            {combatSupply.config.hpItemId && (
                                <div className="flex items-center gap-1 text-xs flex-wrap">
                                    <span className="text-slate-400">携带</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={99}
                                        value={combatSupply.config.hpItemCount}
                                        onChange={(e) =>
                                            updateCombatSupplyConfig({
                                                hpItemCount: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)),
                                            })
                                        }
                                        className="w-10 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-slate-200 text-xs"
                                    />
                                    <span className="text-slate-400">低于</span>
                                    <input
                                        type="number"
                                        min={5}
                                        max={95}
                                        value={combatSupply.config.hpThreshold}
                                        onChange={(e) =>
                                            updateCombatSupplyConfig({
                                                hpThreshold: Math.max(5, Math.min(95, parseInt(e.target.value) || 30)),
                                            })
                                        }
                                        className="w-10 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-slate-200 text-xs"
                                    />
                                    <span className="text-slate-400">%用</span>
                                </div>
                            )}
                        </div>

                        {/* Spirit pill */}
                        <div className="space-y-1">
                            <div className="text-xs text-purple-400">✨ 回灵</div>
                            <select
                                value={combatSupply.config.spiritItemId ?? ""}
                                onChange={(e) => updateCombatSupplyConfig({ spiritItemId: e.target.value || null })}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-slate-200 text-xs"
                            >
                                <option value="">不使用</option>
                                {inventoryPills
                                    .filter((p) => p.effects.spiritRecovery > 0)
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}({p.qty}) +{Math.round(p.effects.spiritRecovery * 100)}%灵
                                        </option>
                                    ))}
                            </select>
                            {combatSupply.config.spiritItemId && (
                                <div className="flex items-center gap-1 text-xs flex-wrap">
                                    <span className="text-slate-400">携带</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={99}
                                        value={combatSupply.config.spiritItemCount}
                                        onChange={(e) =>
                                            updateCombatSupplyConfig({
                                                spiritItemCount: Math.max(
                                                    1,
                                                    Math.min(99, parseInt(e.target.value) || 1),
                                                ),
                                            })
                                        }
                                        className="w-10 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-slate-200 text-xs"
                                    />
                                    <span className="text-slate-400">低于</span>
                                    <input
                                        type="number"
                                        min={5}
                                        max={95}
                                        value={combatSupply.config.spiritThreshold}
                                        onChange={(e) =>
                                            updateCombatSupplyConfig({
                                                spiritThreshold: Math.max(
                                                    5,
                                                    Math.min(95, parseInt(e.target.value) || 30),
                                                ),
                                            })
                                        }
                                        className="w-10 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-slate-200 text-xs"
                                    />
                                    <span className="text-slate-400">%用</span>
                                </div>
                            )}
                        </div>

                        {(isInCombat || isInDungeon) &&
                            (combatSupply.hpItemsUsed > 0 || combatSupply.spiritItemsUsed > 0) && (
                                <div className="text-xs text-slate-500">
                                    已用: {combatSupply.hpItemsUsed > 0 && `❤️×${combatSupply.hpItemsUsed} `}
                                    {combatSupply.spiritItemsUsed > 0 && `✨×${combatSupply.spiritItemsUsed}`}
                                </div>
                            )}
                    </div>
                </div>

                {/* ─ Enemy column ──────────────────────────────────────────────────── */}
                <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">对战目标</div>

                    {(isInCombat || isInDungeon) && currentEnemy ? (
                        <>
                            <div className="bg-slate-800 rounded-lg p-2 text-center">
                                <div className="text-2xl">{currentEnemy.icon}</div>
                                <div className="text-sm font-medium text-red-300 mt-0.5 leading-tight">
                                    {currentEnemy.name}
                                    {"isBoss" in currentEnemy && !!(currentEnemy as { isBoss?: boolean }).isBoss && (
                                        <span className="text-amber-400 ml-1">🔥BOSS</span>
                                    )}
                                </div>
                                {isInDungeon && activeDungeon && (
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {activeDungeon.icon} 第{dungeon.currentFloor}/{activeDungeon.floors.length}层
                                    </div>
                                )}
                                {isInCombat && activeArea && (
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {activeArea.icon} {activeArea.name}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-0.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-red-400">❤️ 敌方HP</span>
                                    <span className="text-slate-300">
                                        {Math.floor(enemyHp)}/{enemyMaxHp}
                                    </span>
                                </div>
                                <ProgressBar value={enemyHpPct} color="bg-red-500" />
                            </div>

                            {isInDungeon && activeDungeon && (
                                <div className="flex gap-0.5">
                                    {activeDungeon.floors.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 h-1.5 rounded-full ${
                                                i < dungeon.currentFloor - 1
                                                    ? "bg-green-500"
                                                    : i === dungeon.currentFloor - 1
                                                      ? "bg-red-500"
                                                      : "bg-slate-600"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="bg-slate-800 rounded-lg p-2">
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-red-400">⚔️ 攻击</span>
                                        <span className="text-slate-300">{currentEnemy.attack}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-400">🛡️ 防御</span>
                                        <span className="text-slate-300">{currentEnemy.defense}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-green-400">❤️ 上限</span>
                                        <span className="text-slate-300">{currentEnemy.hp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-amber-400">💰 灵石</span>
                                        <span className="text-slate-300">{currentEnemy.spiritStones}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px] text-center space-y-1 border border-slate-700">
                            {combat.lastCombatResult === "defeat" ? (
                                <>
                                    <div className="text-2xl">💀</div>
                                    <div className="text-xs text-red-400">被击败了</div>
                                    <div className="text-xs text-slate-500">提升境界或装备后再战</div>
                                </>
                            ) : dungeon.playerHp === 0 && dungeon.currentDungeonId ? (
                                <>
                                    <div className="text-2xl">💀</div>
                                    <div className="text-xs text-red-400">副本失败</div>
                                    <div className="text-xs text-slate-500">提升实力后再来</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl opacity-20">👾</div>
                                    <div className="text-xs text-slate-600">— 无对战目标 —</div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
