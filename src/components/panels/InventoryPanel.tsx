import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ItemSlot } from '../ui/ItemSlot';
import { Button } from '../ui/Button';
import { ITEMS } from '../../core/data/items';
import type { ItemDef } from '../../core/data/items';

type CategoryFilter = 'all' | ItemDef['category'];

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'currency', label: '货币' },
  { id: 'herb', label: '药草' },
  { id: 'seed', label: '种子' },
  { id: 'fish', label: '鱼' },
  { id: 'pill', label: '丹药' },
  { id: 'material', label: '材料' },
];

export function InventoryPanel() {
  const inventory = useGameStore(s => s.inventory);
  const useItem = useGameStore(s => s.useItem);
  const sellItem = useGameStore(s => s.sellItem);
  const gatheringPillEndTime = useGameStore(s => s.gatheringPillEndTime);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [sellQty, setSellQty] = useState(1);

  const isPillActive = Date.now() < gatheringPillEndTime;
  const remainingSecs = isPillActive ? Math.ceil((gatheringPillEndTime - Date.now()) / 1000) : 0;

  const entries = Object.entries(inventory.items).filter(([, qty]) => qty > 0);
  const filtered = entries.filter(([itemId]) => {
    if (filter === 'all') return true;
    const item = ITEMS.find(i => i.id === itemId);
    return item?.category === filter;
  });

  const selectedItem = selected ? ITEMS.find(i => i.id === selected) : null;
  const selectedQty = selected ? (inventory.items[selected] ?? 0) : 0;

  const handleSell = () => {
    if (!selected || !selectedItem) return;
    const qty = Math.min(sellQty, selectedQty);
    if (qty > 0) {
      sellItem(selected, qty);
      if (qty >= selectedQty) setSelected(null);
      setSellQty(1);
    }
  };

  const handleSellAll = () => {
    if (!selected || !selectedItem || selectedQty <= 0) return;
    sellItem(selected, selectedQty);
    setSelected(null);
    setSellQty(1);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-amber-400">🎒 背包</h2>

      {/* Spirit stones display */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-amber-300">💎 灵石</span>
          <span className="text-amber-400 font-bold text-lg">{(inventory.items['spirit_stone'] ?? 0).toLocaleString()}</span>
        </div>
      </div>

      {isPillActive && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-sm text-purple-300">
          ⚡ 聚气丹效果激活中 — 打坐灵力恢复 +50% (剩余 {remainingSecs}s)
        </div>
      )}

      <div className="flex gap-1 flex-wrap">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 border border-slate-600 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-slate-500 text-sm text-center py-8">背包空空如也...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map(([itemId, qty]) => (
            <ItemSlot
              key={itemId}
              itemId={itemId}
              quantity={qty}
              selected={selected === itemId}
              onClick={() => setSelected(selected === itemId ? null : itemId)}
            />
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 space-y-2">
          <div className="font-semibold text-amber-300">{selectedItem.name}</div>
          <div className="text-sm text-slate-400">{selectedItem.description}</div>
          <div className="text-xs text-slate-500">数量: {selectedQty}</div>
          {selectedItem.sellPrice != null && selectedItem.id !== 'spirit_stone' && (
            <div className="text-xs text-amber-400">售价: {selectedItem.sellPrice} 灵石/个</div>
          )}
          {/* Use button for gathering pill */}
          {selectedItem.category === 'pill' && selectedItem.id === 'gathering_pill' && (
            <Button
              variant="primary"
              onClick={() => { if (useItem(selectedItem.id)) setSelected(null); }}
              className="w-full mt-2"
              disabled={selectedQty < 1 || isPillActive}
            >
              {isPillActive ? '效果激活中' : '使用'}
            </Button>
          )}
          {/* Sell button (not for spirit stones or currency) */}
          {selectedItem.sellPrice != null && selectedItem.id !== 'spirit_stone' && selectedQty > 0 && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">出售数量:</span>
                <input
                  type="number"
                  min={1}
                  max={selectedQty}
                  value={sellQty}
                  onChange={e => setSellQty(Math.max(1, Math.min(selectedQty, parseInt(e.target.value) || 1)))}
                  className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200"
                />
                <span className="text-xs text-amber-300">= {(selectedItem.sellPrice * Math.min(sellQty, selectedQty)).toLocaleString()} 灵石</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSell} className="flex-1">
                  出售 {Math.min(sellQty, selectedQty)} 个
                </Button>
                <Button variant="danger" onClick={handleSellAll} className="flex-1">
                  全部出售
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
