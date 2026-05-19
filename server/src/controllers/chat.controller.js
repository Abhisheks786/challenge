// server/src/controllers/chat.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Hybrid Intent Router: fast structured responses for factual queries,
// SSE streaming for open-ended questions.
// Falls back gracefully to in-memory data when MongoDB is unavailable.
// ─────────────────────────────────────────────────────────────────────────────
import { classifyIntent, detectState, needsLLM } from '../services/intentRouter.js';
import { ELECTION_DATA } from '../data/electionData.js';
import { Conversation } from '../models/Conversation.js';
import { getIsConnected } from '../config/db.js';

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

// ── LLM System Prompt (Mocked) ───────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a nonpartisan Indian election education assistant. Help users 
understand Indian election processes, timelines, voting systems, and 
constitutional procedures accurately and engagingly.

RULES:
1. ACCURACY: Only state verified facts. If uncertain, say 
   "I don't have definitive data — check the Election Commission of India."
2. NEUTRALITY: Never endorse political parties, candidates, or 
   ideological positions.
3. CITE SOURCES: Reference origin of every factual claim 
   (e.g. "According to the Election Commission of India...").
4. SIMPLIFY: If simplifyFor = "eli5", avoid jargon. Use analogies 
   (e.g. "Lok Sabha works like choosing representatives for your area...").
5. CONTEXT-AWARE: If topicPath is set, relate answers to that learning path.
6. SUGGEST NEXT: End every response with 
   "Want to know more about [related topic]?"
7. WIDGET HINT: If a timeline, comparison, or map would help, end with 
   a JSON block: {"suggestWidget": "timeline"} on the last line.

DEFLECT:
- Political endorsements
- Campaign strategy
- Hate speech
- Misinformation
- Unverified EVM tampering claims
- Fake election result rumors
Redirect users to official ECI or government sources instead.

EXAMPLES:
User: "Who can vote in India?"
Assistant: "To vote in India, you must be:
1. An Indian citizen.
2. At least 18 years old on January 1st of the qualifying year.
3. A resident of the polling area where you want to vote.
According to the Election Commission of India, foreign nationals and certain disqualified persons cannot vote. 
Want to know more about the registration process?"

User: "How are Lok Sabha and Rajya Sabha different?"
Assistant: "The Lok Sabha (House of the People) is the lower house, with members directly elected by the public every 5 years. The Rajya Sabha (Council of States) is the upper house, with members indirectly elected by state legislators for a 6-year term. Money bills can only originate in the Lok Sabha.
{"suggestWidget": "comparison"}
Want to know more about how laws are passed?"
`;

const generateAnswer = (intent, message, simplifyFor) => {
  const stateKey = intent.state;
  const state    = stateKey ? ELECTION_DATA.states[stateKey] : null;
  const isEli5   = simplifyFor === 'eli5';

  switch (intent.type) {
    case 'eligibility':
      return isEli5 
        ? `To vote in India, you just need 3 things:\n\n1. Be an Indian citizen.\n2. Be at least 18 years old.\n3. Live where you want to vote.\n\nIt's like getting a membership card for your neighborhood!`
        : `To be eligible to vote in India, you must:\n\n**1. Be an Indian Citizen** — foreign nationals are not eligible.\n\n**2. Be 18 years or older** on January 1st of the qualifying year.\n\n**3. Be an ordinary resident** at the address where you want to register.\n\nYou can register at **voters.eci.gov.in** using Form 6. The National Voter Helpline is **1950** (toll-free).`;
    case 'fact': {
      const fact = ELECTION_DATA.quickFacts[intent.key];
      return `Here's what you need to know about **${intent.key.toUpperCase()}**:\n\n${fact}\n\nFor more details, visit **voters.eci.gov.in** or call the ECI helpline at **1950**.`;
    }
    case 'widget':
      return `Here is information regarding ${intent.widget.title}.`;
    default: {
      const statePart = state ? ` in **${state.name}**` : '';
      return `The Election Commission of India (ECI) oversees all elections${statePart}. Here are the key points:\n\n**Voter Registration:** Use **Form 6** on voters.eci.gov.in to register or update your details. You'll need age proof, address proof, and a passport photo.\n\n**Voter Helpline:** Call **1950** (toll-free) for any election-related queries.\n\n**Check Voter Roll:** Search your name at **voters.eci.gov.in/search-in-electoral-roll**\n\nIs there something more specific I can help you with? Try asking about Form 6 documents, deadlines for a specific state, or voter eligibility.`;
    }
  }
};

