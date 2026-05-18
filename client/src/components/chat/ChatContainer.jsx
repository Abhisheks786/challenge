import React, { useEffect, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useElectionStore, selectMessages } from '../../store/useElectionStore';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';

export function ChatContainer() {
  const messages = useElectionStore(selectMessages);
  const virtuosoRef = useRef(null);

  // Auto-scroll to newest message whenever the list grows
  useEffect(() => {
    if (virtuosoRef.current && messages.length > 0) {
      virtuosoRef.current.scrollToIndex({
        index: messages.length - 1,
        align: 'end',
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* ── Message list (virtualized) ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <div className="text-5xl">🗳️</div>
            <h2 className="text-xl font-semibold text-neutral-300">Election Assistant</h2>
            <p className="text-sm text-neutral-500 max-w-sm">
              Ask me about voter registration, Form 6, election deadlines, ECI guidelines, and more.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['How to register to vote?', 'What is Form 6?', 'Election deadlines'].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    // Programmatically trigger a suggestion chip
                    document.getElementById('chat-input')?.focus();
                    document.getElementById('chat-input') &&
                      (document.getElementById('chat-input').value = q);
                  }}
                  className="px-3 py-1.5 text-xs rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            className="w-full h-full"
            followOutput="smooth"
            itemContent={(_index, message) => (
              <MessageItem key={message.id} message={message} />
            )}
          />
        )}
      </div>

      {/* ── Input area ────────────────────────────────────────────────────── */}
      <div className="p-4 bg-neutral-950/80 backdrop-blur-md border-t border-neutral-800">
        <ChatInput />
      </div>
    </div>
  );
}