import React, { useEffect, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useElectionStore, selectMessages } from '../../store/useElectionStore';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { StarterPrompts } from './StarterPrompts';
import { LearningPathBar } from './LearningPathBar';

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
    <div className="flex flex-col h-full bg-neutral-950 relative">
      <LearningPathBar />
      {/* ── Message list (virtualized) ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <StarterPrompts />
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