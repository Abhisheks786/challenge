// server/src/data/electionData.js
// ─────────────────────────────────────────────────────────────────────────────
// In-memory Indian election data. Used when MongoDB is unavailable.
// Covers all major states with real ECI Form 6 guidelines and deadlines.
// ─────────────────────────────────────────────────────────────────────────────

export const ELECTION_DATA = {
  states: {
    'uttar pradesh': {
      name: 'Uttar Pradesh',
      registrationDeadline: '2024-11-01',
      electionDate: '2024-11-15',
      phase: 'Voter Registration Drive',
      phaseStart: 'Sep 2024',
      districts: ['Lucknow', 'Varanasi', 'Agra', 'Kanpur', 'Prayagraj', 'Meerut'],
    },
    'maharashtra': {
      name: 'Maharashtra',
      registrationDeadline: '2024-10-15',
      electionDate: '2024-11-20',
      phase: 'Model Code of Conduct',
      phaseStart: 'Oct 2024',
      districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
    },
    'delhi': {
      name: 'Delhi',
      registrationDeadline: '2025-01-10',
      electionDate: '2025-02-05',
      phase: 'Campaign Period',
      phaseStart: 'Jan 2025',
      districts: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
    },
    'west bengal': {
      name: 'West Bengal',
      registrationDeadline: '2026-03-01',
      electionDate: '2026-04-01',
      phase: 'Pre-Election',
      phaseStart: 'Feb 2026',
      districts: ['Kolkata', 'Howrah', 'Siliguri', 'Asansol', 'Durgapur'],
    },
    'bihar': {
      name: 'Bihar',
      registrationDeadline: '2025-09-01',
      electionDate: '2025-10-15',
      phase: 'Pre-Election',
      phaseStart: 'Aug 2025',
      districts: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
    },
  },

  form6: {
    title: 'Form 6 — Voter Registration Checklist',
    description: 'Required to register as a new voter or update your constituency.',
    items: [
      { id: 'f1', label: 'Proof of Age (Birth Certificate / Class 10 Marksheet / Passport)', required: true, hint: 'Must be original + self-attested photocopy' },
      { id: 'f2', label: 'Proof of Ordinary Residence (Aadhaar / Utility Bill / Bank Statement)', required: true, hint: 'Document must show current address, not older than 3 months' },
      { id: 'f3', label: 'Recent Passport-size Photograph (2 copies)', required: true, hint: 'White background, taken within last 6 months' },
      { id: 'f4', label: 'Aadhaar Card (highly recommended)', required: false, hint: 'Linking Aadhaar speeds up verification significantly' },
      { id: 'f5', label: 'Self-declaration of citizenship', required: true, hint: 'Included in the Form 6 itself — no separate document needed' },
      { id: 'f6', label: 'Filled Form 6 (online or offline)', required: true, hint: 'Submit on voters.eci.gov.in or at your local BLO office' },
    ],
  },

  timeline: {
    general: [
      { id: 't1', title: 'Voter Registration (Form 6)', description: 'Register or update your voter ID on voters.eci.gov.in', status: 'active', date: '45 days before election' },
      { id: 't2', title: 'Electoral Roll Publication', description: 'Final voter list published by ECI', status: 'upcoming', date: '30 days before election' },
      { id: 't3', title: 'Model Code of Conduct', description: "Political parties must follow ECI's code from this date", status: 'upcoming', date: '3-4 weeks before election' },
      { id: 't4', title: 'Nomination Filing', description: 'Candidates file their nomination papers', status: 'upcoming', date: '2 weeks before election' },
      { id: 't5', title: 'Campaign Period Ends', description: 'No campaigning 48 hours before polling', status: 'upcoming', date: '2 days before election' },
      { id: 't6', title: 'Polling Day', description: 'Cast your vote at your designated booth', status: 'upcoming', date: 'Election day' },
      { id: 't7', title: 'Counting & Results', description: 'Votes counted; results announced', status: 'upcoming', date: '1-3 days after election' },
    ],
  },

  quickFacts: {
    'eligibility': 'Indian citizen, 18+ years old on Jan 1 of the qualifying year, ordinarily resident at the address',
    'eci website': 'voters.eci.gov.in — register, check rolls, download e-EPIC card',
    'helpline': '1950 — National Voter Helpline (toll-free)',
    'voter id': 'Apply online at voters.eci.gov.in → Apply for new voter registration (Form 6)',
    'epic': 'Electoral Photo Identity Card — your official voter ID card issued by ECI',
    'blo': 'Booth Level Officer — local official who verifies your registration. Find yours on the ECI website.',
    'form 7': 'Form 7 is used to object to inclusion of a name in the electoral roll',
    'form 8': 'Form 8 is used to correct entries or shift your registration to a new address',
  },
};
