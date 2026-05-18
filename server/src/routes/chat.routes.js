import { Router } from 'express';
import { handleChat, handleStream } from '../controllers/chat.controller.js';

const router = Router();

// POST /api/chat → hybrid intent router (returns JSON or SSE redirect)
router.post('/', handleChat);

// GET /api/chat/stream → pure SSE stream for LLM responses
router.get('/stream', handleStream);

export default router;