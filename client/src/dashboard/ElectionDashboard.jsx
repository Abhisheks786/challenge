import React from 'react';
import { useElectionStore } from '../store/useElectionStore';

export function ElectionDashboard() {
  // Use separate selectors for primitives to avoid infinite re-render loops.
  // Returning a new object from a selector on every call breaks Zustand's
  // equality check and causes React to loop forever.
  const location           = useElectionStore((s) => s.location);
  const deadlines          = useElectionStore((s) => s.deadlines);
  const registrationStatus = useElectionStore((s) => s.registrationStatus);
  const electionPhase      = useElectionStore((s) => s.electionPhase);

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-200">
      {/* Panel header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-950/50">
        <h2 className="text-lg font-semibold text-white">Election Context</h2>
        <p className="text-xs text-neutral-400 mt-1">Live updates based on chat</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ── Location Status ─────────────────────────────────────────────── */}
        <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
          <h3 className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Your Region</h3>
          {location ? (
            <div>
              <p className="font-semibold text-orange-400 text-sm">{location.state}</p>
              {location.district && (
                <p className="text-xs text-neutral-300 mt-0.5">{location.district}</p>
              )}
              {location.confirmed && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-400">
                  ✓ Confirmed
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">
              Ask about a state or region to see local data here.
            </p>
          )}
        </div>

        {/* ── Election Phase ───────────────────────────────────────────────── */}
        {electionPhase && (
          <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
            <h3 className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Current Phase</h3>
            <p className="font-semibold text-blue-400 text-sm">{electionPhase.name}</p>
            <p className="text-xs text-neutral-400 mt-1">Since {electionPhase.activeFrom}</p>
          </div>
        )}

        {/* ── Registration Status ──────────────────────────────────────────── */}
        {registrationStatus && (
          <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
            <h3 className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Registration</h3>
            <p className={`text-sm font-semibold ${registrationStatus.enrolled ? 'text-green-400' : 'text-red-400'}`}>
              {registrationStatus.enrolled ? '✓ Enrolled' : '✗ Not Enrolled'}
            </p>
            {registrationStatus.formsFiled?.length > 0 && (
              <p className="text-xs text-neutral-400 mt-1">
                Forms filed: {registrationStatus.formsFiled.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* ── Upcoming Deadlines ───────────────────────────────────────────── */}
        {deadlines.length > 0 && (
          <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
            <h3 className="text-xs font-medium text-neutral-400 mb-3 uppercase tracking-wider">Upcoming Deadlines</h3>
            <div className="flex flex-col gap-3">
              {deadlines.map((d, i) => {
                const date  = new Date(d.date);
                const diff  = Math.ceil((date - Date.now()) / (1000 * 60 * 60 * 24));
                const color = d.urgency === 'high' ? 'text-red-400 bg-red-500/10 border-red-500/20'
                            : d.urgency === 'medium' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                            : 'text-neutral-300 bg-neutral-700/30 border-neutral-600/30';
                return (
                  <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${color}`}>
                    <span className="text-xs font-medium">{d.label}</span>
                    <span className="text-[10px] font-mono ml-2 shrink-0">
                      {diff > 0 ? `${diff}d left` : date.toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!electionPhase && deadlines.length === 0 && !registrationStatus && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4">
            <div className="text-4xl mb-3">🗳️</div>
            <p className="text-sm text-neutral-500">
              Start chatting to see live election data, deadlines, and registration status for your region.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}