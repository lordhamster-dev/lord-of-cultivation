import { selectStage, useGameStore } from "../../store/gameStore";

export function Header() {
    const stage = useGameStore(selectStage);
    const totalAscensions = useGameStore((s) => s.cultivation.totalAscensions);

    return (
        <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-2xl">☯</span>
                <div>
                    <h1 className="text-amber-400 font-bold text-lg leading-tight">修炼之主</h1>
                    <p className="text-slate-400 text-xs">Lord of Cultivation</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-amber-300 font-semibold">{stage?.name ?? "练气"}</div>
                {totalAscensions > 0 && <div className="text-slate-400 text-xs">飞升 ×{totalAscensions}</div>}
            </div>
        </header>
    );
}
