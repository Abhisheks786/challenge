// client/src/hooks/useSSE.js
// Wraps EventSource for LLM streaming via SSE.
// IMPORTANT: Use useElectionStore.getState() inside callbacks (not hook-level
// destructuring) to avoid stale closures after re-renders.
import { useRef, useCallback } from 'react';
import { useElectionStore } from '../store/useElectionStore';

export function useSSE({ onError } = {}) {
  const esRef = useRef(null);

  const connect = useCallback((url) => {
    // Tear down any existing connection first
    esRef.current?.close();

    // Always read from the store at call-time to avoid stale closures
    const store = useElectionStore.getState();
    const msgId = store.addAssistantMessage();
    const es = new EventSource(url, { withCredentials: false });
    esRef.current = es;

    // Each chunk appended to the live message
    es.addEventListener('chunk', (e) => {
      const { text } = JSON.parse(e.data);
      useElectionStore.getState().appendChunk(msgId, text);
    });

    // Structured JSON widget attached to the message
    es.addEventListener('widget', (e) => {
      const widget = JSON.parse(e.data);
      if (widget.type === 'QUICK_CHIPS') {
        useElectionStore.getState().setQuickChips(widget.chips);
      }
      useElectionStore.getState().finalizeMessage(msgId, widget);
    });

    // Push update to the 30% right dashboard panel
    es.addEventListener('dashboard', (e) => {
      const update = JSON.parse(e.data);
      useElectionStore.getState().applyDashboardUpdate(update);
    });

    // Stream complete — finalize message and close connection
    es.addEventListener('done', () => {
      useElectionStore.getState().finalizeMessage(msgId);
      es.close();
      esRef.current = null;
    });

    // Server-sent error event
    es.addEventListener('error', (e) => {
      try {
        const { message } = JSON.parse(e.data ?? '{}');
        onError?.(message ?? 'Stream error');
      } catch (_) { onError?.('Stream error'); }
      useElectionStore.getState().finalizeMessage(msgId);
      useElectionStore.getState().setStreaming(false);
      es.close();
      esRef.current = null;
    });

    // Native EventSource network error
    es.onerror = () => {
      useElectionStore.getState().finalizeMessage(msgId);
      useElectionStore.getState().setStreaming(false);
      onError?.('Connection lost');
      es.close();
      esRef.current = null;
    };

    return () => { es.close(); esRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const disconnect = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  return { connect, disconnect };
}