// server/src/models/ElectionEvent.js
// ─────────────────────────────────────────────────────────────────────────────
// Canonical election data per year — phases, eligibility, official links.
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose';

const PhaseSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  startDate:   { type: Date,   required: true },
  endDate:     { type: Date,   required: true },
  description: { type: String, required: true },
  color:       { type: String, default: '#f97316' }, // Tailwind orange-500
}, { _id: false });

const OfficialLinksSchema = new mongoose.Schema({
  eci:         { type: String, default: 'https://eci.gov.in' },
  nvsp:        { type: String, default: 'https://nvsp.in' },
  voterPortal: { type: String, default: 'https://voterportal.eci.gov.in' },
  voters:      { type: String, default: 'https://voters.eci.gov.in' },
}, { _id: false });

const EligibilitySchema = new mongoose.Schema({
  minimumAge:            { type: Number, default: 18 },
  citizenshipRequired:   { type: Boolean, default: true },
  residencyRequired:     { type: Boolean, default: true },
  disqualifications:     [String],
  notes:                 { type: String },
}, { _id: false });

const ElectionEventSchema = new mongoose.Schema({
  year:          { type: Number, required: true, unique: true, index: true },
  title:         { type: String, required: true },
  type:          { type: String, enum: ['general', 'state', 'by-election'], default: 'general' },
  description:   { type: String },
  timeline:      [PhaseSchema],
  eligibility:   EligibilitySchema,
  officialLinks: OfficialLinksSchema,
  totalSeats:    { type: Number },
  voter_turnout: { type: Number }, // percentage
  result:        { type: String },
}, { timestamps: true });

export const ElectionEvent = mongoose.model('ElectionEvent', ElectionEventSchema);