// ── Factual Query Handler (returns immediate JSON, <50ms) ────────────────────
export const handleChat = async (req, res) => {
  try {
    const { message, sessionId, topicPath, simplifyFor, includeSourceLinks, parentMessageId } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const intent   = await classifyIntent(message);
    const stateKey = intent.state;
    const state    = stateKey ? ELECTION_DATA.states[stateKey] : null;

    // Save to DB if possible (async, don't await so we don't block response)
    if (sessionId && getIsConnected()) {
      Conversation.findOneAndUpdate(
        { conversationId: sessionId },
        { 
          $setOnInsert: { userId: 'anonymous', isActive: true },
          $set: { topicPath },
          $push: { messages: { role: 'user', content: message, parentMessageId } }
        },
        { upsert: true, new: true }
      ).catch(err => console.error('Error saving user message:', err));
    }

    // Factual intents → instant structured JSON response
    if (intent.tier === 1) {
      let widget = null;
      if (intent.type === 'form6') widget = buildForm6Widget();
      else if (intent.type === 'deadline') widget = buildDeadlineWidget(stateKey);
      else if (intent.type === 'timeline') widget = buildTimelineWidget(state?.name);
      else if (intent.type === 'location') widget = buildLocationWidget();
      
      if (widget) {
        return res.json({
          streaming: false,
          widget,
          dashboard: state ? buildDashboardUpdate(stateKey) : null,
        });
      }
    }
    
    // Tier 2: Static Widget Data Match
    if (intent.tier === 2 && intent.widget && intent.widget.staticData) {
      return res.json({
        streaming: false,
        widget: {
          type: intent.widget.type.toUpperCase(),
          title: intent.widget.title,
          data: intent.widget.structure,
        },
        dashboard: state ? buildDashboardUpdate(stateKey) : null,
      });
    }

    // Open-ended / Tier 3 → redirect to SSE stream
    return res.json({
      streaming: true,
      sseUrl: `/api/chat/stream?message=${encodeURIComponent(message)}&sessionId=${encodeURIComponent(sessionId || '')}&simplifyFor=${encodeURIComponent(simplifyFor || '')}&topicPath=${encodeURIComponent(topicPath || '')}`,
    });
  } catch (error) {
    console.error('handleChat error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ── SSE Streaming Handler (open-ended questions) ─────────────────────────────
export const handleStream = async (req, res) => {
  try {
    const { message, sessionId, simplifyFor, topicPath } = req.query;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering if proxied
    res.flushHeaders();

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    const intent = await classifyIntent(message);
    const answer = generateAnswer(intent, message, simplifyFor);
    const words  = answer.split(' ');

    let fullResponse = '';
    // Stream word-by-word for typing effect
    for (let i = 0; i < words.length; i++) {
      if (abortController.signal.aborted) break;
      const chunk = words[i] + ' ';
      fullResponse += chunk;
      res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      await new Promise(r => setTimeout(r, 40)); // ~25 words/sec typing speed
    }

    if (!abortController.signal.aborted) {
      // Send relevant widget after streaming text
      const stateKey = intent.state;
      const state    = stateKey ? ELECTION_DATA.states[stateKey] : null;

      let widget = null;
      let widgetType = null;
      
      if (intent.tier === 2 && intent.widget) {
        widget = { type: intent.widget.type.toUpperCase(), title: intent.widget.title, data: intent.widget.structure };
        widgetType = intent.widget.type;
      } else if (/register|form|voter id|epic/i.test(message)) {
        widget = buildForm6Widget();
        widgetType = 'checklist';
      } else if (/deadline|date|when/i.test(message)) {
        widget = buildDeadlineWidget(stateKey);
        widgetType = 'timeline';
      } else if (/process|timeline|steps/i.test(message)) {
        widget = buildTimelineWidget(state?.name);
        widgetType = 'timeline';
      }

      if (widget) {
        res.write(`event: widget\ndata: ${JSON.stringify(widget)}\n\n`);
      }

      // Send dashboard update if state was detected
      if (state) {
        const dashUpdate = buildDashboardUpdate(stateKey);
        res.write(`event: dashboard\ndata: ${JSON.stringify(dashUpdate)}\n\n`);
      }
      
      const citations = [
        { title: 'Election Commission of India', url: 'https://eci.gov.in', relevance: 0.95 }
      ];
      
      res.write(`event: citations\ndata: ${JSON.stringify({ citations })}\n\n`);

      // Suggest follow-up chips
      res.write(`event: widget\ndata: ${JSON.stringify({
        type: 'QUICK_CHIPS',
        chips: [
          { id: 'c1', label: 'Form 6 Documents', prompt: 'What documents do I need for Form 6?', icon: '📋' },
          { id: 'c2', label: 'Check Eligibility', prompt: 'Am I eligible to vote in India?', icon: '✅' },
          { id: 'c3', label: 'Election Deadline', prompt: 'When is the election deadline?', icon: '📅' },
        ],
      })}\n\n`);
      
      // Save assistant message to DB
      if (sessionId && getIsConnected()) {
        Conversation.findOneAndUpdate(
          { conversationId: sessionId },
          { 
            $push: { 
              messages: { 
                role: 'assistant', 
                content: fullResponse, 
                widgetType: widgetType,
                citations: citations
              } 
            }
          }
        ).catch(err => console.error('Error saving assistant message:', err));
      }
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