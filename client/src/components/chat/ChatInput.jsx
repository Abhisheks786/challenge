import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useElectionStore, selectIsStreaming, selectSessionId, selectPendingChips, selectSimplifyMode, selectCurrentPath } from '../../store/useElectionStore';
import { useSSE } from '../../hooks/useSSE';

export function ChatInput() {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const isStreaming = useElectionStore(selectIsStreaming);
  const sessionId = useElectionStore(selectSessionId);
  const pendingChips = useElectionStore(selectPendingChips);
  const simplifyMode = useElectionStore(selectSimplifyMode);
  const currentPath = useElectionStore(selectCurrentPath);
  
  const addUserMessage    = useElectionStore((s) => s.addUserMessage);
  const addAssistantMessage = useElectionStore((s) => s.addAssistantMessage);
  const finalizeMessage   = useElectionStore((s) => s.finalizeMessage);
  const applyDashboardUpdate = useElectionStore((s) => s.applyDashboardUpdate);
  const setQuickChips     = useElectionStore((s) => s.setQuickChips);

  const { connect } = useSSE({
    onError: (err) => console.error('SSE Error:', err)
  });

  const handleSubmit = async (e, overrideText) => {
    e.preventDefault();
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isStreaming) return;

    // 1. Add user message
    addUserMessage(textToSend);
    setInput('');

    // 2. POST to backend to trigger Hybrid Routing
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: textToSend, 
          sessionId, 
          simplifyFor: simplifyMode ? 'eli5' : '', 
          topicPath: currentPath 
        })
      });

      const data = await response.json();

      if (data.streaming === false) {
        // Factual Query — instant JSON from DB/Redis, render widget immediately
        const msgId = addAssistantMessage();
        finalizeMessage(msgId, data.widget, data.citations);
        // Also sync the right-panel dashboard if server sent context
        if (data.dashboard) applyDashboardUpdate(data.dashboard);
      } else if (data.streaming === true) {
        // Open-ended Query — use proxy-relative SSE URL
        const sseUrl = data.sseUrl.replace('http://localhost:5000', '');
        connect(sseUrl);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
      {/* Quick Chips */}
      {pendingChips.length > 0 &&
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {pendingChips.map((chip) =>
        <button
          key={chip.id}
          onClick={(e) => handleSubmit(e, chip.prompt)}
          className="whitespace-nowrap px-4 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm border border-neutral-700 transition-colors">
          
              {chip.icon && <span className="mr-1.5">{chip.icon}</span>}
              {chip.label}
            </button>
        )}
        </div>
      }

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about election processes, forms, deadlines..."
          disabled={isStreaming}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all disabled:opacity-50" />
        
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="absolute right-2 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors">
          
          <Send size={18} />
        </button>
      </form>
      <div className="text-center mt-1">
        <span className="text-[10px] text-neutral-600">
          Powered by ECI guidelines. Responses are AI generated and may require verification.
        </span>
      </div>
    </div>);
}