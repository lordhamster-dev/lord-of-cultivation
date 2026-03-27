import { getItem } from "../../core/data/items";
import { getTodayString, QUEST_POOL } from "../../core/data/quests";
import { useGameStore } from "../../store/gameStore";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";

export function QuestPanel() {
    const dailyQuests = useGameStore((s) => s.dailyQuests);
    const claimQuest = useGameStore((s) => s.claimQuest);

    const today = getTodayString();

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-amber-400">📋 日常任务</h2>

            <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">📅 {today} — 任务每日重置</div>

            <div className="space-y-3">
                {dailyQuests.quests.map((qp) => {
                    const def = QUEST_POOL.find((q) => q.id === qp.questId);
                    if (!def) return null;
                    const progress = Math.min(100, (qp.current / def.target) * 100);

                    return (
                        <div
                            key={qp.questId}
                            className={`bg-slate-800 border rounded-lg p-4 space-y-3 ${
                                qp.claimed
                                    ? "border-slate-700 opacity-60"
                                    : qp.completed
                                      ? "border-amber-600/50"
                                      : "border-slate-600"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{def.icon}</span>
                                    <div>
                                        <div className="font-medium text-slate-200 text-sm">{def.name}</div>
                                        <div className="text-xs text-slate-400">{def.description}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400">
                                    {qp.claimed ? "✅ 已领取" : `${qp.current}/${def.target}`}
                                </div>
                            </div>

                            {!qp.claimed && (
                                <ProgressBar
                                    value={progress}
                                    color={qp.completed ? "bg-amber-500" : "bg-blue-500"}
                                    label={`${Math.floor(progress)}%`}
                                />
                            )}

                            {/* Rewards */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-500">奖励:</span>
                                {def.reward.items?.map((item) => {
                                    const itemDef = getItem(item.itemId);
                                    return (
                                        <span
                                            key={item.itemId}
                                            className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                                        >
                                            {itemDef?.name ?? item.itemId} ×{item.quantity}
                                        </span>
                                    );
                                })}
                            </div>

                            {qp.completed && !qp.claimed && (
                                <Button variant="primary" onClick={() => claimQuest(qp.questId)} className="w-full">
                                    🎁 领取奖励
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="text-xs text-slate-500 text-center">完成任务可获得灵石、物品奖励，每日任务次日自动刷新</div>
        </div>
    );
}
