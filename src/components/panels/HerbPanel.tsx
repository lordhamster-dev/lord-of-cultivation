import { useState } from "react";
import { HERBS, PLOT_UNLOCK_COSTS } from "../../core/data/herbs";
import { getGrowthProgress } from "../../core/systems/HerbSystem";
import type { HerbPlot } from "../../core/types";
import { useGameStore } from "../../store/gameStore";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { SkillBar } from "../ui/SkillBar";

function PlotCard({
    plot,
    farmingLevel,
    inventoryItems,
    onPlant,
    onHarvest,
    onUnlock,
    plotIndex,
}: {
    plot: HerbPlot;
    farmingLevel: number;
    inventoryItems: Record<string, number>;
    onPlant: (plotId: string, herbId: string) => void;
    onHarvest: (plotId: string) => void;
    onUnlock: (index: number) => void;
    plotIndex: number;
}) {
    const [selecting, setSelecting] = useState(false);
    const now = Date.now();
    const progress = getGrowthProgress(plot, now);

    if (!plot.isUnlocked) {
        const cost = PLOT_UNLOCK_COSTS[plotIndex];
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col items-center justify-center gap-2 min-h-[120px]">
                <span className="text-slate-500 text-sm">🔒 未解锁</span>
                {cost && (
                    <div className="text-xs text-slate-500 text-center">
                        需要: 农耕 Lv.{cost.levelRequired}
                        {cost.spiritStones > 0 && ` / ${cost.spiritStones.toLocaleString()} 灵石`}
                    </div>
                )}
                <Button variant="secondary" onClick={() => onUnlock(plotIndex)} className="text-xs">
                    解锁
                </Button>
            </div>
        );
    }

    if (plot.isReady) {
        const herb = HERBS.find((h) => h.id === plot.herbId);
        return (
            <div className="bg-slate-800 border border-green-600/50 rounded-lg p-3 flex flex-col items-center justify-center gap-2 min-h-[120px]">
                <span className="text-2xl">✨</span>
                <span className="text-green-400 text-sm font-semibold">{herb?.name ?? ""} 成熟</span>
                <Button variant="primary" onClick={() => onHarvest(plot.id)} className="text-xs">
                    收获
                </Button>
            </div>
        );
    }

    if (plot.herbId) {
        const herb = HERBS.find((h) => h.id === plot.herbId);
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 flex flex-col gap-2 min-h-[120px]">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🌱</span>
                    <span className="text-sm text-slate-300">{herb?.name ?? ""}</span>
                </div>
                <ProgressBar value={progress} color="bg-green-500" label={`${Math.floor(progress)}%`} />
            </div>
        );
    }

    // Empty plot
    if (selecting) {
        const availableHerbs = HERBS.filter(
            (h) => h.farmingLevelRequired <= farmingLevel || (inventoryItems[h.seedItemId] ?? 0) > 0,
        );
        return (
            <div className="bg-slate-800 border border-amber-600/40 rounded-lg p-3 flex flex-col gap-2 min-h-[120px]">
                <div className="text-xs text-slate-400 mb-1">选择种子:</div>
                {availableHerbs.length === 0 ? (
                    <div className="text-xs text-slate-500">暂无可种植的草药</div>
                ) : (
                    availableHerbs.map((herb) => (
                        <button
                            type="button"
                            key={herb.id}
                            onClick={() => {
                                onPlant(plot.id, herb.id);
                                setSelecting(false);
                            }}
                            className="text-xs text-left text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                            🌿 {herb.name} (Lv.{herb.farmingLevelRequired})
                        </button>
                    ))
                )}
                <button
                    type="button"
                    onClick={() => setSelecting(false)}
                    className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                    取消
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <span className="text-slate-500 text-sm">空地块</span>
            <Button variant="secondary" onClick={() => setSelecting(true)} className="text-xs">
                种植
            </Button>
        </div>
    );
}

export function HerbPanel() {
    const herbPlots = useGameStore((s) => s.herbPlots);
    const skills = useGameStore((s) => s.skills);
    const inventory = useGameStore((s) => s.inventory);
    const plantHerb = useGameStore((s) => s.plantHerb);
    const harvestHerb = useGameStore((s) => s.harvestHerb);
    const unlockHerbPlot = useGameStore((s) => s.unlockHerbPlot);

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-amber-400">🌿 灵药种植</h2>

            <div className="bg-slate-800 rounded-lg p-3">
                <SkillBar skillName="农耕" skill={skills.farming} icon="🌾" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {herbPlots.map((plot, i) => (
                    <PlotCard
                        key={plot.id}
                        plot={plot}
                        plotIndex={i}
                        farmingLevel={skills.farming.level}
                        inventoryItems={inventory.items}
                        onPlant={plantHerb}
                        onHarvest={harvestHerb}
                        onUnlock={unlockHerbPlot}
                    />
                ))}
            </div>
        </div>
    );
}
