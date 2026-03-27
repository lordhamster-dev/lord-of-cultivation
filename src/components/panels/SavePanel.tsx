import { useRef, useState } from "react";
import type { GameState } from "../../core/types";
import { SaveManager } from "../../save/SaveManager";
import { useGameStore } from "../../store/gameStore";
import { Button } from "../ui/Button";

export function SavePanel() {
    const saveGame = useGameStore((s) => s.saveGame);
    const loadGame = useGameStore((s) => s.loadGame);
    const resetGame = useGameStore((s) => s.resetGame);
    const lastSaveTime = useGameStore((s) => s.lastSaveTime);

    const [base64Input, setBase64Input] = useState("");
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showMessage = (text: string, type: "success" | "error") => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSave = () => {
        saveGame();
        showMessage("存档成功！", "success");
    };

    const handleExportJSON = () => {
        const state = useGameStore.getState();
        SaveManager.exportJSON(state as GameState);
        showMessage("已导出存档文件", "success");
    };

    const handleExportBase64 = () => {
        const state = useGameStore.getState();
        const encoded = SaveManager.exportBase64(state as GameState);
        setBase64Input(encoded);
        navigator.clipboard.writeText(encoded).catch(() => {});
        showMessage("Base64 存档已复制到剪贴板", "success");
    };

    const handleImportBase64 = () => {
        try {
            const saved = SaveManager.importBase64(base64Input.trim());
            useGameStore.setState(saved);
            showMessage("Base64 存档导入成功！", "success");
        } catch {
            showMessage("导入失败：无效的 Base64 字符串", "error");
        }
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        SaveManager.importJSON(file)
            .then((saved) => {
                useGameStore.setState(saved);
                showMessage("存档文件导入成功！", "success");
            })
            .catch(() => showMessage("导入失败：无效的存档文件", "error"));
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleReset = () => {
        if (confirm("确定要重置存档吗？此操作不可撤销！")) {
            resetGame();
            showMessage("存档已重置", "success");
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-amber-400 font-bold text-xl">存档</h2>

            {message && (
                <div
                    className={`rounded-lg p-3 text-sm ${
                        message.type === "success"
                            ? "bg-green-900/50 text-green-300 border border-green-700"
                            : "bg-red-900/50 text-red-300 border border-red-700"
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Save status */}
            <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-slate-400 text-sm">
                    上次存档:{" "}
                    <span className="text-slate-200">
                        {lastSaveTime ? new Date(lastSaveTime).toLocaleString("zh-CN") : "无"}
                    </span>
                </p>
                <p className="text-slate-500 text-xs mt-1">每30秒自动存档</p>
            </div>

            {/* Manual save / load */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                <h3 className="text-slate-300 font-semibold mb-3">手动存档</h3>
                <div className="flex gap-2">
                    <Button variant="primary" onClick={handleSave} className="flex-1">
                        💾 存档
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            loadGame();
                            showMessage("存档已加载", "success");
                        }}
                        className="flex-1"
                    >
                        📂 读档
                    </Button>
                </div>
            </div>

            {/* Export / Import JSON */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                <h3 className="text-slate-300 font-semibold mb-3">导出 / 导入文件</h3>
                <Button variant="secondary" onClick={handleExportJSON} className="w-full">
                    📤 导出存档 (.json)
                </Button>
                <div>
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
                        📥 导入存档 (.json)
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileImport}
                    />
                </div>
            </div>

            {/* Base64 backup */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                <h3 className="text-slate-300 font-semibold mb-3">Base64 备份</h3>
                <Button variant="secondary" onClick={handleExportBase64} className="w-full">
                    📋 导出 Base64 (复制到剪贴板)
                </Button>
                <textarea
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder="粘贴 Base64 存档字符串..."
                    className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-xs text-slate-300 font-mono resize-none h-20 focus:outline-none focus:border-amber-500"
                />
                <Button
                    variant="secondary"
                    onClick={handleImportBase64}
                    disabled={!base64Input.trim()}
                    className="w-full"
                >
                    📥 导入 Base64
                </Button>
            </div>

            {/* Reset */}
            <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-red-400 font-semibold mb-3">危险操作</h3>
                <Button variant="danger" onClick={handleReset} className="w-full">
                    🗑️ 重置存档
                </Button>
            </div>
        </div>
    );
}
