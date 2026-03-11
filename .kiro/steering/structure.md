# Project Structure

## Directory Layout

```
superstash/
├── .git/                          # Git repository
├── .gitignore                     # Git ignore rules
├── .kiro/                         # Kiro configuration
│   └── steering/                  # Steering documents
│       ├── product.md             # Product overview
│       ├── tech.md                # Technology stack
│       └── structure.md           # This file
├── planning/                      # Project planning
│   └── Concept.md                 # Detailed concept and roadmap
├── backend/                       # Node.js backend API
│   ├── src/
│   │   ├── api/                   # API endpoints
│   │   │   ├── projects.ts        # Project endpoints
│   │   │   ├── payments.ts        # Payment endpoints
│   │   │   ├── analytics.ts       # Analytics endpoints
│   │   │   └── wizard.ts          # Wizard endpoints
│   │   ├── adapters/              # Project adapters
│   │   │   ├── nodeAdapter.ts     # Node.js project adapter
│   │   │   ├── pythonAdapter.py   # Python project adapter
│   │   │   ├── phpAdapter.php     # PHP project adapter
│   │   │   ├── restAdapter.ts     # Generic REST adapter
│   │   │   └── dbAdapter.ts       # Database adapter
│   │   ├── workers/               # Background jobs
│   │   │   ├── syncWorker.ts      # Data sync worker
│   │   │   ├── analyticsWorker.ts # Analytics aggregation
│   │   │   └── paymentWorker.ts   # Payment reconciliation
│   │   ├── db/                    # Database layer
│   │   │   ├── prisma.ts          # Prisma client setup
│   │   │   └── schema.prisma      # Database schema
│   │   ├── utils/                 # Utility functions
│   │   │   ├── logger.ts          # Logging utility
│   │   │   ├── webhookHandler.ts  # Webhook processing
│   │   │   └── validators.ts      # Data validation
│   │   └── server.ts              # Main server entry point
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   └── Dockerfile                 # Docker image definition
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── ProjectList.tsx    # Project list view
│   │   │   ├── ProjectCard.tsx    # Project card component
│   │   │   ├── AnalyticsChart.tsx # Analytics visualization
│   │   │   ├── Wizard.tsx         # Project wizard
│   │   │   └── Dashboard.tsx      # Main dashboard
│   │   ├── pages/                 # Page components
│   │   │   ├── index.tsx          # Home page
│   │   │   ├── project/[id].tsx   # Project detail page
│   │   │   └── wizard.tsx         # Wizard page
│   │   ├── services/              # API services
│   │   │   ├── api.ts             # Unified API client
│   │   │   ├── websocket.ts       # WebSocket client
│   │   │   └── auth.ts            # Authentication service
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── types/                 # TypeScript types
│   │   ├── styles/                # Global styles
│   │   └── App.tsx                # Root component
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   └── Dockerfile                 # Docker image definition
├── example-projects/              # Example projects for testing
│   ├── node-project/              # Example Node.js project
│   │   ├── src/
│   │   │   └── server.ts          # Express/Fastify server
│   │   ├── package.json
│   │   └── Dockerfile
│   └── python-project/            # Example Python project
│       ├── server.py              # Flask/FastAPI server
│       ├── requirements.txt       # Python dependencies
│       └── Dockerfile
├── docs/                          # Documentation
│   ├── adapters.md                # How to write adapters
│   ├── integration-guide.md       # Integration setup guide
│   ├── api.md                     # API documentation
│   └── deployment.md              # Deployment guide
├── docker-compose.yml             # Docker Compose configuration
└── README.md                      # Project README

```

## Key Directories Explained

### `/backend`
Contains the Node.js API server that orchestrates all project adapters and serves the frontend. Handles:
- REST/GraphQL endpoints for the dashboard
- Adapter management and routing
- Database operations via Prisma ORM
- Background job scheduling
- WebSocket connections for real-time updates

### `/frontend`
React-based dashboard UI. Includes:
- Project list and detail views
- Analytics visualization
- Plug-and-play wizard for adding projects
- Real-time updates via WebSocket
- User authentication and team management

### `/example-projects`
Sample projects (Node.js and Python) that demonstrate how to integrate with Superstash. Used for:
- Testing adapter functionality
- Documentation examples
- Development and debugging

### `/docs`
Comprehensive documentation including:
- Adapter development guide
- Integration setup instructions
- API reference
- Deployment procedures

## File Naming Conventions

- **TypeScript files:** `camelCase.ts` (e.g., `nodeAdapter.ts`)
- **React components:** `PascalCase.tsx` (e.g., `ProjectCard.tsx`)
- **Python files:** `snake_case.py` (e.g., `python_adapter.py`)
- **Configuration files:** lowercase with hyphens (e.g., `docker-compose.yml`)
- **Documentation:** `kebab-case.md` (e.g., `integration-guide.md`)

## Module Organization

### Adapters
Each adapter normalizes project data to the `UnifiedProject` schema:
- **Input:** Project-specific data (REST endpoint, database, etc.)
- **Output:** Standardized `UnifiedProject` object
- **Pattern:** Adapter per technology (Node, Python, PHP, REST, DB)

### Workers
Background jobs handle asynchronous tasks:
- **Sync Worker:** Periodic data fetching and updates
- **Analytics Worker:** Aggregates metrics from multiple sources
- **Payment Worker:** Reconciles payment data

### API Layer
RESTful endpoints expose functionality to the frontend:
- `/api/projects` - Project management
- `/api/payments` - Payment tracking
- `/api/analytics` - Analytics data
- `/api/wizard` - Project addition wizard

## Database Schema

Core tables in PostgreSQL:
- `UnifiedProject` - Normalized project data
- `Users` - User accounts
- `Teams` - Team management
- `Logs` - Event history
- `Payments` - Payment records

See `backend/prisma/schema.prisma` for complete schema definition.

## Development Workflow

1. **Local Development:** Use `docker-compose up` to start all services
2. **Code Changes:** Edit files in `backend/src` or `frontend/src`
3. **Hot Reload:** Services automatically reload on file changes
4. **Testing:** Run tests with `npm test` in respective directories
5. **Database:** Migrations managed via Prisma

## Adding New Features

1. **New Adapter:** Create file in `backend/src/adapters/`
2. **New API Endpoint:** Add to `backend/src/api/`
3. **New UI Component:** Create in `frontend/src/components/`
4. **New Worker:** Add to `backend/src/workers/`
5. **Database Changes:** Update `backend/prisma/schema.prisma` and run migrations

## Important Notes

- All project data normalizes to `UnifiedProject` schema for consistency
- Adapters are independent and can be added without modifying core code
- Real-time updates use WebSocket for low-latency dashboard updates
- Database migrations are version-controlled in `backend/prisma/migrations/`
- Docker Compose orchestrates all services for seamless local development
