// server/src/models/Conversation.js
// ─────────────────────────────────────────────────────────────────────────────
// Conversation history with citation tracking, follow-up linking,
// and learning-path context.
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose';

const CitationSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  url:       { type: String, required: true },
  relevance: { type: Number, min: 0, max: 1 }, // 0–1 confidence score
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  role:          { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content:       { type: String, required: true },
  timestamp:     { type: Date, default: Date.now },
  widgetType:    { type: String, enum: ['timeline', 'quiz', 'map', 'text', 'checklist', null], default: null },
  citations:     [CitationSchema],
  isFollowUp:    { type: Boolean, default: false },
  parentMessageId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { _id: true });

const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true, index: true },
  userId:         { type: String, required: true, index: true },
  sessionId:      { type: String },
  topicPath:      { type: String, default: null },    // current learning path
  messages:       [MessageSchema],
  citationSources: [CitationSchema],                  // all unique citations in session
  isActive:       { type: Boolean, default: true },
  metadata: {
    userAgent:    { type: String },
    ipHash:       { type: String },                   // hashed for privacy
  },
}, { timestamps: true });

// Index for fast session restore on page reload
ConversationSchema.index({ conversationId: 1, updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', ConversationSchema);
