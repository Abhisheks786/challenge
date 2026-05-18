// server/src/services/intentRouter.js
// ─────────────────────────────────────────────────────────────────────────────
// Lightweight rule-based intent classifier.
// No LLM needed for classification — fast keyword + regex matching.
// ─────────────────────────────────────────────────────────────────────────────
import { ELECTION_DATA } from '../data/electionData.js';

// Indian state name normalization
const STATE_ALIASES = {
  'up': 'uttar pradesh', 'u.p': 'uttar pradesh',
  'mh': 'maharashtra', 'bombay': 'maharashtra', 'mumbai': 'maharashtra',
  'dl': 'delhi', 'new delhi': 'delhi',
  'wb': 'west bengal', 'bengal': 'west bengal', 'kolkata': 'west bengal',
  'br': 'bihar', 'patna': 'bihar',
};

// Detect which Indian state the user is asking about
export const detectState = (message) => {
  const lower = message.toLowerCase();
  for (const [alias, canonical] of Object.entries(STATE_ALIASES)) {
    if (lower.includes(alias)) return canonical;
  }
  for (const state of Object.keys(ELECTION_DATA.states)) {
    if (lower.includes(state)) return state;
  }
  return null;
};

// Classify intent and extract structured data
export const classifyIntent = (message) => {
  const lower = message.toLowerCase();
  const state = detectState(message);

  // ── Location / Where intents ─────────────────────────────────────────────
  if (/\b(where|location|booth|polling station|find my)\b/.test(lower)) {
    return { type: 'location', state };
  }

  // ── Form 6 / Registration intents ────────────────────────────────────────
  if (/\b(form\s*6|register|registration|enrol|signup|voter id|epic|new voter)\b/.test(lower)) {
    return { type: 'form6', state };
  }

  // ── Deadline intents ─────────────────────────────────────────────────────
  if (/\b(deadline|last date|when|date|cutoff|cut.off)\b/.test(lower)) {
    return { type: 'deadline', state };
  }

  // ── Timeline intents ─────────────────────────────────────────────────────
  if (/\b(timeline|schedule|process|steps|phases|when is|election date)\b/.test(lower)) {
    return { type: 'timeline', state };
  }

  // ── Eligibility intents ──────────────────────────────────────────────────
  if (/\b(eligible|eligibility|qualify|who can|age|18|citizen)\b/.test(lower)) {
    return { type: 'eligibility', state };
  }

  // ── Quick fact intents ───────────────────────────────────────────────────
  for (const keyword of Object.keys(ELECTION_DATA.quickFacts)) {
    if (lower.includes(keyword)) return { type: 'fact', key: keyword, state };
  }

  return { type: 'open-ended', state };
};
