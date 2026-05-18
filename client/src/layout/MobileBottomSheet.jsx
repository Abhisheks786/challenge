// client/src/layout/MobileBottomSheet.js
// ─────────────────────────────────────────────────────────────────────────────
// Slide-up bottom sheet for mobile — shows the Election Dashboard.
// Uses CSS transforms for animation; no external animation library.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { ElectionDashboard } from '../dashboard/ElectionDashboard';
import { useElectionStore } from '../store/useElectionStore';

export function MobileBottomSheet() {
  const open = useElectionStore((s) => s.bottomSheetOpen);
  const setOpen = useElectionStore((s) => s.setBottomSheetOpen);
  const sheetRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          md:hidden fixed inset-0 z-50
          bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleBackdropClick} />
      

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`
          md:hidden fixed bottom-0 left-0 right-0 z-50
          h-[80vh] rounded-t-2xl
          bg-neutral-900 border-t border-neutral-700
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-out
          ${open ? 'translate-y-0' : 'translate-y-full'}
        `}>
        
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-neutral-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-white">Election Dashboard</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-neutral-400 hover:text-white text-lg leading-none px-2">
            
            ✕
          </button>
        </div>

        {/* Dashboard content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <ElectionDashboard />
        </div>
      </div>
    </>);

}