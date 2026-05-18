// client/src/store/useElectionStore.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single Zustand store that keeps Chat and the Election Dashboard in sync.
// The store is the single source of truth — SSE events flow IN here,
// UI components READ from here. No prop-drilling needed.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type {
  ChatMessage,
  DashboardUpdate,
  WidgetPayload,
  QuickChip,
} from '@shared/types';

// ─── Slice: Chat ─────────────────────────────────────────────────────────────
interface ChatSlice {
  messages: ChatMessage[];
  isStreaming: boolean;           // true while any SSE chunk arriving
  pendingChips: QuickChip[];      // Quick-reply chips for latest message
  sessionId: string;

  // Actions
  addUserMessage:    (content: string) => string;           // returns new msg id
  addAssistantMessage: (id?: string) => string;             // returns placeholder id
  appendChunk:       (id: string, chunk: string) => void;   // SSE chunk
  finalizeMessage:   (id: string, widget?: WidgetPayload) => void;
  setStreaming:      (val: boolean) => void;
  setQuickChips:     (chips: QuickChip[]) => void;
  clearChat:         () => void;
}

// ─── Slice: Dashboard ────────────────────────────────────────────────────────
interface DashboardSlice {
  location: DashboardUpdate['location'];
  deadlines: NonNullable<DashboardUpdate['upcomingDeadlines']>;
  registrationStatus: DashboardUpdate['registrationStatus'];
  electionPhase: DashboardUpdate['electionPhase'];
  sidebarOpen: boolean;           // mobile toggle

  // Actions
  applyDashboardUpdate: (update: DashboardUpdate) => void;
  toggleSidebar:        () => void;
  setSidebarOpen:       (open: boolean) => void;
}

// ─── Slice: UI Meta ──────────────────────────────────────────────────────────
interface UISlice {
  bottomSheetOpen: boolean;
  activeTab: 'chat' | 'dashboard'; // mobile tab selector
  locationSearchQuery: string;

  setBottomSheetOpen:       (open: boolean) => void;
  setActiveTab:             (tab: 'chat' | 'dashboard') => void;
  setLocationSearchQuery:   (q: string) => void;
}

// ─── Combined Store ──────────────────────────────────────────────────────────
type ElectionStore = ChatSlice & DashboardSlice & UISlice;

export const useElectionStore = create<ElectionStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // ── Chat state ──────────────────────────────────────────────────────
        messages:     [],
        isStreaming:  false,
        pendingChips: [],
        sessionId:    nanoid(),

        addUserMessage: (content) => {
          const id = nanoid();
          set((s) => {
            s.messages.push({
              id,
              role: 'user',
              content,
              timestamp: Date.now(),
            });
            s.pendingChips = []; // clear previous chips on new message
          });
          return id;
        },

        addAssistantMessage: (id) => {
          const msgId = id ?? nanoid();
          set((s) => {
            s.messages.push({
              id: msgId,
              role: 'assistant',
              content: '',       // empty — chunks arrive via appendChunk
              timestamp: Date.now(),
              isStreaming: true,
            });
            s.isStreaming = true;
          });
          return msgId;
        },

        /**
         * Called for each SSE 'chunk' event.
         * Uses immer so the push is a simple string concat — no object spread.
         */
        appendChunk: (id, chunk) => {
          set((s) => {
            const msg = s.messages.find((m) => m.id === id);
            if (msg) msg.content += chunk;
          });
        },

        /**
         * Called when SSE 'done' fires.
         * Attaches the optional structured widget and flips streaming flags.
         */
        finalizeMessage: (id, widget) => {
          set((s) => {
            const msg = s.messages.find((m) => m.id === id);
            if (msg) {
              msg.isStreaming = false;
              if (widget) msg.widget = widget;
            }
            s.isStreaming = false;
          });
        },

        setStreaming:   (val) => set((s) => { s.isStreaming = val; }),
        setQuickChips:  (chips) => set((s) => { s.pendingChips = chips; }),
        clearChat:      () =>
          set((s) => { s.messages = []; s.pendingChips = []; s.isStreaming = false; }),

        // ── Dashboard state ─────────────────────────────────────────────────
        location:           undefined,
        deadlines:          [],
        registrationStatus: undefined,
        electionPhase:      undefined,
        sidebarOpen:        true,

        /**
         * Receives a DashboardUpdate pushed by the server via SSE 'dashboard'
         * event and merges it into local state. Only overwrites defined keys.
         */
        applyDashboardUpdate: (update) => {
          set((s) => {
            if (update.location)           s.location           = update.location;
            if (update.upcomingDeadlines)  s.deadlines          = update.upcomingDeadlines;
            if (update.registrationStatus) s.registrationStatus = update.registrationStatus;
            if (update.electionPhase)      s.electionPhase      = update.electionPhase;
          });
        },

        toggleSidebar:  () => set((s) => { s.sidebarOpen = !s.sidebarOpen; }),
        setSidebarOpen: (open) => set((s) => { s.sidebarOpen = open; }),

        // ── UI Meta state ───────────────────────────────────────────────────
        bottomSheetOpen:     false,
        activeTab:           'chat',
        locationSearchQuery: '',

        setBottomSheetOpen:     (open) => set((s) => { s.bottomSheetOpen = open; }),
        setActiveTab:           (tab)  => set((s) => { s.activeTab = tab; }),
        setLocationSearchQuery: (q)    => set((s) => { s.locationSearchQuery = q; }),
      })),
      {
        name: 'election-store',
        // Only persist the session ID and location — not the full message log
        partialize: (s) => ({
          sessionId: s.sessionId,
          location:  s.location,
        }),
      }
    ),
    { name: 'ElectionStore' }
  )
);

// ─── Selectors (memoised via equality) ───────────────────────────────────────
export const selectMessages     = (s: ElectionStore) => s.messages;
export const selectIsStreaming  = (s: ElectionStore) => s.isStreaming;
export const selectDashboard    = (s: ElectionStore) => ({
  location:           s.location,
  deadlines:          s.deadlines,
  registrationStatus: s.registrationStatus,
  electionPhase:      s.electionPhase,
});
export const selectSidebarOpen  = (s: ElectionStore) => s.sidebarOpen;
export const selectSessionId    = (s: ElectionStore) => s.sessionId;
export const selectPendingChips = (s: ElectionStore) => s.pendingChips;
