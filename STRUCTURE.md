election-assistant/
├── README.md
│
├── client/                          # React + Vite Frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       │
│       ├── layout/
│       │   ├── AppShell.tsx         # 70/30 split container
│       │   ├── MobileBottomSheet.tsx
│       │   └── Sidebar.tsx          # Election Dashboard (30%)
│       │
│       ├── components/
│       │   ├── chat/
│       │   │   ├── ChatContainer.tsx    # Virtualized message list
│       │   │   ├── MessageItem.tsx      # Single message renderer
│       │   │   ├── ChatInput.tsx        # Input + debounced autocomplete
│       │   │   ├── SkeletonMessage.tsx  # Loading skeleton
│       │   │   └── StreamingText.tsx    # SSE text streamer
│       │   │
│       │   └── widgets/
│       │       ├── WidgetRenderer.tsx   # JSON → component router
│       │       ├── TimelineStepper.tsx  # Election timeline widget
│       │       ├── ChecklistWidget.tsx  # Form 6 checklist widget
│       │       ├── CountdownTimer.tsx   # Deadline countdown widget
│       │       ├── QuickChips.tsx       # Quick-reply chip buttons
│       │       └── LocationInput.tsx    # Debounced autocomplete
│       │
│       ├── dashboard/
│       │   ├── ElectionDashboard.tsx    # Right panel (30%)
│       │   ├── CountdownPanel.tsx
│       │   ├── LocationStatus.tsx
│       │   └── RegistrationChecklist.tsx
│       │
│       ├── store/
│       │   └── useElectionStore.ts      # Zustand store (chat + dashboard)
│       │
│       ├── hooks/
│       │   ├── useSSE.ts               # SSE connection hook
│       │   ├── useDebounce.ts          # Debounce utility hook
│       │   └── useLocationSearch.ts    # Location autocomplete logic
│       │
│       └── lib/
│           ├── api.ts                  # Axios client config
│           └── constants.ts
│
├── server/                          # Express.js Backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                 # Entry point
│       │
│       ├── config/
│       │   ├── db.ts                # MongoDB connection
│       │   ├── redis.ts             # Redis connection
│       │   └── env.ts               # Env validation
│       │
│       ├── models/
│       │   ├── ElectionRule.ts      # MongoDB schema
│       │   ├── UserSession.ts
│       │   └── Region.ts
│       │
│       ├── routes/
│       │   ├── chat.routes.ts       # /api/chat (SSE + factual)
│       │   ├── election.routes.ts   # /api/election/:state
│       │   └── location.routes.ts   # /api/location/search
│       │
│       ├── controllers/
│       │   ├── chat.controller.ts   # Hybrid intent router
│       │   ├── election.controller.ts
│       │   └── location.controller.ts
│       │
│       ├── services/
│       │   ├── intentRouter.ts      # Factual vs LLM classifier
│       │   ├── llmStream.ts         # LLM SSE streaming
│       │   ├── electionData.ts      # DB + Redis query service
│       │   └── widgetBuilder.ts     # JSON widget factory
│       │
│       └── middleware/
│           ├── rateLimiter.ts
│           ├── sessionAuth.ts
│           └── errorHandler.ts
│
└── shared/
    ├── types.ts                     # Shared TS interfaces
    └── constants.ts                 # Widget type enums etc.
