import { useEffect, useState } from "react";
import type { EquipmentDef } from "../../core/data/equipment";
import { EQUIPMENT, getEquipmentTotalStats } from "../../core/data/equipment";
import { getItem } from "../../core/data/items";
import { STAGES } from "../../core/data/stages";
import { canForge } from "../../core/systems/EquipmentSystem";
import { selectSpiritStones, useGameStore } from "../../store/gameStore";
import { Button } from "../ui/Button";
import { NumberDisplay } from "../ui/NumberDisplay";
import { SkillBar } from "../ui/SkillBar";

type SlotFilter = "all" | "necklace" | "helmet" | "amulet" | "glove" | "armor" | "ring" | "boots";

const SLOT_FILTERS: { id: SlotFilter; label: string }[] = [
    { id: "all", label: "全部" },
    { id: "necklace", label: "项链" },
    { id: "helmet", label: "头盔" },
    { id: "amulet", label: "护身符" },
    { id: "glove", label: "手套" },
    { id: "armor", label: "盔甲" },
    { id: "ring", label: "戒指" },
    { id: "boots", label: "靴子" },
];

function matchesFilter(def: EquipmentDef, filter: SlotFilter): boolean {
    if (filter === "all") return true;
    if (filter === "glove") return def.slot === "glove_left" || def.slot === "glove_right";
    if (filter === "ring") return def.slot === "ring_left" || def.slot === "ring_right";
    return def.slot === filter;
}

function StatDisplay({ label, value }: { label: string; value: number | undefined }) {
    if (!value) return null;
    return (
        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
            {label} +{typeof value === "number" && value < 1 ? `${(value * 100).toFixed(0)}%` : value}
        </span>
    );
}

function EquipmentCard({ def }: { def: EquipmentDef }) {
    const stats = getEquipmentTotalStats(def.id, 0);
    return (
        <div className="p-2 rounded border border-slate-600 bg-slate-800 h-full">
            <div className="flex items-center gap-2">
                <span className="text-lg">{def.icon}</span>
                <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{def.name}</div>
                    <div className="text-xs text-slate-500 truncate">{def.description}</div>
                </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
                <StatDisplay label="⚔️" value={stats.attack} />
                <StatDisplay label="🛡️" value={stats.defense} />
                <StatDisplay label="❤️" value={stats.hp} />
                <StatDisplay label="🧘" value={stats.meditationPercent} />
            </div>
        </div>
    );
}

export function ForgePanel() {
    const skills = useGameStore((s) => s.skills);
    const stageIndex = useGameStore((s) => s.cultivation.stageIndex);
    const inventory = useGameStore((s) => s.inventory);
    const spiritStones = useGameStore(selectSpiritStones);
    const forgeEquipment = useGameStore((s) => s.forgeEquipment);

    const forgingLevel = skills.forging.level;

    const [slotFilter, setSlotFilter] = useState<SlotFilter>("all");
    const [selectedForge, setSelectedForge] = useState<string | null>(null);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const id = setInterval(() => forceUpdate((n) => n + 1), 500);
        return () => clearInterval(id);
    }, []);

    const filteredEquipment = EQUIPMENT.filter((def) => matchesFilter(def, slotFilter));

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-amber-400">🔨 炼器</h2>

            <div className="bg-slate-800 rounded-lg p-3">
                <SkillBar skillName="炼器" skill={skills.forging} icon="🔨" />
            </div>

            <div className="text-xs text-slate-500 bg-slate-800/60 rounded px-2 py-1">
                炼制的装备将进入背包，可从背包或战斗页面装备
            </div>

            {/* Type filter */}
            <div className="flex gap-1 flex-wrap">
                {SLOT_FILTERS.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setSlotFilter(f.id)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                            slotFilter === f.id
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "text-slate-400 border border-slate-600 hover:text-slate-200"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Equipment grid */}
            <div className="grid grid-cols-2 gap-2">
                {filteredEquipment.map((def) => {
                    const isLevelLocked = forgingLevel < def.forgingRecipe.forgingLevelRequired;
                    const isStageLocked = stageIndex < def.requiredStage;
                    const locked = isLevelLocked || isStageLocked;
                    const isForgeAvailable = canForge(def, inventory, spiritStones, forgingLevel, stageIndex);
                    const isSelected = selectedForge === def.id;
                    const inInventory = inventory.items[def.id] ?? 0;

                    return (
                        <div key={def.id}>
                            <button
                                onClick={() => !locked && setSelectedForge(isSelected ? null : def.id)}
                                className={`w-full text-left rounded-lg border transition-colors cursor-pointer ${
                                    locked
                                        ? "border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed"
                                        : isSelected
                                          ? "border-amber-500/50 bg-amber-500/10"
                                          : "border-slate-600 bg-slate-800 hover:border-slate-500"
                                }`}
                            >
                                <EquipmentCard def={def} />
                                {locked && (
                                    <div className="px-2 pb-2 text-xs text-red-400">
                                        {isStageLocked
                                            ? `需境界: ${STAGES[def.requiredStage]?.name}`
                                            : `需炼器 Lv.${def.forgingRecipe.forgingLevelRequired}`}
                                    </div>
                                )}
                                {!locked && inInventory > 0 && (
                                    <div className="px-2 pb-1 text-xs text-green-400">背包 ×{inInventory}</div>
                                )}
                            </button>

                            {isSelected && !locked && (
                                <div className="mt-1 bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700">
                                    <div className="text-xs text-slate-400">所需材料:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {def.forgingRecipe.ingredients.map((ing, i) => {
                                            const item = getItem(ing.itemId);
                                            const have = inventory.items[ing.itemId] ?? 0;
                                            const enough = have >= ing.quantity;
                                            return (
                                                <span
                                                    key={i}
                                                    className={`text-xs px-2 py-0.5 rounded ${enough ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}
                                                >
                                                    {item?.name ?? ing.itemId} {have}/{ing.quantity}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        灵石:{" "}
                                        <span
                                            className={
                                                spiritStones >= def.forgingRecipe.spiritStones
                                                    ? "text-amber-300"
                                                    : "text-red-400"
                                            }
                                        >
                                            <NumberDisplay value={def.forgingRecipe.spiritStones} />
                                        </span>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            if (forgeEquipment(def.id)) setSelectedForge(null);
                                        }}
                                        disabled={!isForgeAvailable}
                                        className="w-full"
                                    >
                                        🔨 炼制（进背包）
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredEquipment.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-6">暂无该类型装备</div>
            )}
        </div>
    );
}
