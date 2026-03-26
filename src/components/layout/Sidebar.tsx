type Panel = 'cultivation' | 'save' | 'inventory' | 'herbs' | 'fishing' | 'alchemy' | 'achievements' | 'quests' | 'combat';

interface SidebarProps {
  activePanel: Panel;
  onSelect: (panel: Panel) => void;
}

const TABS: { id: Panel; label: string; icon: string }[] = [
  { id: 'cultivation', label: '修炼', icon: '⚡' },
  { id: 'combat',      label: '战斗', icon: '⚔️' },
  { id: 'inventory',   label: '背包', icon: '🎒' },
  { id: 'herbs',       label: '种植', icon: '🌿' },
  { id: 'fishing',     label: '钓鱼', icon: '🎣' },
  { id: 'alchemy',     label: '炼丹', icon: '⚗️' },
  { id: 'quests',      label: '任务', icon: '📋' },
  { id: 'achievements', label: '成就', icon: '🏆' },
  { id: 'save',        label: '存档', icon: '💾' },
];

export function Sidebar({ activePanel, onSelect }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col gap-1 w-40 shrink-0 bg-slate-900 border-r border-slate-700 p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
              activePanel === tab.id
                ? 'bg-amber-500/20 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors cursor-pointer ${
              activePanel === tab.id
                ? 'text-amber-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
