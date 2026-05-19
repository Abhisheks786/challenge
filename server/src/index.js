import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { connectRedis } from './services/cache.service.js';
import chatRoutes from './routes/chat.routes.js';
import apiRoutes from './routes/api.routes.js'; // Will create this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from the Vite dev server
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Connect to MongoDB & Redis
connectDB();
connectRedis();

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api', apiRoutes); // Mount general API endpoints

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});