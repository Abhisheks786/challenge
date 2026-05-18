# 🗳️ Election Assistant — Full-Stack MERN Application

## Stack
- **Frontend**: React + Vite, Tailwind CSS, Zustand
- **Backend**: Node.js + Express.js  
- **DB**: MongoDB + Redis
- **Streaming**: Server-Sent Events (SSE)
- **Performance**: react-virtuoso, react-markdown

## Quick Start
```bash
# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm run dev
```

## Architecture
- **70/30 split** desktop layout: Chat (left) + Dashboard (right)
- **Hybrid routing**: factual queries → MongoDB/Redis (<50ms), open-ended → LLM via SSE
- **Widget system**: structured JSON responses rendered as interactive UI components
