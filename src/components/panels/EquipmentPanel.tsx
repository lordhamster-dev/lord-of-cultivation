import { useState } from "react";
import type { EquipmentDef } from "../../core/data/equipment";
import {
    EQUIPMENT,
    getEnhanceCost,
    getEnhanceMaterials,
    getEquipment,
    getEquipmentTotalStats,
} from "../../core/data/equipment";
import { getItem } from "../../core/data/items";
import { canEnhance, canForge } from "../../core/systems/EquipmentSystem";
import type { EquipmentSlotId } from "../../core/types";
import { selectSpiritStones, useGameStore } from "../../store/gameStore";
import { Button } from "../ui/Button";
import { NumberDisplay } from "../ui/NumberDisplay";
import { SkillBar } from "../ui/SkillBar";

function StatDisplay({ label, value }: { label: string; value: number | undefined }) {
    if (!value) return null;
    return (
        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
            {label} +{typeof value === "number" && value < 1 ? `${(value * 100).toFixed(0)}%` : value}
        </span>
    );
}

function EquipmentCard({
    def,
    isEquipped,
    currentLevel,
}: {
    def: EquipmentDef;
    isEquipped: boolean;
    currentLevel: number;
}) {
    const stats = getEquipmentTotalStats(def.id, currentLevel);
    return (
        <div
            className={`p-3 rounded-lg border ${
                isEquipped ? "border-amber-500/50 bg-amber-500/10" : "border-slate-600 bg-slate-800"
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{def.icon}</span>
                    <div>
                        <div className="text-sm font-medium text-slate-200">
                            {def.name}
                            {currentLevel > 0 && <span className="text-amber-400 ml-1">+{currentLevel}</span>}
                        </div>
                        <div className="text-xs text-slate-500">{def.description}</div>
                    </div>
                </div>
                {isEquipped && (
                    <span className="text-xs bg-amber-600/30 text-amber-400 px-2 py-0.5 rounded">装备中</span>
                )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                <StatDisplay label="⚔️攻击" value={stats.attack} />
                <StatDisplay label="🛡️防御" value={stats.defense} />
                <StatDisplay label="❤️生命" value={stats.hp} />
                <StatDisplay label="🧘打坐" value={stats.meditationPercent} />
            </div>
        </div>
    );
}

type TabId = "forge" | "equipped" | "enhance";

export function EquipmentPanel() {
    const skills = useGameStore((s) => s.skills);
    const equipment = useGameStore((s) => s.equipment);
    const inventory = useGameStore((s) => s.inventory);
    const spiritStones = useGameStore(selectSpiritStones);
    const stageIndex = useGameStore((s) => s.cultivation.stageIndex);
    const forgeEquipment = useGameStore((s) => s.forgeEquipment);
    const enhanceEquipment = useGameStore((s) => s.enhanceEquipment);
    const forgingLevel = skills.forging.level;

    const [activeTab, setActiveTab] = useState<TabId>("forge");
    const [selectedForge, setSelectedForge] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<EquipmentSlotId | null>(null);

    const tabs: { id: TabId; label: string }[] = [
        { id: "forge", label: "🔨 炼器" },
        { id: "equipped", label: "👤 装备" },
        { id: "enhance", label: "⬆️ 强化" },
    ];

    const equippedSlots: { slot: EquipmentSlotId; label: string; icon: string }[] = [
        { slot: "glove_left", label: "左手", icon: "🧤" },
        { slot: "armor", label: "盔甲", icon: "🛡️" },
        { slot: "necklace", label: "项链", icon: "📿" },
    ];

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-amber-400">🔨 炼器</h2>

            <div className="bg-slate-800 rounded-lg p-3">
                <SkillBar skillName="炼器" skill={skills.forging} icon="🔨" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                            activeTab === tab.id
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "text-slate-400 border border-slate-600 hover:text-slate-200"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Forge Tab */}
            {activeTab === "forge" && (
                <div className="space-y-3">
                    <div className="text-sm text-slate-400">选择要炼制的装备:</div>
                    <div className="space-y-2">
                        {EQUIPMENT.map((def) => {
                            const isForgeAvailable = canForge(def, inventory, spiritStones, forgingLevel, stageIndex);
                            const isLevelLocked = forgingLevel < def.forgingRecipe.forgingLevelRequired;
                            const isStageLocked = stageIndex < def.requiredStage;
                            const isSelected = selectedForge === def.id;

                            // Check if already equipped in this slot
                            const currentEquipped = equipment.equipped[def.slot];
                            const isAlreadyEquipped = currentEquipped?.defId === def.id;

                            return (
                                <div key={def.id}>
                                    <button
                                        onClick={() => setSelectedForge(isSelected ? null : def.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                                            isLevelLocked || isStageLocked
                                                ? "border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed"
                                                : isSelected
                                                  ? "border-amber-500/50 bg-amber-500/10"
                                                  : "border-slate-600 bg-slate-800 hover:border-slate-500"
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
                                                <div className="text-slate-500">
                                                    {def.slot === "armor"
                                                        ? "盔甲"
                                                        : def.slot === "glove_left" || def.slot === "glove_right"
                                                          ? "手套"
                                                          : def.slot}
                                                </div>
                                                {isAlreadyEquipped && <div className="text-amber-400">已装备</div>}
                                            </div>
                                        </div>
                                        {(isLevelLocked || isStageLocked) && (
                                            <div className="text-xs text-red-400 mt-1">
                                                {isStageLocked
                                                    ? `需要境界 ${def.requiredStage + 1}`
                                                    : `需要炼器 Lv.${def.forgingRecipe.forgingLevelRequired}`}
                                            </div>
                                        )}
                                    </button>

                                    {/* Expanded forge details */}
                                    {isSelected && !isLevelLocked && !isStageLocked && (
                                        <div className="ml-4 mt-2 bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700">
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
                                                onClick={() => forgeEquipment(def.id)}
                                                disabled={!isForgeAvailable}
                                                className="w-full"
                                            >
                                                {isAlreadyEquipped ? "🔨 重新炼制（覆盖）" : "🔨 炼制"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Equipped Tab */}
            {activeTab === "equipped" && (
                <div className="space-y-3">
                    {equippedSlots.map(({ slot, label, icon }) => {
                        const instance = equipment.equipped[slot];
                        const def = instance ? getEquipment(instance.defId) : null;
                        return (
                            <div key={slot} className="bg-slate-800 rounded-lg p-3">
                                <div className="text-xs text-slate-500 mb-1">
                                    {icon} {label}
                                </div>
                                {def && instance ? (
                                    <EquipmentCard def={def} isEquipped={true} currentLevel={instance.level} />
                                ) : (
                                    <div className="text-sm text-slate-600 text-center py-3">— 未装备 —</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Enhance Tab */}
            {activeTab === "enhance" && (
                <div className="space-y-3">
                    <div className="text-sm text-slate-400">选择要强化的装备:</div>
                    {equippedSlots.map(({ slot }) => {
                        const instance = equipment.equipped[slot];
                        if (!instance) return null;
                        const def = getEquipment(instance.defId);
                        if (!def) return null;

                        const isMaxLevel = instance.level >= def.maxLevel;
                        const enhanceable = canEnhance(instance, inventory, spiritStones);
                        const cost = isMaxLevel ? 0 : getEnhanceCost(def, instance.level);
                        const materials = isMaxLevel ? [] : getEnhanceMaterials(def, instance.level);
                        const isSelected = selectedSlot === slot;

                        return (
                            <div key={slot}>
                                <button
                                    onClick={() => setSelectedSlot(isSelected ? null : slot)}
                                    className="w-full text-left"
                                >
                                    <EquipmentCard def={def} isEquipped={true} currentLevel={instance.level} />
                                </button>

                                {isSelected && (
                                    <div className="ml-4 mt-2 bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700">
                                        {isMaxLevel ? (
                                            <div className="text-sm text-amber-400 text-center">
                                                ✨ 已达最高强化等级
                                            </div>
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
                                                            <span
                                                                key={i}
                                                                className={`text-xs px-2 py-0.5 rounded ${enough ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}
                                                            >
                                                                {item?.name ?? mat.itemId} {have}/{mat.quantity}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    灵石:{" "}
                                                    <span
                                                        className={
                                                            spiritStones >= cost ? "text-amber-300" : "text-red-400"
                                                        }
                                                    >
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
                    {!equippedSlots.some((s) => equipment.equipped[s.slot]) && (
                        <div className="text-sm text-slate-600 text-center py-4">暂无装备可强化，请先去炼器</div>
                    )}
                </div>
            )}

            {/* Stats summary */}
            <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">已炼制装备</span>
                    <span className="text-amber-300">{equipment.totalForged}</span>
                </div>
            </div>
        </div>
    );
}
