# Superstash - Unified Dashboard

Een centraal applicatiemanagement platform dat alle projecten, sites, apps, repositories, betalingen, analytics en deployments beheert over meerdere technologieën en platforms heen.

## Features

- **Unified Project View** - Alle projecten in een consistent formaat
- **Multi-Technology Adapters** - Ondersteuning voor Node.js, Python, PHP, REST APIs en databases
- **Real-time Updates** - WebSocket-gebaseerde instant updates
- **Plug-and-Play Wizard** - Voeg projecten toe zonder code te schrijven
- **Analytics Aggregation** - Gecentraliseerde metrics van meerdere bronnen
- **Payment Management** - Unified payment en subscription tracking
- **Team Management** - Multi-user support met role-based permissions

## Tech Stack

### Backend
- Node.js v20+ met TypeScript
- Fastify (web framework)
- Prisma ORM met PostgreSQL
- BullMQ (job queue met Redis)
- WebSocket voor real-time communicatie

### Frontend
- React met TypeScript
- Vite (build tool)
- Tailwind CSS
- Recharts (analytics visualisatie)

## Quick Start

### Vereisten
- Docker en Docker Compose
- Node.js v20+ (voor lokale development)

### Installatie

1. Clone de repository:
```bash
git clone <repository-url>
cd superstash
```

2. Start alle services met Docker Compose:
```bash
docker-compose up --build
```

3. De applicatie is nu beschikbaar op:
- Frontend Dashboard: http://localhost:3000
- Backend API: http://localhost:4000
- Example Node.js Project: http://localhost:5000
- Example Python Project: http://localhost:6000

### Lokale Development (zonder Docker)

1. Installeer dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. Start PostgreSQL en Redis lokaal (of gebruik Docker):
```bash
docker-compose up postgres redis
```

3. Setup database:
```bash
cd backend
npm run migrate
```

4. Start development servers:
```bash
# Backend (in backend directory)
npm run dev

# Frontend (in frontend directory)
npm run dev
```

## Project Structuur

```
superstash/
├── backend/          # Node.js API server
├── frontend/         # React dashboard
├── example-projects/ # Voorbeeld projecten voor testing
├── docs/            # Documentatie
└── docker-compose.yml
```

## Documentatie

- [Adapter Development Guide](docs/adapters.md) - Hoe custom adapters te maken
- [Integration Guide](docs/integration-guide.md) - Bestaande projecten integreren
- [API Documentation](docs/api.md) - Complete API referentie
- [Deployment Guide](docs/deployment.md) - Production deployment

## Development Workflow

1. Maak wijzigingen in `backend/src` of `frontend/src`
2. Services reloaden automatisch (hot reload)
3. Run tests: `npm test`
4. Database wijzigingen: Update `backend/prisma/schema.prisma` en run `npm run migrate`

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Coverage report
npm run test:coverage
```

## Environment Variables

Zie `.env.example` bestanden in backend en frontend directories voor alle beschikbare configuratie opties.

## License

MIT
