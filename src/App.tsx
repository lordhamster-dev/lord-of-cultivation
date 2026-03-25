import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { CultivationPanel } from './components/panels/CultivationPanel';
import { ResourcePanel } from './components/panels/ResourcePanel';
import { UpgradePanel } from './components/panels/UpgradePanel';
import { SavePanel } from './components/panels/SavePanel';
import { InventoryPanel } from './components/panels/InventoryPanel';
import { HerbPanel } from './components/panels/HerbPanel';
import { FishingPanel } from './components/panels/FishingPanel';
import { AlchemyPanel } from './components/panels/AlchemyPanel';
import { useGameLoop } from './hooks/useGameLoop';
import { useOfflineProgress } from './hooks/useOfflineProgress';
import { Button } from './components/ui/Button';
import { NumberDisplay } from './components/ui/NumberDisplay';

type Panel = 'cultivation' | 'resources' | 'upgrades' | 'save' | 'inventory' | 'herbs' | 'fishing' | 'alchemy';

function OfflineModal({
  show,
  elapsedText,
  spiritStones,
  exp,
  onDismiss,
}: {
  show: boolean;
  elapsedText: string;
  spiritStones: string;
  exp: string;
  onDismiss: () => void;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-amber-700 rounded-xl p-6 max-w-sm w-full space-y-4">
        <h2 className="text-amber-400 font-bold text-lg text-center">⏰ 离线收益</h2>
        <p className="text-slate-300 text-center text-sm">
          你离开了 <span className="text-amber-300 font-semibold">{elapsedText}</span>
        </p>
        <div className="bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">💎 获得灵石:</span>
            <span className="text-amber-300 font-semibold">
              +<NumberDisplay value={spiritStones} />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">✨ 获得经验:</span>
            <span className="text-blue-300 font-semibold">
              +<NumberDisplay value={exp} />
            </span>
          </div>
        </div>
        <Button variant="primary" onClick={onDismiss} className="w-full">
          继续修炼
        </Button>
      </div>
    </div>
  );
}

function App() {
  const [activePanel, setActivePanel] = useState<Panel>('cultivation');
  const { notification, dismiss } = useOfflineProgress();

  // Start the game loop
  useGameLoop();

  const renderPanel = () => {
    switch (activePanel) {
      case 'cultivation': return <CultivationPanel />;
      case 'resources':   return <ResourcePanel />;
      case 'upgrades':    return <UpgradePanel />;
      case 'save':        return <SavePanel />;
      case 'inventory':   return <InventoryPanel />;
      case 'herbs':       return <HerbPanel />;
      case 'fishing':     return <FishingPanel />;
      case 'alchemy':     return <AlchemyPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePanel={activePanel} onSelect={setActivePanel} />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {renderPanel()}
        </main>
      </div>

      <Footer />

      <OfflineModal
        show={notification.show}
        elapsedText={notification.elapsedText}
        spiritStones={notification.spiritStones}
        exp={notification.exp}
        onDismiss={dismiss}
      />
    </div>
  );
}

export default App;
