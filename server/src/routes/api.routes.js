// server/src/routes/api.routes.js
import { Router } from 'express';
import { ElectionEvent } from '../models/ElectionEvent.js';
import { UserProgress } from '../models/UserProgress.js';
import { Conversation } from '../models/Conversation.js';
import { getCache, setCache, CACHE_TTL } from '../services/cache.service.js';

const router = Router();

// GET /api/election/:year/timeline
router.get('/election/:year/timeline', async (req, res) => {
  try {
    const { year } = req.params;
    const cacheKey = `timeline:${year}`;
    
    let data = await getCache(cacheKey);
    if (!data) {
      data = await ElectionEvent.findOne({ year: Number(year) }).select('timeline').lean();
      if (data) await setCache(cacheKey, data, CACHE_TTL.TIMELINE);
    }
    
    if (!data) return res.status(404).json({ error: 'Election year not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/election/:year/eligibility/:stateCode
router.get('/election/:year/eligibility/:stateCode', async (req, res) => {
  try {
    const { year, stateCode } = req.params;
    const cacheKey = `eligibility:${year}:${stateCode}`;
    
    let data = await getCache(cacheKey);
    if (!data) {
      // Assuming stateCode lookup in ElectionEvent or static data;
      // here we fallback to general eligibility if state specific is not found.
      const event = await ElectionEvent.findOne({ year: Number(year) }).select('eligibility officialLinks').lean();
      data = event || { error: 'Not found' };
      if (event) await setCache(cacheKey, data, CACHE_TTL.ELIGIBILITY);
    }
    
    if (data.error) return res.status(404).json({ error: 'Eligibility data not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/quiz/submit
router.post('/quiz/submit', async (req, res) => {
  try {
    const { questionId, selectedAnswer, userId } = req.body;
    
    // Mock validation logic since Quiz questions aren't strictly defined in DB
    const correct = selectedAnswer === 'mock_correct_answer' || Math.random() > 0.5;
    const explanation = correct ? 'Correct! Well done.' : 'Incorrect. The right answer is X.';
    
    if (userId) {
      await UserProgress.findOneAndUpdate(
        { userId },
        { $push: { quizScores: { topic: 'General', score: correct ? 10 : 0, maxScore: 10 } } },
        { upsert: true }
      );
    }
    
    res.json({ success: true, data: { correct, explanation, nextQuestion: 'q2' } });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/learning-paths
router.get('/learning-paths', async (req, res) => {
  const paths = [
    { id: 'basics-of-democracy', title: 'Basics of Indian Democracy', steps: 3, estimatedTime: '15m' },
    { id: 'lok-sabha-rajya-sabha', title: 'Lok Sabha vs Rajya Sabha', steps: 4, estimatedTime: '20m' },
    { id: 'voting-process', title: 'Voting & Registration Process', steps: 5, estimatedTime: '25m' },
    { id: 'coalition-govts', title: 'Coalition Governments & Constitutional Processes', steps: 4, estimatedTime: '30m' },
  ];
  res.json({ success: true, data: paths });
});

// POST /api/bookmark
router.post('/bookmark', async (req, res) => {
  try {
    const { userId, messageId } = req.body;
    if (!userId || !messageId) return res.status(400).json({ error: 'Missing parameters' });
    
    await UserProgress.findOneAndUpdate(
      { userId },
      { $addToSet: { bookmarkedMessageIds: messageId } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/conversation/:conversationId
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const convo = await Conversation.findOne({ conversationId }).lean();
    
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ success: true, data: convo });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
