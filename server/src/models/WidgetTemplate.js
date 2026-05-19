// server/src/models/WidgetTemplate.js
// ─────────────────────────────────────────────────────────────────────────────
// Pre-built structured response templates — no LLM needed for staticData types.
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose';

const WidgetTemplateSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, index: true },
  type:        { type: String, enum: ['timeline', 'comparison', 'map', 'quiz', 'checklist', 'faq'], required: true },
  title:       { type: String, required: true },
  description: { type: String },
  structure:   { type: mongoose.Schema.Types.Mixed, required: true }, // JSON blob
  staticData:  { type: Boolean, default: false }, // if true → skip LLM entirely
  tags:        [String],
  triggers:    [String], // regex strings that trigger this widget
}, { timestamps: true });

export const WidgetTemplate = mongoose.model('WidgetTemplate', WidgetTemplateSchema);
