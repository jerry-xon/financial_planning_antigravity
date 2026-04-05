import { useState } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { FamilyProfile } from './components/FamilyProfile';

export default function App() {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Sidebar with Process */}
        <LeftSidebar 
          isOpen={leftDrawerOpen} 
          onOpenChange={setLeftDrawerOpen}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <FamilyProfile />
        </main>

        {/* Right Sidebar with Calculators */}
        <RightSidebar 
          isOpen={rightDrawerOpen} 
          onOpenChange={setRightDrawerOpen}
        />
      </div>
    </div>
  );
}
