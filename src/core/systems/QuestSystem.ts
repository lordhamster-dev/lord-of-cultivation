import { getDailyQuests, getDateSeed, getTodayString, QUEST_POOL } from "../data/quests";
import type { DailyQuestState, Inventory } from "../types";

export function createInitialQuestState(): DailyQuestState {
    const today = getTodayString();
    const seed = getDateSeed(today);
    const dailyQuests = getDailyQuests(seed);
    return {
        date: today,
        quests: dailyQuests.map((q) => ({
            questId: q.id,
            current: 0,
            completed: false,
            claimed: false,
        })),
        dailySpiritStonesEarned: 0,
    };
}

/** Refresh quests if it's a new day */
export function refreshDailyQuestsIfNeeded(state: DailyQuestState): DailyQuestState {
    const today = getTodayString();
    if (state.date === today) return state;

    // New day — reset quests
    const seed = getDateSeed(today);
    const dailyQuests = getDailyQuests(seed);
    return {
        date: today,
        quests: dailyQuests.map((q) => ({
            questId: q.id,
            current: 0,
            completed: false,
            claimed: false,
        })),
        dailySpiritStonesEarned: 0,
    };
}

/** Update quest progress based on recent incremental events */
export interface QuestEventData {
    fishCaught?: number;
    herbsHarvested?: number;
    pillsCrafted?: number;
    spiritStonesEarned?: number;
}

export function updateQuestProgress(state: DailyQuestState, events: QuestEventData): DailyQuestState {
    const updated = {
        ...state,
        dailySpiritStonesEarned: state.dailySpiritStonesEarned + (events.spiritStonesEarned ?? 0),
        quests: state.quests.map((qp) => {
            if (qp.completed) return qp;
            const def = QUEST_POOL.find((q) => q.id === qp.questId);
            if (!def) return qp;

            let increment = 0;
            switch (def.type) {
                case "fish":
                    increment = events.fishCaught ?? 0;
                    break;
                case "herb":
                    increment = events.herbsHarvested ?? 0;
                    break;
                case "alchemy":
                    increment = events.pillsCrafted ?? 0;
                    break;
                case "spiritStones":
                    // handled separately below
                    break;
            }

            const newCurrent = qp.current + increment;
            const completed = newCurrent >= def.target;
            return { ...qp, current: Math.min(newCurrent, def.target), completed };
        }),
    };

    // Re-check spiritStones quests against cumulative
    updated.quests = updated.quests.map((qp) => {
        if (qp.completed) return qp;
        const def = QUEST_POOL.find((q) => q.id === qp.questId);
        if (!def || def.type !== "spiritStones") return qp;
        const current = updated.dailySpiritStonesEarned;
        return { ...qp, current: Math.min(current, def.target), completed: current >= def.target };
    });

    return updated;
}

/** Apply quest reward to inventory */
export function claimQuestReward(questId: string, inventory: Inventory): { updatedInventory: Inventory } {
    const def = QUEST_POOL.find((q) => q.id === questId);
    if (!def) return { updatedInventory: inventory };

    const newItems = { ...inventory.items };
    if (def.reward.items) {
        for (const rewardItem of def.reward.items) {
            newItems[rewardItem.itemId] = (newItems[rewardItem.itemId] ?? 0) + rewardItem.quantity;
        }
    }

    return {
        updatedInventory: { ...inventory, items: newItems },
    };
}
