// server/src/services/intentRouter.js
// ─────────────────────────────────────────────────────────────────────────────
// 3-Tier Routing Logic
// Tier 1: Exact match factual queries
// Tier 2: Widget template responses
// Tier 3: LLM fallback
// ─────────────────────────────────────────────────────────────────────────────
import { ELECTION_DATA } from '../data/electionData.js';
import { WidgetTemplate } from '../models/WidgetTemplate.js';
import { getCache, setCache, CACHE_TTL } from './cache.service.js';

// Indian state name normalization
const STATE_ALIASES = {
  'up': 'uttar pradesh', 'u.p': 'uttar pradesh',
  'mh': 'maharashtra', 'bombay': 'maharashtra', 'mumbai': 'maharashtra',
  'dl': 'delhi', 'new delhi': 'delhi',
  'wb': 'west bengal', 'bengal': 'west bengal', 'kolkata': 'west bengal',
  'br': 'bihar', 'patna': 'bihar',
};

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

// ── Tier 1: Canonical Facts (Regex based) ────────────────────────────────────
export const isCanonicalFact = (message) => {
  const lower = message.toLowerCase();
  
  if (/\b(where|location|booth|polling station|find my)\b/.test(lower)) return 'location';
  if (/\b(form\s*6|register|registration|enrol|signup|voter id|epic|new voter)\b/.test(lower)) return 'form6';
  if (/\b(deadline|last date|cutoff|cut.off)\b/.test(lower)) return 'deadline';
  if (/\b(eligible|eligibility|qualify|who can|age|18|citizen)\b/.test(lower)) return 'eligibility';
  
  for (const keyword of Object.keys(ELECTION_DATA.quickFacts)) {
    if (lower.includes(keyword)) return `fact:${keyword}`;
  }
  
  return null;
};

// ── Tier 2: Widget Template Match ────────────────────────────────────────────
export const detectWidgetType = async (message) => {
  const lower = message.toLowerCase();
  
  // Try finding a matching widget from MongoDB
  try {
    const cacheKey = 'widgets:all';
    let widgets = await getCache(cacheKey);
    
    if (!widgets) {
      widgets = await WidgetTemplate.find({}).lean();
      await setCache(cacheKey, widgets, CACHE_TTL.WIDGET);
    }
    
    for (const widget of widgets) {
      for (const trigger of widget.triggers || []) {
        if (lower.includes(trigger.toLowerCase())) {
          return widget;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching widget templates:', error);
  }
  
  // Fallback to basic regex if DB fails
  if (/\b(timeline|schedule|process|steps|phases|when is|election date)\b/.test(lower)) return { type: 'timeline' };
  
  return null;
};

// ── Tier 3: Needs LLM ────────────────────────────────────────────────────────
export const needsLLM = (tier1Match, tier2Match) => {
  if (tier1Match) return false;
  if (tier2Match && tier2Match.staticData) return false;
  return true;
};

// Classify intent for controller
export const classifyIntent = async (message) => {
  const state = detectState(message);
  
  const factType = isCanonicalFact(message);
  if (factType) {
    if (factType.startsWith('fact:')) return { tier: 1, type: 'fact', key: factType.split(':')[1], state };
    return { tier: 1, type: factType, state };
  }
  
  const widget = await detectWidgetType(message);
  if (widget) {
    return { tier: 2, type: 'widget', widget, state };
  }
  
  return { tier: 3, type: 'open-ended', state };
};

