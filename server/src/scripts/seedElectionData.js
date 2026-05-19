// server/src/scripts/seedElectionData.js
// Run: node server/src/scripts/seedElectionData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://a:a@cluster0.d9c4pj5.mongodb.net/?appName=Cluster0';

// ─── Inline schemas (avoids import issues when running as standalone) ─────────
const phaseSchema = new mongoose.Schema({ name: String, startDate: Date, endDate: Date, description: String, color: String }, { _id: false });
const electionEventSchema = new mongoose.Schema({ year: { type: Number, unique: true }, title: String, type: String, description: String, timeline: [phaseSchema], eligibility: mongoose.Schema.Types.Mixed, officialLinks: mongoose.Schema.Types.Mixed, totalSeats: Number, voter_turnout: Number }, { timestamps: true });
const widgetTemplateSchema = new mongoose.Schema({ name: { type: String, unique: true }, type: String, title: String, description: String, structure: mongoose.Schema.Types.Mixed, staticData: Boolean, tags: [String], triggers: [String] }, { timestamps: true });
const userProgressSchema = new mongoose.Schema({ userId: { type: String, unique: true }, conversationId: String, currentPath: String, completedTopics: [String], quizScores: [mongoose.Schema.Types.Mixed], bookmarkedMessageIds: [String] }, { timestamps: true });

const ElectionEvent = mongoose.models.ElectionEvent || mongoose.model('ElectionEvent', electionEventSchema);
const WidgetTemplate = mongoose.models.WidgetTemplate || mongoose.model('WidgetTemplate', widgetTemplateSchema);

// ─── 2024 General Election Data ───────────────────────────────────────────────
const election2024 = {
  year: 2024,
  title: '18th Indian General Election (Lok Sabha 2024)',
  type: 'general',
  description: 'The 18th Indian General Election was held in 7 phases across April–June 2024 to elect 543 members to the Lok Sabha.',
  totalSeats: 543,
  voter_turnout: 66.14,
  officialLinks: {
    eci: 'https://eci.gov.in',
    nvsp: 'https://nvsp.in',
    voterPortal: 'https://voterportal.eci.gov.in',
    voters: 'https://voters.eci.gov.in',
  },
  eligibility: {
    minimumAge: 18,
    citizenshipRequired: true,
    residencyRequired: true,
    disqualifications: [
      'Non-citizens of India',
      'Persons of unsound mind (as declared by court)',
      'Persons disqualified under any law relating to corrupt practices',
      'Serving prison sentences',
    ],
    notes: 'Age is calculated as of January 1 of the qualifying year.',
  },
  timeline: [
    { name: 'Election Announcement', startDate: new Date('2024-03-16'), endDate: new Date('2024-03-16'), description: 'Election Commission of India announced the 2024 General Election schedule. Model Code of Conduct came into effect immediately.', color: '#8b5cf6' },
    { name: 'Phase 1 Voting', startDate: new Date('2024-04-19'), endDate: new Date('2024-04-19'), description: 'Phase 1 voting across 102 constituencies in 21 states/UTs including Rajasthan, Uttarakhand, and Tamil Nadu.', color: '#f97316' },
    { name: 'Phase 2 Voting', startDate: new Date('2024-04-26'), endDate: new Date('2024-04-26'), description: 'Phase 2 voting across 89 constituencies in 13 states/UTs.', color: '#f97316' },
    { name: 'Phase 3 Voting', startDate: new Date('2024-05-07'), endDate: new Date('2024-05-07'), description: 'Phase 3 voting across 94 constituencies including Gujarat and Goa.', color: '#f97316' },
    { name: 'Phase 4 Voting', startDate: new Date('2024-05-13'), endDate: new Date('2024-05-13'), description: 'Phase 4 voting across 96 constituencies including Andhra Pradesh and Telangana.', color: '#f97316' },
    { name: 'Phase 5 Voting', startDate: new Date('2024-05-20'), endDate: new Date('2024-05-20'), description: 'Phase 5 voting across 49 constituencies including parts of Uttar Pradesh and Rajasthan.', color: '#f97316' },
    { name: 'Phase 6 Voting', startDate: new Date('2024-05-25'), endDate: new Date('2024-05-25'), description: 'Phase 6 voting across 58 constituencies including Delhi and Haryana.', color: '#f97316' },
    { name: 'Phase 7 Voting', startDate: new Date('2024-06-01'), endDate: new Date('2024-06-01'), description: 'Final phase voting across 57 constituencies including Punjab and Bihar.', color: '#f97316' },
    { name: 'Vote Counting & Results', startDate: new Date('2024-06-04'), endDate: new Date('2024-06-04'), description: 'Counting of votes began at 8 AM. NDA secured majority with BJP winning 240 seats.', color: '#22c55e' },
    { name: 'Government Formation', startDate: new Date('2024-06-09'), endDate: new Date('2024-06-09'), description: 'Narendra Modi sworn in as Prime Minister for a third term. NDA coalition government formed.', color: '#3b82f6' },
  ],
};

