// server/src/models/UserProgress.js
// ─────────────────────────────────────────────────────────────────────────────
// Per-user learning state — completed topics, quiz scores, bookmarks.
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose';

const QuizScoreSchema = new mongoose.Schema({
  topic:    { type: String, required: true },
  score:    { type: Number, required: true, min: 0, max: 100 },
  maxScore: { type: Number, required: true },
  date:     { type: Date, default: Date.now },
}, { _id: false });

const UserProgressSchema = new mongoose.Schema({
  userId:            { type: String, required: true, unique: true, index: true },
  conversationId:    { type: String, index: true },
  currentPath:       { type: String, default: null }, // e.g. "basics-of-democracy"
  completedTopics:   [String],
  quizScores:        [QuizScoreSchema],
  bookmarkedMessageIds: [String],
  lastActiveAt:      { type: Date, default: Date.now },
}, { timestamps: true });

export const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
