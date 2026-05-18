// server/src/controllers/chat.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Hybrid Intent Router: fast structured responses for factual queries,
// SSE streaming for open-ended questions.
// Falls back gracefully to in-memory data when MongoDB is unavailable.
// ─────────────────────────────────────────────────────────────────────────────
import { classifyIntent, detectState } from '../services/intentRouter.js';
import { ELECTION_DATA } from '../data/electionData.js';

// ── Widget builders ──────────────────────────────────────────────────────────

const buildForm6Widget = () => ({
  type: 'CHECKLIST',
  title: ELECTION_DATA.form6.title,
  items: ELECTION_DATA.form6.items,
});

const buildTimelineWidget = (stateName) => ({
  type: 'TIMELINE',
  title: `Election Timeline${stateName ? ' — ' + stateName : ''}`,
  steps: ELECTION_DATA.timeline.general,
});

const buildDeadlineWidget = (stateKey) => {
  const state = stateKey ? ELECTION_DATA.states[stateKey] : null;
  if (!state) {
    return {
      type: 'TIMELINE',
      title: 'Key Election Deadlines',
      steps: [
        { id: 'd1', title: 'Form 6 Submission', description: 'Register as a new voter', status: 'active', date: '45 days before polling' },
        { id: 'd2', title: 'Corrections (Form 8)', description: 'Fix errors in your existing voter entry', status: 'upcoming', date: '30 days before polling' },
        { id: 'd3', title: 'Draft Roll Publication', description: 'Provisional electoral rolls published', status: 'upcoming', date: '28 days before polling' },
        { id: 'd4', title: 'Final Roll Publication', description: 'Official voter list finalized', status: 'upcoming', date: '10 days before polling' },
      ],
    };
  }
  const regDate  = new Date(state.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const elecDate = new Date(state.electionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return {
    type: 'TIMELINE',
    title: `Deadlines — ${state.name}`,
    steps: [
      { id: 'd1', title: 'Voter Registration Deadline', description: `Submit Form 6 before ${regDate}`, status: 'active' },
      { id: 'd2', title: 'Electoral Roll Published', description: 'Final voter list available on voters.eci.gov.in', status: 'upcoming' },
      { id: 'd3', title: 'Election Day', description: elecDate, status: 'upcoming' },
    ],
  };
};

const buildLocationWidget = () => ({
  type: 'LOCATION',
  placeholder: 'Type your State or District...',
  resultsFor: 'voter registration centre',
});

const buildDashboardUpdate = (stateKey) => {
  const state = stateKey ? ELECTION_DATA.states[stateKey] : null;
  if (!state) return null;
  const regDate = new Date(state.registrationDeadline);
  return {
    location: { state: state.name, confirmed: true },
    electionPhase: { name: state.phase, activeFrom: state.phaseStart },
    upcomingDeadlines: [
      { label: 'Voter Registration', date: regDate.toISOString(), urgency: 'high' },
      { label: 'Election Day', date: new Date(state.electionDate).toISOString(), urgency: 'medium' },
    ],
  };
};

// ── LLM-style streaming response generator ───────────────────────────────────
// Generates contextual answers from in-memory data with word-by-word streaming.
const generateAnswer = (intent, message) => {
  const stateKey = intent.state;
  const state    = stateKey ? ELECTION_DATA.states[stateKey] : null;

  switch (intent.type) {
    case 'eligibility':
      return `To be eligible to vote in India, you must:\n\n**1. Be an Indian Citizen** — foreign nationals are not eligible.\n\n**2. Be 18 years or older** on January 1st of the qualifying year.\n\n**3. Be an ordinary resident** at the address where you want to register.\n\nYou can register at **voters.eci.gov.in** using Form 6. The National Voter Helpline is **1950** (toll-free).`;
    case 'fact': {
      const fact = ELECTION_DATA.quickFacts[intent.key];
      return `Here's what you need to know about **${intent.key.toUpperCase()}**:\n\n${fact}\n\nFor more details, visit **voters.eci.gov.in** or call the ECI helpline at **1950**.`;
    }
    default: {
      const statePart = state ? ` in **${state.name}**` : '';
      return `The Election Commission of India (ECI) oversees all elections${statePart}. Here are the key points:\n\n**Voter Registration:** Use **Form 6** on voters.eci.gov.in to register or update your details. You'll need age proof, address proof, and a passport photo.\n\n**Voter Helpline:** Call **1950** (toll-free) for any election-related queries.\n\n**Check Voter Roll:** Search your name at **voters.eci.gov.in/search-in-electoral-roll**\n\nIs there something more specific I can help you with? Try asking about Form 6 documents, deadlines for a specific state, or voter eligibility.`;
    }
  }
};

// ── Factual Query Handler (returns immediate JSON, <50ms) ────────────────────
export const handleChat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const intent   = classifyIntent(message);
    const stateKey = intent.state;
    const state    = stateKey ? ELECTION_DATA.states[stateKey] : null;

    // Factual intents → instant structured JSON response
    switch (intent.type) {
      case 'form6':
        return res.json({
          streaming: false,
          widget: buildForm6Widget(),
          dashboard: state ? buildDashboardUpdate(stateKey) : null,
        });

      case 'deadline':
        return res.json({
          streaming: false,
          widget: buildDeadlineWidget(stateKey),
          dashboard: state ? buildDashboardUpdate(stateKey) : null,
        });

      case 'timeline':
        return res.json({
          streaming: false,
          widget: buildTimelineWidget(state?.name),
          dashboard: state ? buildDashboardUpdate(stateKey) : null,
        });

      case 'location':
        return res.json({
          streaming: false,
          widget: buildLocationWidget(),
          dashboard: null,
        });

      default:
        // Open-ended → redirect to SSE stream
        return res.json({
          streaming: true,
          sseUrl: `/api/chat/stream?message=${encodeURIComponent(message)}&sessionId=${encodeURIComponent(sessionId || '')}`,
        });
    }
  } catch (error) {
    console.error('handleChat error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ── SSE Streaming Handler (open-ended questions) ─────────────────────────────
export const handleStream = async (req, res) => {
  try {
    const message   = req.query.message;
    const sessionId = req.query.sessionId;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering if proxied
    res.flushHeaders();

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    const intent = classifyIntent(message);
    const answer = generateAnswer(intent, message);
    const words  = answer.split(' ');

    // Stream word-by-word for typing effect
    for (let i = 0; i < words.length; i++) {
      if (abortController.signal.aborted) break;
      res.write(`event: chunk\ndata: ${JSON.stringify({ text: words[i] + ' ' })}\n\n`);
      await new Promise(r => setTimeout(r, 40)); // ~25 words/sec typing speed
    }

    if (!abortController.signal.aborted) {
      // Send relevant widget after streaming text
      const stateKey = intent.state;
      const state    = stateKey ? ELECTION_DATA.states[stateKey] : null;

      let widget = null;
      if (/register|form|voter id|epic/i.test(message)) {
        widget = buildForm6Widget();
      } else if (/deadline|date|when/i.test(message)) {
        widget = buildDeadlineWidget(stateKey);
      } else if (/process|timeline|steps/i.test(message)) {
        widget = buildTimelineWidget(state?.name);
      }

      if (widget) {
        res.write(`event: widget\ndata: ${JSON.stringify(widget)}\n\n`);
      }

      // Send dashboard update if state was detected
      if (state) {
        const dashUpdate = buildDashboardUpdate(stateKey);
        res.write(`event: dashboard\ndata: ${JSON.stringify(dashUpdate)}\n\n`);
      }

      // Suggest follow-up chips
      res.write(`event: widget\ndata: ${JSON.stringify({
        type: 'QUICK_CHIPS',
        chips: [
          { id: 'c1', label: 'Form 6 Documents', prompt: 'What documents do I need for Form 6?', icon: '📋' },
          { id: 'c2', label: 'Check Eligibility', prompt: 'Am I eligible to vote in India?', icon: '✅' },
          { id: 'c3', label: 'Election Deadline', prompt: 'When is the election deadline?', icon: '📅' },
        ],
      })}\n\n`);
    }

    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (error) {
    console.error('handleStream error:', error);
    if (res.headersSent) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Server error' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};