# Technology Stack & Build System

## Architecture Overview

```
Frontend (React/Next.js) 
    ↓ GraphQL/REST
Backend API (Node.js/Fastify/TypeScript)
    ↓ Adapters
Project Adapters (Node/Python/PHP/REST/DB)
    ↓ Events/Queue
Workers & Background Jobs (Node.js/Python)
    ↓ ORM
Central Database (PostgreSQL/Supabase)
```

## Technology Stack

### Frontend
- **Framework:** React / Next.js
- **Styling:** Tailwind CSS
- **Mobile:** Expo (optional)
- **State Management:** React hooks / Context API
- **HTTP Client:** Axios
- **Real-time:** WebSocket

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Fastify or Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL or Supabase
- **Queue:** BullMQ or RabbitMQ
- **Authentication:** JWT, OAuth2, SAML

### Project Adapters
- **Node.js Adapter:** TypeScript/JavaScript
- **Python Adapter:** Python 3.12+
- **PHP Adapter:** PHP 8+
- **REST Adapter:** Generic HTTP client
- **Database Adapter:** Direct DB connections

### Workers & Background Jobs
- **Node.js Workers:** TypeScript/JavaScript
- **Python Workers:** Python 3.12+
- **Scheduling:** CRON jobs or BullMQ
- **Tasks:** Data sync, analytics aggregation, payment reconciliation

### Integrations
- **Payments:** Stripe, PayPal, Square
- **Analytics:** Google Analytics, Matomo, Supabase logs
- **Deployments:** Docker, PM2, Vercel, Netlify

## Build & Development Commands

### Backend
```bash
npm install              # Install dependencies
npm run dev             # Start development server (port 4000)
npm run build           # Build for production
npm run start           # Start production server
npm run migrate         # Run database migrations (Prisma)
npm run seed            # Seed database with test data
npm run lint            # Run linter
npm run test            # Run tests
```

### Frontend
```bash
npm install              # Install dependencies
npm run dev             # Start development server (port 3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter
npm run test            # Run tests
```

### Docker
```bash
docker-compose up --build      # Build and start all services
docker-compose up              # Start services (no rebuild)
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
docker-compose ps              # List running services
```

## Database

### PostgreSQL
- **Version:** 16+
- **ORM:** Prisma
- **Connection:** Via environment variable `DATABASE_URL`
- **Migrations:** Prisma migrations in `backend/prisma/migrations/`

### Schema
- `UnifiedProject` - Normalized project data
- `Users` - User accounts and authentication
- `Teams` - Team management and permissions
- `Logs` - Event history and audit trail
- `Payments` - Payment and subscription records

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgres://user:pass@localhost:5432/saasdashboard
NODE_ENV=development
PORT=4000
JWT_SECRET=your-secret-key
STRIPE_API_KEY=sk_...
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_WS_URL=ws://localhost:4000
```

## Docker Services

- **postgres** - PostgreSQL database (port 5432)
- **backend** - Node.js API server (port 4000)
- **frontend** - React development server (port 3000)
- **node-project** - Example Node.js project (port 5000)
- **python-project** - Example Python project (port 6000)

## Key Dependencies

### Backend
- `fastify` or `express` - Web framework
- `prisma` - ORM
- `axios` - HTTP client
- `bullmq` - Job queue
- `ws` - WebSocket support
- `typescript` - Type safety

### Frontend
- `react` - UI library
- `next.js` - Framework (optional)
- `axios` - HTTP client
- `tailwindcss` - Styling
- `react-query` - Data fetching

## Testing

- **Unit Tests:** Jest or Vitest
- **Integration Tests:** Supertest (API testing)
- **E2E Tests:** Cypress or Playwright
- **Property-Based Testing:** Fast-check (for correctness properties)

## Code Quality

- **Linting:** ESLint
- **Formatting:** Prettier
- **Type Checking:** TypeScript strict mode
- **Pre-commit Hooks:** Husky + lint-staged

## Deployment

- **Containerization:** Docker
- **Orchestration:** Docker Compose (development), Kubernetes (production)
- **CI/CD:** GitHub Actions, GitLab CI, or similar
- **Hosting:** AWS, GCP, Azure, or self-hosted
