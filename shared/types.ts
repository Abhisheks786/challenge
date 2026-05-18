// shared/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript interfaces consumed by both client and server.
// Import from '@shared/types' (aliased in both vite.config.ts & tsconfig.json).
// ─────────────────────────────────────────────────────────────────────────────

// ─── Widget Type Enum ───────────────────────────────────────────────────────
export enum WidgetType {
  TIMELINE     = 'TIMELINE',
  CHECKLIST    = 'CHECKLIST',
  COUNTDOWN    = 'COUNTDOWN',
  QUICK_CHIPS  = 'QUICK_CHIPS',
  LOCATION     = 'LOCATION',
  TEXT         = 'TEXT',         // Plain markdown (streamed via SSE)
}

// ─── SSE Event Types ────────────────────────────────────────────────────────
export enum SSEEventType {
  CHUNK         = 'chunk',        // Partial LLM text
  WIDGET        = 'widget',       // Structured JSON widget payload
  DONE          = 'done',         // Stream complete
  ERROR         = 'error',        // Stream error
  DASHBOARD     = 'dashboard',    // Dashboard sidebar update
}

// ─── Message ────────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;                // Markdown text (for TEXT type)
  widget?: WidgetPayload;         // Optional structured widget
  timestamp: number;
  isStreaming?: boolean;          // true while SSE chunks arriving
}

// ─── Widget Payloads ────────────────────────────────────────────────────────

/** One step in a Timeline widget */
export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  date?: string;                  // ISO date string
  status: 'done' | 'active' | 'upcoming';
  link?: string;
}

/** Item in a Checklist widget */
export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  completed?: boolean;            // Client-managed
  hint?: string;
}

/** Quick-reply chip */
export interface QuickChip {
  id: string;
  label: string;
  prompt: string;                 // Full prompt to send when tapped
  icon?: string;
}

/** Discriminated union for all widget payloads */
export type WidgetPayload =
  | { type: WidgetType.TIMELINE;    title: string; steps: TimelineStep[] }
  | { type: WidgetType.CHECKLIST;   title: string; items: ChecklistItem[] }
  | { type: WidgetType.COUNTDOWN;   title: string; deadline: string; context: string }
  | { type: WidgetType.QUICK_CHIPS; chips: QuickChip[] }
  | { type: WidgetType.LOCATION;    placeholder: string; resultsFor?: string }
  | { type: WidgetType.TEXT;        markdown: string }

// ─── Dashboard State ────────────────────────────────────────────────────────
/** Pushed from server via SSE 'dashboard' event */
export interface DashboardUpdate {
  location?: {
    state: string;
    district?: string;
    confirmed: boolean;
  };
  upcomingDeadlines?: Array<{
    label: string;
    date: string;          // ISO string
    urgency: 'low' | 'medium' | 'high';
  }>;
  registrationStatus?: {
    enrolled: boolean;
    formsFiled: string[];  // e.g. ['Form-6']
  };
  electionPhase?: {
    name: string;          // e.g. 'Model Code in Force'
    activeFrom: string;
  };
}

// ─── API Request / Response ─────────────────────────────────────────────────
export interface ChatRequest {
  message: string;
  sessionId: string;
  location?: { state?: string; district?: string };
  history?: Array<{ role: MessageRole; content: string }>;
}

/** For factual (non-streaming) responses */
export interface ChatDataResponse {
  streaming: false;
  widget: WidgetPayload;
  dashboard?: DashboardUpdate;
  respondedIn?: number;           // ms (for perf logging)
}

/** For LLM streaming responses — client switches to SSE endpoint */
export interface ChatStreamResponse {
  streaming: true;
  sseUrl: string;                 // e.g. /api/chat/stream/:sessionId
}

export type ChatResponse = ChatDataResponse | ChatStreamResponse;

// ─── MongoDB Document Schemas (used by Mongoose models) ──────────────────────
export interface IElectionRule {
  state: string;                  // e.g. 'Uttar Pradesh'
  district?: string;
  electionType: string;           // 'general' | 'assembly' | 'byPoll'
  registrationDeadline: string;   // ISO date
  electionDate: string;
  checklistItems: ChecklistItem[];
  timelineSteps: TimelineStep[];
  lastUpdated: Date;
}

export interface IUserSession {
  sessionId: string;
  location?: { state: string; district?: string };
  history: Array<{ role: MessageRole; content: string }>;
  createdAt: Date;
  expiresAt: Date;
}
