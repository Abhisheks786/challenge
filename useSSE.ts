// client/src/hooks/useSSE.ts
// ─────────────────────────────────────────────────────────────────────────────
// Custom hook wrapping EventSource for LLM streaming.
// Handles: chunk accumulation, widget delivery, dashboard updates, errors.
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useCallback } from 'react';
import { useElectionStore }     from '../store/useElectionStore';
import type { SSEEventType, WidgetPayload, DashboardUpdate } from '@shared/types';

interface UseSSEOptions {
  onError?: (err: string) => void;
}

export function useSSE({ onError }: UseSSEOptions = {}) {
  const esRef = useRef<EventSource | null>(null);

  const {
    addAssistantMessage,
    appendChunk,
    finalizeMessage,
    setStreaming,
    setQuickChips,
    applyDashboardUpdate,
  } = useElectionStore.getState();

  /**
   * Opens an EventSource to `url` and wires up all SSE event handlers.
   * Returns a cleanup function (call on unmount or before next request).
   */
  const connect = useCallback(
    (url: string): (() => void) => {
      // Tear down any existing connection first
      esRef.current?.close();

      const msgId = addAssistantMessage();
      const es    = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      // ── 'chunk' → append text to the in-progress message ────────────────
      es.addEventListener('chunk', (e: MessageEvent) => {
        const { text } = JSON.parse(e.data) as { text: string };
        appendChunk(msgId, text);
      });

      // ── 'widget' → attach structured widget to the message ───────────────
      es.addEventListener('widget', (e: MessageEvent) => {
        const widget = JSON.parse(e.data) as WidgetPayload;
        // Quick chips are surfaced separately (appear below input)
        if (widget.type === 'QUICK_CHIPS') {
          setQuickChips((widget as any).chips);
        }
        finalizeMessage(msgId, widget);
      });

      // ── 'dashboard' → update the right-panel sidebar ─────────────────────
      es.addEventListener('dashboard', (e: MessageEvent) => {
        const update = JSON.parse(e.data) as DashboardUpdate;
        applyDashboardUpdate(update);
      });

      // ── 'done' → close stream cleanly ────────────────────────────────────
      es.addEventListener('done', () => {
        finalizeMessage(msgId);
        es.close();
        esRef.current = null;
      });

      // ── 'error' SSE event (not connection error) ──────────────────────────
      es.addEventListener('error', (e: MessageEvent) => {
        const { message } = JSON.parse(e.data ?? '{}') as { message: string };
        finalizeMessage(msgId);
        setStreaming(false);
        onError?.(message ?? 'Stream error');
        es.close();
        esRef.current = null;
      });

      // ── Native EventSource connection error ───────────────────────────────
      es.onerror = () => {
        finalizeMessage(msgId);
        setStreaming(false);
        onError?.('Connection lost');
        es.close();
        esRef.current = null;
      };

      return () => {
        es.close();
        esRef.current = null;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const disconnect = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  return { connect, disconnect };
}
