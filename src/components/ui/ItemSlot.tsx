import { getItem } from '../../core/data/items';

interface ItemSlotProps {
  itemId: string;
  quantity: number;
  onClick?: () => void;
  selected?: boolean;
}

export function ItemSlot({ itemId, quantity, onClick, selected }: ItemSlotProps) {
  const item = getItem(itemId);
  if (!item) return null;

  const categoryEmoji: Record<string, string> = {
    herb: '🌿',
    seed: '🌱',
    fish: '🐟',
    pill: '💊',
    material: '💎',
  };

  return (
    <div
      onClick={onClick}
      title={`${item.name}: ${item.description}`}
      className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-lg border cursor-pointer transition-colors text-center p-1 ${
        selected
          ? 'border-amber-500 bg-amber-500/20'
          : 'border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-600'
      }`}
    >
      <span className="text-xl">{categoryEmoji[item.category] ?? '📦'}</span>
      <span className="text-xs text-slate-300 truncate w-full text-center leading-tight mt-0.5">{item.name}</span>
      <span className="absolute bottom-0.5 right-1 text-xs text-amber-300 font-bold">{quantity}</span>
    </div>
  );
}
