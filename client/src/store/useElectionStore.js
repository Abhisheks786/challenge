// client/src/store/useElectionStore.js
// ─────────────────────────────────────────────────────────────────────────────
// Zustand store split into chat, learning, and ui slices.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

// ─── Chat Slice ──────────────────────────────────────────────────────────────
const createChatSlice = (set, get) => ({
  messages: [],
  isStreaming: false,
  pendingChips: [],
  sessionId: nanoid(),
  error: null,

  setSessionId: (id) => set((s) => { s.sessionId = id; }),
  
  setMessages: (msgs) => set((s) => { s.messages = msgs; }),

  addUserMessage: (content) => {
    const id = nanoid();
    set((s) => {
      s.messages.push({ id, role: 'user', content, timestamp: Date.now() });
      s.pendingChips = [];
    });
    return id;
  },

  addAssistantMessage: (id) => {
    const msgId = id ?? nanoid();
    set((s) => {
      s.messages.push({
        id: msgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true
      });
      s.isStreaming = true;
    });
    return msgId;
  },

  appendChunk: (id, chunk) => {
    set((s) => {
      const msg = s.messages.find((m) => m.id === id);
      if (msg) msg.content += chunk;
    });
  },

  finalizeMessage: (id, widget, citations) => {
    set((s) => {
      const msg = s.messages.find((m) => m.id === id);
      if (msg) {
        msg.isStreaming = false;
        if (widget) msg.widget = widget;
        if (citations) msg.citations = citations;
      }
      s.isStreaming = false;
    });
  },

  setStreaming: (val) => set((s) => { s.isStreaming = val; }),
  setQuickChips: (chips) => set((s) => { s.pendingChips = chips; }),
  clearChat: () => set((s) => { s.messages = []; s.pendingChips = []; s.isStreaming = false; }),
});

// ─── Learning Slice ──────────────────────────────────────────────────────────
const createLearningSlice = (set, get) => ({
  currentPath: null,
  progress: {
    topicsCompleted: [],
    quizScores: []
  },

  setPath: (pathId) => set((s) => { s.currentPath = pathId; }),
  markTopicComplete: (topicId) => set((s) => { 
    if (!s.progress.topicsCompleted.includes(topicId)) {
      s.progress.topicsCompleted.push(topicId);
    }
  }),
  saveQuizScore: (topic, score) => set((s) => {
    s.progress.quizScores.push({ topic, score, date: new Date().toISOString() });
  }),
});

// ─── UI / Dashboard Slice ────────────────────────────────────────────────────
const createUiSlice = (set, get) => ({
  simplifyMode: false,
  activeWidget: null, // { type, data }
  bookmarks: [],
  
  // Dashboard states
  location: undefined,
  deadlines: [],
  registrationStatus: undefined,
  electionPhase: undefined,
  sidebarOpen: true,
  bottomSheetOpen: false,

  toggleSimplify: () => set((s) => { s.simplifyMode = !s.simplifyMode; }),
  setWidget: (widgetData) => set((s) => { s.activeWidget = widgetData; }),
  addBookmark: (msgId) => set((s) => {
    if (!s.bookmarks.includes(msgId)) s.bookmarks.push(msgId);
  }),

  applyDashboardUpdate: (update) => set((s) => {
    if (update.location) s.location = update.location;
    if (update.upcomingDeadlines) s.deadlines = update.upcomingDeadlines;
    if (update.registrationStatus) s.registrationStatus = update.registrationStatus;
    if (update.electionPhase) s.electionPhase = update.electionPhase;
  }),

  toggleSidebar: () => set((s) => { s.sidebarOpen = !s.sidebarOpen; }),
  setSidebarOpen: (open) => set((s) => { s.sidebarOpen = open; }),
  setBottomSheetOpen: (open) => set((s) => { s.bottomSheetOpen = open; }),
});

// ─── Combined Store ──────────────────────────────────────────────────────────
export const useElectionStore = create()(
  devtools(
    persist(
      immer((set, get) => ({
        ...createChatSlice(set, get),
        ...createLearningSlice(set, get),
        ...createUiSlice(set, get),
      })),
      {
        name: 'election-store',
        partialize: (s) => ({
          sessionId: s.sessionId,
          location: s.location,
          simplifyMode: s.simplifyMode,
          progress: s.progress,
          currentPath: s.currentPath,
        })
      }
    ),
    { name: 'ElectionStore' }
  )
);

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectMessages = (s) => s.messages;
export const selectIsStreaming = (s) => s.isStreaming;
export const selectSessionId = (s) => s.sessionId;
export const selectPendingChips = (s) => s.pendingChips;
export const selectDashboard = (s) => ({
  location: s.location,
  deadlines: s.deadlines,
  registrationStatus: s.registrationStatus,
  electionPhase: s.electionPhase
});
export const selectSidebarOpen = (s) => s.sidebarOpen;
export const selectSimplifyMode = (s) => s.simplifyMode;
export const selectCurrentPath = (s) => s.currentPath;
export const selectProgress = (s) => s.progress;