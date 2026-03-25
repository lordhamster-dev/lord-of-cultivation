import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ProgressBar } from '../ui/ProgressBar';
import { SkillBar } from '../ui/SkillBar';
import { Button } from '../ui/Button';
import { ALCHEMY_RECIPES } from '../../core/data/recipes';
import { getAlchemyDuration, getActualFailChance, canCraft } from '../../core/systems/AlchemySystem';
import { getItem } from '../../core/data/items';
import { STAGES } from '../../core/data/stages';

export function AlchemyPanel() {
  const alchemy = useGameStore(s => s.alchemy);
  const skills = useGameStore(s => s.skills);
  const inventory = useGameStore(s => s.inventory);
  const cultivation = useGameStore(s => s.cultivation);
  const startAlchemy = useGameStore(s => s.startAlchemy);
  const stopAlchemy = useGameStore(s => s.stopAlchemy);
  const alchemyLevel = skills.alchemy.level;

  const [selectedRecipe, setSelectedRecipe] = useState(ALCHEMY_RECIPES[0].id);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 500);
    return () => clearInterval(id);
  }, []);

  const activeRecipe = alchemy.currentRecipeId
    ? ALCHEMY_RECIPES.find(r => r.id === alchemy.currentRecipeId)
    : null;

  const duration = activeRecipe ? getAlchemyDuration(activeRecipe, alchemyLevel) : 0;
  const progress = duration > 0 ? Math.min(100, (alchemy.progressMs / duration) * 100) : 0;

  const selected = ALCHEMY_RECIPES.find(r => r.id === selectedRecipe);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-amber-400">⚗️ 炼丹</h2>

      <div className="bg-slate-800 rounded-lg p-3">
        <SkillBar skillName="炼丹" skill={skills.alchemy} icon="⚗️" />
      </div>

      {alchemy.isActive && activeRecipe ? (
        <div className="space-y-3">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-amber-300 font-medium">⚗️ 炼制 {activeRecipe.name}...</span>
              <span className="text-xs text-slate-400">总计 {alchemy.totalPillsCrafted} 颗</span>
            </div>
            <ProgressBar value={progress} color="bg-purple-500" label={`${Math.floor(progress)}%`} />
          </div>
          <Button variant="danger" onClick={stopAlchemy} className="w-full">
            停止炼丹
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-slate-400">选择丹方:</div>
          <div className="space-y-2">
            {ALCHEMY_RECIPES.map(recipe => {
              const locked = alchemyLevel < recipe.alchemyLevelRequired
                || cultivation.stageIndex < recipe.cultivationStageRequired;
              const craftable = !locked && canCraft(recipe, inventory);
              return (
                <button
                  key={recipe.id}
                  onClick={() => !locked && setSelectedRecipe(recipe.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                    locked
                      ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                      : selectedRecipe === recipe.id
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className={`font-medium ${locked ? 'text-slate-500' : 'text-slate-200'}`}>
                      💊 {recipe.name}
                    </span>
                    {locked ? (
                      <span className="text-xs text-slate-500">
                        需要: 炼丹 Lv.{recipe.alchemyLevelRequired}
                        {recipe.cultivationStageRequired > 0 && ` / ${STAGES[recipe.cultivationStageRequired]?.name ?? ''}`}
                      </span>
                    ) : (
                      <span className={`text-xs ${craftable ? 'text-green-400' : 'text-red-400'}`}>
                        {craftable ? '可炼制' : '材料不足'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{recipe.description}</div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-amber-300">💊 {selected.name}</div>
              <div className="text-xs text-slate-400">{selected.description}</div>
              <div className="space-y-1 mt-2">
                <div className="text-xs text-slate-400">所需材料:</div>
                {selected.ingredients.map(ing => {
                  const item = getItem(ing.itemId);
                  const have = inventory.items[ing.itemId] ?? 0;
                  const enough = have >= ing.quantity;
                  return (
                    <div key={ing.itemId} className={`text-xs flex justify-between ${enough ? 'text-slate-300' : 'text-red-400'}`}>
                      <span>{item?.name ?? ing.itemId}</span>
                      <span>{have}/{ing.quantity}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                失败率: {(getActualFailChance(selected, alchemyLevel) * 100).toFixed(0)}% |
                产出: {selected.outputQuantity[0]}-{selected.outputQuantity[1]} 颗
              </div>
              <Button
                variant="primary"
                onClick={() => startAlchemy(selected.id)}
                className="w-full mt-2"
                disabled={alchemyLevel < selected.alchemyLevelRequired || !canCraft(selected, inventory)}
              >
                开始炼制
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
