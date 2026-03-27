interface ProgressBarProps {
    value: number; // 0–100
    label?: string;
    className?: string;
    color?: string;
}

export function ProgressBar({ value, label, className = "", color = "bg-amber-500" }: ProgressBarProps) {
    const clamped = Math.max(0, Math.min(100, value));
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{label}</span>
                    <span>{clamped.toFixed(1)}%</span>
                </div>
            )}
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                    className={`${color} h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${clamped}%` }}
                    role="progressbar"
                    aria-valuenow={clamped}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
}
