import { useGameStore } from "../../store/gameStore";

const VERSION = "1.0.0";

export function Footer() {
    const lastSaveTime = useGameStore((s) => s.lastSaveTime);

    const saveText = lastSaveTime ? `上次存档: ${new Date(lastSaveTime).toLocaleTimeString("zh-CN")}` : "未存档";

    return (
        <footer className="bg-slate-900 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
            <span>v{VERSION}</span>
            <span>{saveText}</span>
        </footer>
    );
}
