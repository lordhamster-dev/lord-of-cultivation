import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { CultivationPanel } from './components/panels/CultivationPanel';
import { SavePanel } from './components/panels/SavePanel';
import { InventoryPanel } from './components/panels/InventoryPanel';
import { HerbPanel } from './components/panels/HerbPanel';
import { FishingPanel } from './components/panels/FishingPanel';
import { AlchemyPanel } from './components/panels/AlchemyPanel';
import { AchievementPanel } from './components/panels/AchievementPanel';
import { QuestPanel } from './components/panels/QuestPanel';
import { CombatPanel } from './components/panels/CombatPanel';
import { DungeonPanel } from './components/panels/DungeonPanel';
import { EquipmentPanel } from './components/panels/EquipmentPanel';
import { useGameLoop } from './hooks/useGameLoop';
import { useLoadSave } from './hooks/useLoadSave';

type Panel = 'cultivation' | 'save' | 'inventory' | 'herbs' | 'fishing' | 'alchemy' | 'achievements' | 'quests' | 'combat' | 'dungeon' | 'equipment';

function App() {
  const [activePanel, setActivePanel] = useState<Panel>('cultivation');

  // Load save and start game loop
  useLoadSave();
  useGameLoop();

  const renderPanel = () => {
    switch (activePanel) {
      case 'cultivation': return <CultivationPanel />;
      case 'save':        return <SavePanel />;
      case 'inventory':   return <InventoryPanel />;
      case 'herbs':       return <HerbPanel />;
      case 'fishing':     return <FishingPanel />;
      case 'alchemy':     return <AlchemyPanel />;
      case 'achievements': return <AchievementPanel />;
      case 'quests':      return <QuestPanel />;
      case 'combat':      return <CombatPanel />;
      case 'dungeon':     return <DungeonPanel />;
      case 'equipment':   return <EquipmentPanel />;
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
    </div>
  );
}

export default App;
