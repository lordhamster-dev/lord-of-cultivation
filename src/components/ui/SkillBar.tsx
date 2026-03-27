import { getExpForLevel, MAX_SKILL_LEVEL } from "../../core/systems/SkillSystem";
import type { SkillState } from "../../core/types";
import { ProgressBar } from "./ProgressBar";

interface SkillBarProps {
    skillName: string;
    skill: SkillState;
    icon?: string;
}

export function SkillBar({ skillName, skill, icon }: SkillBarProps) {
    const currentLevelExp = getExpForLevel(skill.level);
    const nextLevelExp = skill.level < MAX_SKILL_LEVEL ? getExpForLevel(skill.level + 1) : currentLevelExp;
    const progress =
        nextLevelExp > currentLevelExp ? ((skill.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100 : 100;

    return (
        <div className="flex items-center gap-3">
            {icon && <span className="text-xl">{icon}</span>}
            <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="font-medium text-slate-300">{skillName}</span>
                    <span>
                        Lv.{skill.level}{" "}
                        {skill.level < MAX_SKILL_LEVEL
                            ? `(${skill.exp - currentLevelExp}/${nextLevelExp - currentLevelExp})`
                            : "(MAX)"}
                    </span>
                </div>
                <ProgressBar value={Math.min(100, progress)} color="bg-green-500" />
            </div>
        </div>
    );
}