// ─── Widget Templates ─────────────────────────────────────────────────────────
const widgetTemplates = [
  {
    name: 'lok-sabha-election-timeline',
    type: 'timeline',
    title: '2024 Lok Sabha Election Timeline',
    description: 'All 7 phases of the 2024 General Election',
    staticData: true,
    tags: ['lok sabha', 'timeline', '2024', 'general election'],
    triggers: ['lok sabha timeline', 'election phases', '2024 election schedule'],
    structure: { phases: 7, totalSeats: 543, year: 2024 },
  },
  {
    name: 'lok-sabha-vs-rajya-sabha',
    type: 'comparison',
    title: 'Lok Sabha vs Rajya Sabha',
    description: 'Side-by-side comparison of both Houses of Parliament',
    staticData: true,
    tags: ['parliament', 'lok sabha', 'rajya sabha', 'comparison'],
    triggers: ['lok sabha rajya sabha', 'difference between', 'upper house lower house'],
    structure: {
      items: [
        { label: 'Full Name', a: 'Lok Sabha (House of the People)', b: 'Rajya Sabha (Council of States)' },
        { label: 'Type', a: 'Lower House', b: 'Upper House' },
        { label: 'Total Seats', a: '543 elected + 2 nominated', b: '238 elected + 12 nominated' },
        { label: 'Election', a: 'Direct election by citizens every 5 years', b: 'Indirect election by State legislatures' },
        { label: 'Term', a: '5 years (can be dissolved)', b: '6 years per member (permanent body)' },
        { label: 'Money Bills', a: 'Originates here; Rajya Sabha cannot reject', b: 'Can suggest changes, cannot reject' },
        { label: 'Minimum Age', a: '25 years', b: '30 years' },
        { label: 'Speaker/Chair', a: 'Speaker of the Lok Sabha', b: 'Vice President of India (ex-officio)' },
      ],
    },
  },
  {
    name: 'voter-registration-checklist',
    type: 'checklist',
    title: 'Voter Registration (Form 6) Checklist',
    description: 'Required documents and steps for voter registration',
    staticData: true,
    tags: ['registration', 'form 6', 'voter id', 'epic'],
    triggers: ['register to vote', 'form 6', 'voter id', 'how to register'],
    structure: {
      items: [
        { id: 1, label: 'Proof of Age', detail: 'Birth certificate / Class 10 marksheet / Passport', required: true },
        { id: 2, label: 'Proof of Address', detail: 'Aadhaar / Utility bill / Bank statement (not older than 3 months)', required: true },
        { id: 3, label: 'Passport-size Photo', detail: '2 copies, white background, taken within 6 months', required: true },
        { id: 4, label: 'Aadhaar Card', detail: 'Highly recommended — speeds up verification', required: false },
        { id: 5, label: 'Filled Form 6', detail: 'Submit on voters.eci.gov.in or at BLO office', required: true },
      ],
    },
  },
  {
    name: 'evm-vvpat-explainer',
    type: 'faq',
    title: 'EVM & VVPAT: How They Work',
    description: 'Explainer on Electronic Voting Machines and VVPAT',
    staticData: true,
    tags: ['evm', 'vvpat', 'voting machine', 'technology'],
    triggers: ['evm', 'vvpat', 'voting machine', 'electronic voting'],
    structure: {
      items: [
        { q: 'What is an EVM?', a: 'An Electronic Voting Machine (EVM) is a simple electronic device used to cast and count votes. It consists of two units: the Control Unit (with the polling officer) and the Balloting Unit (with the voter).' },
        { q: 'What is VVPAT?', a: 'Voter Verifiable Paper Audit Trail (VVPAT) is a paper slip printer attached to the EVM. After voting, it prints a slip showing the symbol and name of the candidate you voted for. The slip is visible for 7 seconds before dropping into a sealed box.' },
        { q: 'Are EVMs tamper-proof?', a: 'According to the Election Commission of India, EVMs are standalone devices not connected to any network (internet, Bluetooth, or wifi). They use one-time programmable chips that cannot be reprogrammed once manufactured. The Supreme Court of India has upheld their integrity.' },
        { q: 'How many VVPAT slips are counted?', a: 'As per the Supreme Court order, 5 randomly selected VVPAT units per assembly segment are matched against EVM counts during counting.' },
      ],
    },
  },
];

// ─── Seed Function ─────────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB');

    // 1. Seed election events
    console.log('\n📅 Seeding election events...');
    await ElectionEvent.deleteMany({});
    await ElectionEvent.create(election2024);
    console.log('  ✓ 2024 General Election seeded');

    // 2. Seed widget templates
    console.log('\n🧩 Seeding widget templates...');
    await WidgetTemplate.deleteMany({});
    await WidgetTemplate.insertMany(widgetTemplates);
    console.log(`  ✓ ${widgetTemplates.length} widget templates seeded`);

    console.log('\n✅ Seeding complete!');
    console.log('   Run your server and all endpoints will now have data.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
