import React, { useState } from 'react';
import { WidgetType } from '../../types';
import { LocationInput } from './LocationInput';
import { useElectionStore } from '../../store/useElectionStore';
import { TimelineWidget } from './TimelineWidget';
import { QuizWidget } from './QuizWidget';

export function WidgetRenderer({ payload }) {
  switch (payload.type) {

    // ── Timeline ────────────────────────────────────────────────────────────
    case WidgetType.TIMELINE:
    case 'TIMELINE':
      return <TimelineWidget data={payload.data || payload} title={payload.title} />;

    // ── Quiz ────────────────────────────────────────────────────────────────
    case 'QUIZ':
      return <QuizWidget data={payload.data} />;

    // ── Checklist ────────────────────────────────────────────────────────────
    case WidgetType.CHECKLIST:
    case 'CHECKLIST':
      return <ChecklistWidget payload={payload} />;

    // ── Quick Chips ──────────────────────────────────────────────────────────
    case WidgetType.QUICK_CHIPS:
    case 'QUICK_CHIPS':
      return <QuickChipsWidget chips={payload.chips} />;

    // ── Location ────────────────────────────────────────────────────────────
    case WidgetType.LOCATION:
    case 'LOCATION':
      return <LocationInput placeholder={payload.placeholder} />;

    default:
      // In case we receive an unknown type, log it but don't crash
      console.warn('Unknown widget type:', payload.type);
      return null;
  }
}

// ── Checklist with interactive checkboxes ────────────────────────────────────
function ChecklistWidget({ payload }) {
  const [checked, setChecked] = useState({});
  const total     = payload.items.length;
  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct       = Math.round((doneCount / total) * 100);

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-neutral-800/70 p-4 rounded-xl border border-neutral-700 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white text-sm">{payload.title}</h4>
        <span className="text-xs text-neutral-400">{doneCount}/{total}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-neutral-700 rounded-full h-1.5 mb-3">
        <div
          className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="flex flex-col gap-2.5">
        {payload.items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() => toggle(item.id)}
          >
            <div className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center transition-colors ${
              checked[item.id]
                ? 'bg-orange-500 border-orange-500'
                : 'border-neutral-600 group-hover:border-neutral-400'
            }`}>
              {checked[item.id] && <span className="text-white text-[10px] font-bold">✓</span>}
            </div>
            <div>
              <span className={`text-sm transition-colors ${
                checked[item.id] ? 'text-neutral-500 line-through' : 'text-neutral-200'
              }`}>{item.label}</span>
              {item.required && !checked[item.id] && (
                <span className="ml-2 text-[10px] text-orange-400 font-medium">Required</span>
              )}
              {item.hint && (
                <p className="text-[11px] text-neutral-500 mt-0.5">{item.hint}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {doneCount === total && (
        <div className="mt-3 py-2 text-center text-xs text-green-400 bg-green-500/10 rounded-lg border border-green-500/20">
          ✓ All items checked — you're ready to register!
        </div>
      )}
    </div>
  );
}

// ── Quick reply chips ─────────────────────────────────────────────────────────
function QuickChipsWidget({ chips }) {
  const addUserMessage    = useElectionStore((s) => s.addUserMessage);
  const addAssistantMessage = useElectionStore((s) => s.addAssistantMessage);
  const finalizeMessage   = useElectionStore((s) => s.finalizeMessage);
  const applyDashboardUpdate = useElectionStore((s) => s.applyDashboardUpdate);

  const handleChip = async (chip) => {
    addUserMessage(chip.prompt);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chip.prompt }),
      });
      const data = await res.json();
      if (data.streaming === false) {
        const msgId = addAssistantMessage();
        finalizeMessage(msgId, data.widget);
        if (data.dashboard) applyDashboardUpdate(data.dashboard);
      }
      // SSE streaming chips are handled by useSSE hook in ChatInput
    } catch (err) {
      console.error('Chip fetch error:', err);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => handleChip(chip)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-orange-500/50 text-neutral-300 hover:text-white transition-all"
        >
          {chip.icon && <span>{chip.icon}</span>}
          {chip.label}
        </button>
      ))}
    </div>
  );
}