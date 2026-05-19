import React, { useEffect } from 'react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { ElectionDashboard } from '../dashboard/ElectionDashboard';
import { MobileBottomSheet } from './MobileBottomSheet';
import { useElectionStore, selectSidebarOpen, selectSessionId, selectSimplifyMode } from '../store/useElectionStore';

export function AppShell() {
  const sidebarOpen   = useElectionStore(selectSidebarOpen);
  const toggleSidebar = useElectionStore((s) => s.toggleSidebar);
  const sessionId     = useElectionStore(selectSessionId);
  const setMessages   = useElectionStore((s) => s.setMessages);
  const simplifyMode  = useElectionStore(selectSimplifyMode);
  const toggleSimplify = useElectionStore((s) => s.toggleSimplify);

  // Restore conversation history on app load
  useEffect(() => {
    if (sessionId) {
      fetch(`/api/conversation/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.messages) {
            setMessages(data.data.messages);
          }
        })
        .catch(err => console.error('Failed to restore session:', err));
    }
  }, [sessionId, setMessages]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center gap-3 px-4 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <span className="text-orange-400 text-xl">🗳️</span>
        <h1 className="text-base font-semibold tracking-tight text-white hidden sm:block">
          Election Assistant
          <span className="ml-2 text-xs font-normal text-neutral-400">— powered by ECI guidelines</span>
        </h1>
        
        {/* ELI5 Toggle */}
        <div className="ml-auto flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={simplifyMode} onChange={toggleSimplify} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${simplifyMode ? 'bg-orange-500' : 'bg-neutral-700'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${simplifyMode ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className={`text-xs font-medium ${simplifyMode ? 'text-orange-400' : 'text-neutral-400'}`}>
              {simplifyMode ? 'Simple Mode ON' : 'Simple Mode OFF'}
            </span>
          </label>

          {/* Desktop/Tablet: toggle sidebar */}
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
      <main className="flex flex-col lg:flex-row w-full h-full pt-14">

        {/* Chat Container */}
        <section className="flex-1 min-w-0 h-full overflow-hidden transition-all duration-300">
          <ChatContainer />
        </section>

        {/* Dashboard — Tablet stacked (bottom half), Desktop side-by-side */}
        <aside
          className={`hidden md:flex flex-col overflow-hidden lg:border-l lg:border-t-0 border-t border-neutral-800 bg-neutral-900 transition-all duration-300 ease-in-out ${
            sidebarOpen 
              ? 'lg:w-[30%] lg:min-w-[320px] lg:h-full h-[40vh] w-full' 
              : 'lg:w-0 lg:h-full h-0 w-full lg:border-l-0 border-t-0'
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