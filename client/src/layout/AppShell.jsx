import React from 'react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { ElectionDashboard } from '../dashboard/ElectionDashboard';
import { MobileBottomSheet } from './MobileBottomSheet';
import { useElectionStore, selectSidebarOpen } from '../store/useElectionStore';

// Root layout: Desktop → 70% Chat | 30% Dashboard
// Mobile     → full-width Chat + slide-up Bottom Sheet
export function AppShell() {
  const sidebarOpen   = useElectionStore(selectSidebarOpen);
  const toggleSidebar = useElectionStore((s) => s.toggleSidebar);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center gap-3 px-4 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <span className="text-orange-400 text-xl">🗳️</span>
        <h1 className="text-base font-semibold tracking-tight text-white">
          Election Assistant
          <span className="ml-2 text-xs font-normal text-neutral-400">— powered by ECI guidelines</span>
        </h1>

        <div className="ml-auto flex items-center gap-2">
          {/* Desktop: toggle sidebar */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors"
          >
            {sidebarOpen ? '← Hide Dashboard' : 'Show Dashboard →'}
          </button>

          {/* Mobile: open bottom sheet */}
          <button
            className="md:hidden flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-700"
            onClick={() => useElectionStore.getState().setBottomSheetOpen(true)}
          >
            Dashboard ↑
          </button>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex w-full h-full pt-14">

        {/* 70% Chat Container */}
        <section className="flex-1 min-w-0 h-full overflow-hidden transition-all duration-300">
          <ChatContainer />
        </section>

        {/* 30% Election Dashboard — desktop only */}
        <aside
          className={`hidden md:flex flex-col overflow-hidden border-l border-neutral-800 bg-neutral-900 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-[30%] min-w-[280px]' : 'w-0 border-l-0'
          }`}
        >
          {sidebarOpen && <ElectionDashboard />}
        </aside>
      </main>

      {/* ── Mobile Bottom Sheet ────────────────────────────────────────────── */}
      <MobileBottomSheet />
    </div>
  );
}