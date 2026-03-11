# Design Document: Superstash Unified Dashboard

## Overzicht

Superstash is een centrale applicatiemanager die heterogene projecten normaliseert naar een uniform UnifiedProject schema. Het systeem biedt real-time synchronisatie, event-driven architectuur, en een plug-and-play wizard voor naadloze integratie van Node.js, Python, PHP, REST APIs en databases.

### Kernfunctionaliteit

- **Unified Data Schema**: Alle projecten worden genormaliseerd naar een consistent UnifiedProject schema
- **Multi-Technology Adapters**: Ondersteuning voor Node.js, Python, PHP, REST APIs en directe database connecties
- **Real-time Updates**: WebSocket-gebaseerde bidirectionele communicatie voor instant updates
- **Event-Driven Architecture**: Webhook listeners en background workers voor asynchrone verwerking
- **Plug-and-Play Wizard**: Intelligente auto-detectie en AI-gestuurde field mapping
- **Enterprise Features**: JWT/OAuth2/SAML authenticatie, team management, audit logging

### Technologie Stack

- **Backend**: Node.js v20+, Fastify, TypeScript
- **Frontend**: React, Next.js, Tailwind CSS
- **Database**: PostgreSQL 16+ met Prisma ORM
- **Queue**: BullMQ met Redis
- **Real-time**: WebSocket (ws library)
- **Testing**: Jest, Supertest, Fast-check (property-based testing)


## Architectuur

### Systeemarchitectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │   Wizard     │  │  Analytics   │          │
│  │  (React)     │  │  (React)     │  │  (Charts)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
│                    ┌───────▼────────┐                            │
│                    │   WebSocket    │                            │
│                    │   Connection   │                            │
│                    └───────┬────────┘                            │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    Backend Layer (Unified API)                    │
│                    ┌───────▼────────┐                            │
│                    │  Fastify API   │                            │
│                    │   (Node.js)    │                            │
│                    └───┬────────┬───┘                            │
│                        │        │                                 │
│         ┌──────────────┘        └──────────────┐                 │
│         │                                       │                 │
│  ┌──────▼──────┐                        ┌──────▼──────┐          │
│  │   REST API  │                        │  WebSocket  │          │
│  │  Endpoints  │                        │   Server    │          │
│  └──────┬──────┘                        └──────┬──────┘          │
│         │                                       │                 │
│  ┌──────▼──────────────────────────────────────▼──────┐          │
│  │            Business Logic Layer                     │          │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │          │
│  │  │  Adapter    │  │  Webhook    │  │   Auth     │ │          │
│  │  │  Manager    │  │  Handler    │  │  Manager   │ │          │
│  │  └─────────────┘  └─────────────┘  └────────────┘ │          │
│  └──────────────────────────────────────────────────┘ │          │
│         │                                              │          │
│  ┌──────▼──────────────────────────────────────────┐  │          │
│  │              Adapter Layer                       │  │          │
│  │  ┌──────┐ ┌────────┐ ┌─────┐ ┌──────┐ ┌──────┐ │  │          │
│  │  │ Node │ │ Python │ │ PHP │ │ REST │ │  DB  │ │  │          │
│  │  └──────┘ └────────┘ └─────┘ └──────┘ └──────┘ │  │          │
│  └──────────────────────────────────────────────────┘  │          │
└────────────────────────────┬────────────────────────────┘          
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    Data & Queue Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   BullMQ     │          │
│  │  (Prisma)    │  │   (Cache)    │  │   (Queue)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    Worker Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Sync      │  │  Analytics   │  │   Payment    │          │
│  │   Worker     │  │   Worker     │  │   Worker     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    External Systems                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Project    │  │   Payment    │  │  Analytics   │          │
│  │   Systems    │  │  Providers   │  │  Providers   │          │
│  │ (Node/Py/PHP)│  │(Stripe/PayPal│  │(GA/Matomo)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Architectuurprincipes

1. **Separation of Concerns**: Duidelijke scheiding tussen transport, business logic en data layers
2. **Adapter Pattern**: Pluggable adapters voor verschillende technologieën zonder core wijzigingen
3. **Event-Driven**: Asynchrone verwerking via webhooks en background workers
4. **Real-time First**: WebSocket voor instant updates zonder polling
5. **Fail-Safe**: Circuit breakers, retry logic en graceful degradation
6. **Scalable**: Connection pooling, caching en parallel processing


## Componenten en Interfaces

### Backend Componenten

#### 1. Fastify API Server

**Verantwoordelijkheid**: HTTP/WebSocket server, routing, middleware

**Interface**:
```typescript
// backend/src/server.ts
import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';

interface ServerConfig {
  port: number;
  host: string;
  jwtSecret: string;
  databaseUrl: string;
}

class SuperstashServer {
  private fastify: FastifyInstance;
  
  constructor(config: ServerConfig);
  async start(): Promise<void>;
  async stop(): Promise<void>;
  registerRoutes(): void;
  registerWebSocket(): void;
  registerMiddleware(): void;
}
```

**Endpoints**:
- `GET /api/projects` - Lijst alle projecten
- `GET /api/projects/:id` - Haal specifiek project op
- `POST /api/projects` - Voeg nieuw project toe
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Verwijder project
- `GET /api/analytics` - Geaggregeerde analytics
- `GET /api/payments` - Payment data
- `POST /api/webhooks/:projectId` - Webhook endpoint
- `GET /api/teams` - Team management
- `POST /api/teams` - Maak team aan
- `GET /api/logs` - Audit logs
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /api/docs` - OpenAPI documentatie

#### 2. Adapter Manager

**Verantwoordelijkheid**: Beheer en routing van project adapters

**Interface**:
```typescript
// backend/src/adapters/adapterManager.ts
interface AdapterConfig {
  type: 'node' | 'python' | 'php' | 'rest' | 'db';
  url?: string;
  endpoints?: {
    status?: string;
    analytics?: string;
    payments?: string;
  };
  auth?: {
    type: 'apiKey' | 'bearer' | 'basic';
    credentials: string;
  };
  dbConfig?: {
    type: 'postgresql' | 'mysql' | 'mongodb';
    connectionString: string;
    query: string;
  };
  fieldMapping?: Record<string, string>;
}

interface UnifiedProject {
  id: string;
  name: string;
  type: 'web' | 'app' | 'service';
  status: 'live' | 'staging' | 'offline';
  repo?: string;
  analytics?: {
    users: number;
    pageviews: number;
    revenue?: number;
  };
  payments?: {
    lastPayment: string;
    total: number;
  };
  lastBuild?: string;
  tags?: string[];
}

interface IAdapter {
  fetchProjectData(config: AdapterConfig): Promise<UnifiedProject>;
  validateConfig(config: AdapterConfig): Promise<boolean>;
  testConnection(config: AdapterConfig): Promise<boolean>;
}

class AdapterManager {
  private adapters: Map<string, IAdapter>;
  
  registerAdapter(type: string, adapter: IAdapter): void;
  getAdapter(type: string): IAdapter | undefined;
  async fetchProject(config: AdapterConfig): Promise<UnifiedProject>;
  async validateProject(config: AdapterConfig): Promise<boolean>;
  async testProject(config: AdapterConfig): Promise<boolean>;
}
```

#### 3. Node.js Adapter

**Verantwoordelijkheid**: Integratie met Node.js/Express/Fastify projecten

**Interface**:
```typescript
// backend/src/adapters/nodeAdapter.ts
class NodeAdapter implements IAdapter {
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
    // Fetch from /status, /analytics, /payments endpoints
    // Transform to UnifiedProject schema
  }
  
  async validateConfig(config: AdapterConfig): Promise<boolean> {
    // Validate URL and endpoints
  }
  
  async testConnection(config: AdapterConfig): Promise<boolean> {
    // Test connectivity
  }
  
  private async fetchEndpoint(url: string, auth?: AuthConfig): Promise<any> {
    // HTTP client with timeout and retry
  }
}
```

#### 4. Python Adapter

**Verantwoordelijkheid**: Integratie met Python/Flask/FastAPI projecten

**Interface**:
```typescript
// backend/src/adapters/pythonAdapter.ts
class PythonAdapter implements IAdapter {
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
    // Fetch from Python project endpoints
    // Transform to UnifiedProject schema
  }
  
  async validateConfig(config: AdapterConfig): Promise<boolean>;
  async testConnection(config: AdapterConfig): Promise<boolean>;
  private async fetchEndpoint(url: string, auth?: AuthConfig): Promise<any>;
}
```

#### 5. PHP Adapter

**Verantwoordelijkheid**: Integratie met PHP projecten

**Interface**:
```typescript
// backend/src/adapters/phpAdapter.ts
class PHPAdapter implements IAdapter {
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject>;
  async validateConfig(config: AdapterConfig): Promise<boolean>;
  async testConnection(config: AdapterConfig): Promise<boolean>;
}
```

#### 6. REST Adapter

**Verantwoordelijkheid**: Generieke REST API integratie met custom field mapping

**Interface**:
```typescript
// backend/src/adapters/restAdapter.ts
class RESTAdapter implements IAdapter {
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
    // Fetch from custom endpoint
    // Apply field mapping
    // Transform to UnifiedProject schema
  }
  
  async validateConfig(config: AdapterConfig): Promise<boolean>;
  async testConnection(config: AdapterConfig): Promise<boolean>;
  
  private applyFieldMapping(
    data: any, 
    mapping: Record<string, string>
  ): Partial<UnifiedProject> {
    // Map custom fields to UnifiedProject fields
  }
}
```

#### 7. Database Adapter

**Verantwoordelijkheid**: Directe database connecties

**Interface**:
```typescript
// backend/src/adapters/dbAdapter.ts
class DBAdapter implements IAdapter {
  private pools: Map<string, any>; // Connection pools
  
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
    // Execute custom query
    // Transform results to UnifiedProject schema
  }
  
  async validateConfig(config: AdapterConfig): Promise<boolean>;
  async testConnection(config: AdapterConfig): Promise<boolean>;
  
  private async executeQuery(
    dbConfig: DBConfig, 
    query: string
  ): Promise<any[]> {
    // Execute query with connection pooling
  }
}
```

#### 8. WebSocket Manager

**Verantwoordelijkheid**: Real-time bidirectionele communicatie

**Interface**:
```typescript
// backend/src/websocket/websocketManager.ts
interface WebSocketMessage {
  type: 'project_update' | 'analytics_update' | 'payment_update' | 'deployment_update';
  data: any;
  timestamp: string;
}

class WebSocketManager {
  private connections: Map<string, WebSocket>;
  
  registerConnection(userId: string, ws: WebSocket): void;
  removeConnection(userId: string): void;
  broadcast(message: WebSocketMessage): void;
  sendToUser(userId: string, message: WebSocketMessage): void;
  sendToTeam(teamId: string, message: WebSocketMessage): void;
}
```

#### 9. Webhook Handler

**Verantwoordelijkheid**: Verwerking van inkomende webhooks

**Interface**:
```typescript
// backend/src/webhooks/webhookHandler.ts
interface WebhookEvent {
  projectId: string;
  type: 'status_change' | 'deployment' | 'payment' | 'analytics';
  data: any;
  signature: string;
  timestamp: string;
}

class WebhookHandler {
  async handleWebhook(event: WebhookEvent): Promise<void> {
    // Validate signature
    // Process event
    // Update database
    // Broadcast via WebSocket
  }
  
  private validateSignature(event: WebhookEvent, secret: string): boolean;
  private async processEvent(event: WebhookEvent): Promise<void>;
}
```

#### 10. Background Workers

**Verantwoordelijkheid**: Asynchrone taken via BullMQ

**Interface**:
```typescript
// backend/src/workers/syncWorker.ts
class SyncWorker {
  private queue: Queue;
  
  async start(): Promise<void> {
    // Start processing sync jobs
  }
  
  async processSyncJob(job: Job): Promise<void> {
    // Fetch project data via adapter
    // Update database
    // Broadcast update
  }
}

// backend/src/workers/analyticsWorker.ts
class AnalyticsWorker {
  async start(): Promise<void>;
  async processAnalyticsJob(job: Job): Promise<void> {
    // Aggregate analytics from all projects
    // Store in database
    // Broadcast update
  }
}

// backend/src/workers/paymentWorker.ts
class PaymentWorker {
  async start(): Promise<void>;
  async processPaymentJob(job: Job): Promise<void> {
    // Fetch from Stripe/PayPal/Square
    // Reconcile payments
    // Update database
    // Broadcast update
  }
}
```

#### 11. Authentication Manager

**Verantwoordelijkheid**: JWT/OAuth2/SAML authenticatie

**Interface**:
```typescript
// backend/src/auth/authManager.ts
interface User {
  id: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  teams: string[];
}

interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}

class AuthManager {
  async login(email: string, password: string): Promise<AuthToken>;
  async loginOAuth2(provider: string, code: string): Promise<AuthToken>;
  async loginSAML(assertion: string): Promise<AuthToken>;
  async validateToken(token: string): Promise<User | null>;
  async refreshToken(token: string): Promise<AuthToken>;
  async logout(token: string): Promise<void>;
}
```

### Frontend Componenten

#### 1. Dashboard Component

**Verantwoordelijkheid**: Hoofdweergave met projectenlijst

**Interface**:
```typescript
// frontend/src/components/Dashboard.tsx
interface DashboardProps {
  user: User;
}

interface DashboardState {
  projects: UnifiedProject[];
  filter: {
    type?: 'web' | 'app' | 'service';
    status?: 'live' | 'staging' | 'offline';
    search?: string;
  };
  sort: {
    field: 'name' | 'status' | 'lastUpdate';
    direction: 'asc' | 'desc';
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  // Render project list with filters and search
  // Handle WebSocket updates
  // Virtual scrolling for large lists
};
```

#### 2. Project Card Component

**Verantwoordelijkheid**: Individuele projectweergave

**Interface**:
```typescript
// frontend/src/components/ProjectCard.tsx
interface ProjectCardProps {
  project: UnifiedProject;
  onUpdate: (project: UnifiedProject) => void;
  onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, onDelete }) => {
  // Display project info
  // Status indicator
  // Quick actions
};
```

#### 3. Wizard Component

**Verantwoordelijkheid**: Plug-and-play project toevoegen

**Interface**:
```typescript
// frontend/src/components/Wizard.tsx
interface WizardState {
  step: 'url' | 'detection' | 'configuration' | 'test' | 'complete';
  url: string;
  detectedType?: 'node' | 'python' | 'php' | 'rest';
  confidence?: number;
  config: AdapterConfig;
  testResult?: {
    success: boolean;
    preview?: UnifiedProject;
    error?: string;
  };
}

const Wizard: React.FC = () => {
  // Multi-step wizard
  // Auto-detection
  // AI-suggested mapping
  // Real-time validation
  // Test connection
};
```

#### 4. Analytics Chart Component

**Verantwoordelijkheid**: Visualisatie van analytics data

**Interface**:
```typescript
// frontend/src/components/AnalyticsChart.tsx
interface AnalyticsChartProps {
  data: TimeSeriesData[];
  metric: 'users' | 'pageviews' | 'revenue';
  timeRange: '24h' | '7d' | '30d' | '90d';
  projects?: string[]; // Filter by projects
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, metric, timeRange, projects }) => {
  // Line chart with Chart.js or Recharts
  // Time range selector
  // Project filter
};
```

#### 5. WebSocket Hook

**Verantwoordelijkheid**: WebSocket connectie management

**Interface**:
```typescript
// frontend/src/hooks/useWebSocket.ts
interface UseWebSocketOptions {
  url: string;
  token: string;
  onMessage: (message: WebSocketMessage) => void;
  onError: (error: Error) => void;
}

const useWebSocket = (options: UseWebSocketOptions) => {
  // Establish connection
  // Handle reconnection with exponential backoff
  // Parse and dispatch messages
  // Return connection status
  
  return {
    isConnected: boolean;
    send: (message: any) => void;
    disconnect: () => void;
  };
};
```


## Data Models

### Database Schema (Prisma)

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id          String   @id @default(uuid())
  name        String
  type        ProjectType
  status      ProjectStatus
  repo        String?
  lastBuild   DateTime?
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  analytics   Analytics[]
  payments    Payment[]
  config      ProjectConfig?
  team        Team?      @relation(fields: [teamId], references: [id])
  teamId      String?
  logs        AuditLog[]
  
  @@index([status])
  @@index([type])
  @@index([teamId])
}

enum ProjectType {
  web
  app
  service
}

enum ProjectStatus {
  live
  staging
  offline
}

model ProjectConfig {
  id            String   @id @default(uuid())
  projectId     String   @unique
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  adapterType   AdapterType
  url           String?
  endpoints     Json?    // { status: string, analytics: string, payments: string }
  auth          Json?    // { type: string, credentials: string }
  dbConfig      Json?    // { type: string, connectionString: string, query: string }
  fieldMapping  Json?    // Record<string, string>
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum AdapterType {
  node
  python
  php
  rest
  db
}

model Analytics {
  id          String   @id @default(uuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  users       Int      @default(0)
  pageviews   Int      @default(0)
  revenue     Float?
  timestamp   DateTime @default(now())
  
  @@index([projectId, timestamp])
}

model Payment {
  id            String   @id @default(uuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  amount        Float
  currency      String   @default("EUR")
  provider      PaymentProvider
  transactionId String   @unique
  status        PaymentStatus
  timestamp     DateTime @default(now())
  
  @@index([projectId, timestamp])
  @@index([transactionId])
}

enum PaymentProvider {
  stripe
  paypal
  square
}

enum PaymentStatus {
  pending
  completed
  failed
  refunded
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String?
  role          UserRole @default(viewer)
  
  // OAuth/SAML
  oauthProvider String?
  oauthId       String?
  samlId        String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  teams         TeamMember[]
  logs          AuditLog[]
  
  @@index([email])
}

enum UserRole {
  admin
  developer
  viewer
}

model Team {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  members     TeamMember[]
  projects    Project[]
}

model TeamMember {
  id        String   @id @default(uuid())
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      TeamRole @default(member)
  joinedAt  DateTime @default(now())
  
  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
}

enum TeamRole {
  owner
  admin
  member
}

model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  
  action      String   // e.g., "project.create", "project.update", "user.login"
  method      String?  // HTTP method
  endpoint    String?  // API endpoint
  statusCode  Int?
  changes     Json?    // Before/after for updates
  ipAddress   String?
  userAgent   String?
  
  timestamp   DateTime @default(now())
  
  @@index([userId, timestamp])
  @@index([projectId, timestamp])
  @@index([action, timestamp])
}

model AggregatedAnalytics {
  id          String   @id @default(uuid())
  totalUsers  Int      @default(0)
  totalPageviews Int   @default(0)
  totalRevenue Float   @default(0)
  timestamp   DateTime @default(now())
  
  @@index([timestamp])
}

model JobStatus {
  id          String   @id @default(uuid())
  jobId       String   @unique
  type        JobType
  status      JobStatusEnum
  attempts    Int      @default(0)
  error       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?
  
  @@index([status])
  @@index([type])
}

enum JobType {
  sync
  analytics
  payment
  webhook
}

enum JobStatusEnum {
  pending
  processing
  completed
  failed
  dead
}
```

### TypeScript Types

```typescript
// backend/src/types/index.ts

export interface UnifiedProject {
  id: string;
  name: string;
  type: 'web' | 'app' | 'service';
  status: 'live' | 'staging' | 'offline';
  repo?: string;
  analytics?: {
    users: number;
    pageviews: number;
    revenue?: number;
  };
  payments?: {
    lastPayment: string;
    total: number;
  };
  lastBuild?: string;
  tags?: string[];
}

export interface AdapterConfig {
  type: 'node' | 'python' | 'php' | 'rest' | 'db';
  url?: string;
  endpoints?: {
    status?: string;
    analytics?: string;
    payments?: string;
  };
  auth?: {
    type: 'apiKey' | 'bearer' | 'basic';
    credentials: string;
  };
  dbConfig?: {
    type: 'postgresql' | 'mysql' | 'mongodb';
    connectionString: string;
    query: string;
  };
  fieldMapping?: Record<string, string>;
}

export interface WebSocketMessage {
  type: 'project_update' | 'analytics_update' | 'payment_update' | 'deployment_update';
  data: any;
  timestamp: string;
}

export interface WebhookEvent {
  projectId: string;
  type: 'status_change' | 'deployment' | 'payment' | 'analytics';
  data: any;
  signature: string;
  timestamp: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  teams: string[];
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  projectId?: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: boolean;
    redis: boolean;
    queue: boolean;
  };
  timestamp: string;
}
```

### API Request/Response Schemas

```typescript
// GET /api/projects
interface GetProjectsResponse {
  projects: UnifiedProject[];
  total: number;
  page: number;
  pageSize: number;
}

// POST /api/projects
interface CreateProjectRequest {
  name: string;
  type: 'web' | 'app' | 'service';
  config: AdapterConfig;
  tags?: string[];
  teamId?: string;
}

interface CreateProjectResponse {
  project: UnifiedProject;
  message: string;
}

// PUT /api/projects/:id
interface UpdateProjectRequest {
  name?: string;
  type?: 'web' | 'app' | 'service';
  config?: AdapterConfig;
  tags?: string[];
  status?: 'live' | 'staging' | 'offline';
}

// POST /api/webhooks/:projectId
interface WebhookRequest {
  type: 'status_change' | 'deployment' | 'payment' | 'analytics';
  data: any;
  signature: string;
}

// GET /api/analytics
interface GetAnalyticsRequest {
  projectIds?: string[];
  startDate?: string;
  endDate?: string;
  metric?: 'users' | 'pageviews' | 'revenue';
}

interface GetAnalyticsResponse {
  data: TimeSeriesData[];
  aggregated: {
    totalUsers: number;
    totalPageviews: number;
    totalRevenue: number;
  };
}

// POST /api/teams
interface CreateTeamRequest {
  name: string;
  description?: string;
  memberIds: string[];
}

// GET /api/logs
interface GetLogsRequest {
  userId?: string;
  projectId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

interface GetLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}
```


## Correctness Properties

*Een property is een karakteristiek of gedrag dat waar moet zijn voor alle geldige uitvoeringen van een systeem - in essentie een formele verklaring over wat het systeem moet doen. Properties dienen als de brug tussen menselijk leesbare specificaties en machine-verifieerbare correctheidsgaranties.*

### Property Reflection

Na analyse van alle acceptance criteria heb ik redundantie geïdentificeerd en properties geconsolideerd:

**Geconsolideerde Adapter Properties**: Requirements 2.1-2.7, 3.1-3.7, en 4.1-4.4 beschrijven identiek gedrag voor Node, Python en PHP adapters. Deze zijn gecombineerd tot generieke adapter properties die voor alle adapter types gelden.

**Geconsolideerde Endpoint Properties**: Requirements 7.1-7.7 testen individuele endpoint existence. Deze zijn gecombineerd tot één property over API endpoint conformiteit.

**Geconsolideerde Broadcast Properties**: Requirements 9.3-9.5, 10.4, 11.4, 12.6, en 13.5 beschrijven allemaal WebSocket broadcasts bij data wijzigingen. Deze zijn gecombineerd tot één comprehensive broadcast property.

**Geconsolideerde Error Handling Properties**: Requirements 2.7, 3.7, 4.4, 5.5, en 6.5 beschrijven identieke error handling voor adapters. Deze zijn gecombineerd tot één adapter error handling property.

**Geconsolideerde Provider Integration Properties**: Requirements 35.1-35.6 en 36.1-36.6 beschrijven vergelijkbare integratie patronen. Deze zijn gecombineerd tot provider integration properties.

### Property 1: UnifiedProject Schema Normalisatie

*Voor alle* project data van elk adapter type (Node, Python, PHP, REST, DB), moet de genormaliseerde output een geldig UnifiedProject object zijn met alle verplichte velden: id, name, type, status.

**Validates: Requirements 1.1, 1.4, 2.3, 3.3, 4.3**

### Property 2: Type Enum Constraint

*Voor alle* UnifiedProject objecten, moet het type veld één van de waarden zijn: 'web', 'app', 'service'.

**Validates: Requirements 1.2**

### Property 3: Status Enum Constraint

*Voor alle* UnifiedProject objecten, moet het status veld één van de waarden zijn: 'live', 'staging', 'offline'.

**Validates: Requirements 1.3**

### Property 4: Schema Validation Error Reporting

*Voor alle* ongeldige project data die schema validatie faalt, moet de error response een descriptieve foutmelding bevatten met details over de validatie failure.

**Validates: Requirements 1.5**

### Property 5: Adapter Connectivity

*Voor alle* adapters (Node, Python, PHP, REST, DB) en geldige configuraties, moet de adapter kunnen connecteren met het target systeem via de geconfigureerde protocol (HTTP/HTTPS/Database).

**Validates: Requirements 2.1, 3.1, 4.1, 5.1, 6.1**

### Property 6: Adapter Data Extraction

*Voor alle* adapters en project responses, moet de adapter alle beschikbare velden extracten (name, status, analytics, payments) uit de response data.

**Validates: Requirements 2.2, 3.2, 4.2**

### Property 7: Adapter Endpoint Fetching

*Voor alle* adapters met geconfigureerde endpoints (status, analytics, payments), moet de adapter data kunnen ophalen van elk geconfigureerd endpoint.

**Validates: Requirements 2.4, 2.5, 2.6, 3.4, 3.5, 3.6**

### Property 8: Adapter Error Handling

*Voor alle* adapters waarbij een connectie faalt, moet de adapter de error loggen en status 'offline' returnen zonder te crashen.

**Validates: Requirements 2.7, 3.7, 4.4, 5.5, 6.5**

### Property 9: REST Adapter Field Mapping

*Voor alle* JSON responses en custom field mapping configuraties, moet de REST adapter de geconfigureerde velden correct mappen naar UnifiedProject schema velden.

**Validates: Requirements 5.2, 5.3**

### Property 10: REST Adapter Authentication

*Voor alle* authentication types (apiKey, bearer, basic), moet de REST adapter de credentials correct toevoegen aan HTTP requests.

**Validates: Requirements 5.4**

### Property 11: Database Adapter Query Execution

*Voor alle* database types (PostgreSQL, MySQL, MongoDB) en geldige queries, moet de DB adapter de query kunnen uitvoeren en resultaten mappen naar UnifiedProject schema.

**Validates: Requirements 6.2, 6.3**

### Property 12: API Invalid Request Handling

*Voor alle* ongeldige API requests (missing parameters, invalid format, etc.), moet de Unified_API HTTP 400 returnen met error details.

**Validates: Requirements 7.8**

### Property 13: API Resource Not Found Handling

*Voor alle* niet-bestaande resource IDs, moet de Unified_API HTTP 404 returnen.

**Validates: Requirements 7.9**

### Property 14: API Success Response Format

*Voor alle* geldige API requests, moet de Unified_API HTTP 200 returnen met een JSON response body.

**Validates: Requirements 7.10**

### Property 15: Database CRUD Round-Trip

*Voor alle* UnifiedProject objecten, moet create-then-read hetzelfde object returnen, update-then-read moet wijzigingen reflecteren, en delete-then-read moet not found returnen.

**Validates: Requirements 8.6, 8.7, 8.8**

### Property 16: Database Referential Integrity

*Voor alle* database operaties met ongeldige foreign keys, moet de database de operatie rejecten met een constraint violation error.

**Validates: Requirements 8.9**

### Property 17: WebSocket Authentication

*Voor alle* WebSocket connectie pogingen, moet de server de JWT token valideren voordat de connectie wordt geaccepteerd.

**Validates: Requirements 9.2**

### Property 18: WebSocket Broadcast on Data Change

*Voor alle* data wijzigingen (project updates, analytics updates, payment updates, deployment updates), moet de server een WebSocket broadcast sturen naar alle geconnecteerde clients.

**Validates: Requirements 9.3, 9.4, 9.5, 10.4, 11.4, 12.6, 13.5**

### Property 19: WebSocket UI Update Without Reload

*Voor alle* WebSocket messages ontvangen door de Dashboard, moet de UI state updaten zonder page refresh.

**Validates: Requirements 9.7**

### Property 20: WebSocket Reconnection with Backoff

*Voor alle* WebSocket connection drops, moet de Dashboard reconnection proberen met exponential backoff (1s, 2s, 4s, 8s, ...).

**Validates: Requirements 9.8**

### Property 21: Webhook Signature Validation

*Voor alle* inkomende webhook events, moet de server de signature valideren tegen de project's webhook secret.

**Validates: Requirements 10.2**

### Property 22: Webhook Event Processing

*Voor alle* geldige webhook events, moet de server de project data updaten in de database en een WebSocket broadcast triggeren.

**Validates: Requirements 10.3, 10.4**

### Property 23: Webhook Event Type Support

*Voor alle* webhook event types (status_change, deployment, payment, analytics), moet de server het event kunnen verwerken en de juiste data velden updaten.

**Validates: Requirements 10.5**

### Property 24: Webhook Invalid Signature Rejection

*Voor alle* webhook events met ongeldige signatures, moet de server HTTP 401 returnen en de poging loggen.

**Validates: Requirements 10.6**

### Property 25: Background Worker Adapter Selection

*Voor alle* project types in de sync queue, moet de Background Worker de correcte adapter selecteren op basis van het project's adapter type.

**Validates: Requirements 11.2**

### Property 26: Background Worker Data Change Detection

*Voor alle* sync operations waarbij data is gewijzigd, moet de Background Worker de database updaten en een WebSocket broadcast triggeren.

**Validates: Requirements 11.3, 11.4**

### Property 27: Background Worker Operation Logging

*Voor alle* sync operations (success of failure), moet de Background Worker een log entry creëren met timestamp en status.

**Validates: Requirements 11.5**

### Property 28: Background Worker Retry Logic

*Voor alle* gefaalde sync operations, moet de Background Worker retries uitvoeren met exponential backoff tot maximaal 3 pogingen.

**Validates: Requirements 11.6**

### Property 29: Analytics Aggregation Calculation

*Voor alle* sets van projecten met analytics data, moet de aggregation worker de totalen correct berekenen: sum(users), sum(pageviews), sum(revenue).

**Validates: Requirements 12.2, 12.3, 12.4**

### Property 30: Analytics Aggregation Persistence

*Voor alle* aggregation results, moet de worker de resultaten persisteren in de database en een WebSocket broadcast triggeren.

**Validates: Requirements 12.5, 12.6**

### Property 31: Payment Provider Data Fetching

*Voor alle* payment providers (Stripe, PayPal, Square), moet de Payment Worker data kunnen ophalen via de provider's API met correcte authenticatie.

**Validates: Requirements 13.2, 35.1, 35.2, 35.3**

### Property 32: Payment Reconciliation Matching

*Voor alle* payments van providers, moet de worker de payment kunnen matchen aan het correcte project op basis van metadata of transaction ID.

**Validates: Requirements 13.3**

### Property 33: Payment Total Calculation

*Voor alle* projecten met payments, moet de worker de totalen correct berekenen en persisteren in de database.

**Validates: Requirements 13.4**

### Property 34: Payment Worker Error Isolation

*Voor alle* payment provider API failures, moet de worker de error loggen en doorgaan met de overige providers zonder te stoppen.

**Validates: Requirements 13.6**

### Property 35: Queue Job Type Support

*Voor alle* job types (sync, analytics, payment, webhook), moet het Queue System de jobs kunnen accepteren, persisteren en verwerken.

**Validates: Requirements 14.2**

### Property 36: Queue Job Persistence

*Voor alle* toegevoegde jobs, moet het Queue System de job persisteren naar Redis voordat bevestiging wordt gegeven.

**Validates: Requirements 14.3**

### Property 37: Queue Job Assignment

*Voor alle* beschikbare workers, moet het Queue System de volgende job uit de queue assignen volgens FIFO principe.

**Validates: Requirements 14.4**

### Property 38: Queue Job Retry Logic

*Voor alle* gefaalde jobs, moet het Queue System retries uitvoeren met exponential backoff tot maximaal 3 pogingen.

**Validates: Requirements 14.5**

### Property 39: Queue Dead Letter Queue

*Voor alle* jobs die falen na alle retries, moet het Queue System de job verplaatsen naar een dead letter queue.

**Validates: Requirements 14.7**

### Property 40: Wizard Multi-URL Parsing

*Voor alle* input strings met meerdere URLs (comma of newline separated), moet de Wizard elke URL correct parsen en extracten.

**Validates: Requirements 15.1**

### Property 41: Wizard Parallel Processing

*Voor alle* sets van URLs, moet de Wizard elke URL parallel verwerken zonder te wachten op completion van andere URLs.

**Validates: Requirements 15.2**

### Property 42: Wizard Bulk Import Summary

*Voor alle* bulk import operations, moet de Wizard een summary genereren met correcte success en failure counts.

**Validates: Requirements 15.4**

### Property 43: Wizard Error Isolation

*Voor alle* URLs in een bulk import waarbij één URL faalt, moeten de andere URLs onafhankelijk blijven verwerken.

**Validates: Requirements 15.5**

### Property 44: Wizard Technology Detection

*Voor alle* project URLs met technology indicators (package.json, requirements.txt, composer.json, headers), moet de Wizard het correcte project type detecteren.

**Validates: Requirements 16.1, 16.2, 16.3, 16.4**

### Property 45: Wizard Adapter Pre-selection

*Voor alle* successful technology detections, moet de Wizard de corresponderende adapter pre-selecteren.

**Validates: Requirements 16.5**

### Property 46: Wizard Detection Fallback

*Voor alle* URLs waarbij detection faalt, moet de Wizard defaulten naar REST_Adapter.

**Validates: Requirements 16.7**

### Property 47: Wizard Endpoint Pre-fill

*Voor alle* gedetecteerde project types, moet de Wizard standaard endpoints pre-fillen (/status, /analytics, /payments).

**Validates: Requirements 17.1, 17.2, 17.3**

### Property 48: Wizard Endpoint Validation

*Voor alle* geconfigureerde endpoints, moet de Wizard valideren dat de endpoints geldige responses returnen voordat saving wordt toegestaan.

**Validates: Requirements 17.5**

### Property 49: Wizard Field Mapping Suggestions

*Voor alle* JSON responses van project endpoints, moet de Wizard field mapping suggesties genereren naar UnifiedProject velden met confidence scores.

**Validates: Requirements 18.1, 18.2, 18.3**

### Property 50: Wizard Mapping Configuration Persistence

*Voor alle* geaccepteerde field mappings, moet de Wizard de configuratie correct opslaan voor de REST_Adapter.

**Validates: Requirements 18.5**

### Property 51: Wizard Test Connection Success

*Voor alle* successful test connections, moet de Wizard de fetched UnifiedProject data als preview tonen.

**Validates: Requirements 19.3**

### Property 52: Wizard Test Connection Failure

*Voor alle* gefaalde test connections, moet de Wizard de error message tonen met troubleshooting suggesties.

**Validates: Requirements 19.4**

### Property 53: Wizard Save Prevention

*Voor alle* wizard configurations, moet saving worden geblokkeerd totdat minimaal één successful test is uitgevoerd.

**Validates: Requirements 19.5**

### Property 54: Wizard Real-time Validation

*Voor alle* user inputs (URLs, endpoints, API keys), moet de Wizard real-time validatie uitvoeren en feedback tonen.

**Validates: Requirements 20.1, 20.2, 20.3**

### Property 55: Dashboard Project Display

*Voor alle* projecten, moet de Dashboard de verplichte velden tonen: name, type, status, last update time.

**Validates: Requirements 21.2**

### Property 56: Dashboard Filtering

*Voor alle* filter criteria (type, status, search query), moet de Dashboard alleen projecten tonen die aan de criteria voldoen.

**Validates: Requirements 21.3, 21.4, 21.5**

### Property 57: Dashboard Sorting

*Voor alle* sort criteria (name, status, lastUpdate) en directions (asc, desc), moet de Dashboard projecten in de correcte volgorde tonen.

**Validates: Requirements 21.6**

### Property 58: Dashboard Real-time Project Updates

*Voor alle* project updates via WebSocket, moet de Dashboard de project card updaten zonder page refresh.

**Validates: Requirements 21.7**

### Property 59: Dashboard Project Detail Display

*Voor alle* projecten, moet de detail view alle beschikbare informatie tonen: name, type, status, repo, tags, analytics, payments, lastBuild.

**Validates: Requirements 22.2, 22.3, 22.4, 22.5**

### Property 60: Dashboard Detail Real-time Updates

*Voor alle* project data updates via WebSocket, moet de detail view real-time updaten zonder page refresh.

**Validates: Requirements 22.7**

### Property 61: Dashboard Analytics Chart Rendering

*Voor alle* analytics data en metrics (users, pageviews, revenue), moet de Dashboard een chart renderen met de data over de geselecteerde time range.

**Validates: Requirements 23.1, 23.2, 23.3**

### Property 62: Dashboard Analytics Time Range Filtering

*Voor alle* time range selecties (24h, 7d, 30d, 90d), moet de Dashboard alleen data binnen die range tonen.

**Validates: Requirements 23.4**

### Property 63: Dashboard Analytics Aggregation

*Voor alle* sets van projecten, moet de Dashboard correcte aggregated totals berekenen en tonen.

**Validates: Requirements 23.5**

### Property 64: Dashboard Analytics Project Filtering

*Voor alle* project filter selecties, moet de Dashboard alleen analytics data van geselecteerde projecten tonen.

**Validates: Requirements 23.6**

### Property 65: Authentication Token Issuance

*Voor alle* successful login attempts (JWT, OAuth2, SAML), moet de Unified_API een JWT token issuen met expiration time.

**Validates: Requirements 24.1, 24.2, 24.3, 24.4**

### Property 66: Authentication Token Validation

*Voor alle* API requests met een JWT token, moet de Unified_API de token valideren voordat de request wordt verwerkt.

**Validates: Requirements 24.5**

### Property 67: Authentication Invalid Token Rejection

*Voor alle* API requests met ongeldige of expired tokens, moet de Unified_API HTTP 401 returnen.

**Validates: Requirements 24.6**

### Property 68: Role-Based Access Control

*Voor alle* users met een role (admin, developer, viewer), moet de Unified_API access control enforced op basis van de role permissions.

**Validates: Requirements 24.7**

### Property 69: Team Project Assignment

*Voor alle* projecten assigned aan een team, moeten team members access hebben tot het project.

**Validates: Requirements 25.5**

### Property 70: Team Member Access Grant

*Voor alle* users die team member zijn, moet de Unified_API access verlenen tot alle team projecten.

**Validates: Requirements 25.6**

### Property 71: Team Non-Member Access Denial

*Voor alle* users die geen team member zijn, moet de Unified_API access weigeren tot team projecten.

**Validates: Requirements 25.7**

### Property 72: Audit Log Creation

*Voor alle* API requests, project modifications, en authentication events, moet de Unified_API een audit log entry creëren met timestamp, user, action, en details.

**Validates: Requirements 26.1, 26.2, 26.3**

### Property 73: Audit Log Filtering

*Voor alle* filter criteria (date range, user, action type, project), moet de API alleen logs returnen die aan de criteria voldoen.

**Validates: Requirements 26.5**

### Property 74: Environment Variable Loading

*Voor alle* geconfigureerde environment variables, moet het systeem de waarden correct laden en beschikbaar maken.

**Validates: Requirements 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7**

### Property 75: Environment Variable Validation

*Voor alle* missing required environment variables, moet het systeem een error loggen en exit met non-zero code.

**Validates: Requirements 28.8**

### Property 76: Adapter Connection Failure Resilience

*Voor alle* adapter connection failures, moet de Unified_API het project markeren als 'offline' en doorgaan met andere projecten.

**Validates: Requirements 30.1**

### Property 77: Worker Error Isolation

*Voor alle* Background Worker errors, moet de worker de error loggen en doorgaan met remaining tasks zonder te stoppen.

**Validates: Requirements 30.2**

### Property 78: Database Connection Failure Handling

*Voor alle* database connection failures, moet de Unified_API HTTP 503 returnen en de error loggen.

**Validates: Requirements 30.3**

### Property 79: Circuit Breaker Pattern

*Voor alle* external API calls, moet de Unified_API een circuit breaker implementeren die opent na herhaalde failures.

**Validates: Requirements 30.5**

### Property 80: Circuit Breaker Fallback

*Voor alle* open circuit breakers, moet de Unified_API cached data returnen indien beschikbaar.

**Validates: Requirements 30.6**

### Property 81: Request Timeout Enforcement

*Voor alle* external API calls, moet de Unified_API een timeout van 30 seconden enforced.

**Validates: Requirements 30.7**

### Property 82: Timeout Error Handling

*Voor alle* timed-out requests, moet de Unified_API de timeout loggen en een error response returnen.

**Validates: Requirements 30.8**

### Property 83: Deployment Event Processing

*Voor alle* deployment events (Docker, PM2, Vercel, Netlify), moet de Unified_API de project lastBuild timestamp updaten en status reflecteren.

**Validates: Requirements 34.1, 34.2, 34.3, 34.4, 34.5, 34.6**

### Property 84: Analytics Provider Integration

*Voor alle* analytics providers (Google Analytics, Matomo, Supabase), moet de Unified_API data kunnen ophalen en mappen naar UnifiedProject analytics field.

**Validates: Requirements 36.1, 36.2, 36.3, 36.4, 36.5**

### Property 85: Analytics Multi-Provider Aggregation

*Voor alle* projecten met meerdere analytics providers, moet de Unified_API data van alle providers aggregeren.

**Validates: Requirements 36.6**

### Property 86: Configuration Validation on Startup

*Voor alle* system configurations, moet de Unified_API validatie uitvoeren bij startup en descriptive errors returnen bij failures.

**Validates: Requirements 37.1, 37.2, 37.3, 37.4, 37.5, 37.6**

### Property 87: Health Check Status Reporting

*Voor alle* health check requests, moet de Unified_API de status van database, Redis, en queue checken en een comprehensive health report returnen.

**Validates: Requirements 38.1, 38.2, 38.3, 38.4, 38.5, 38.6, 38.7**

### Property 88: Rate Limiting Enforcement

*Voor alle* API requests, moet de Unified_API rate limits enforced (100 req/min per IP, 1000 req/hour per user) en HTTP 429 returnen bij overschrijding.

**Validates: Requirements 39.1, 39.2, 39.3, 39.4, 39.5**

### Property 89: Data Export CSV Generation

*Voor alle* export requests (projects, analytics), moet de Dashboard een correct geformatteerde CSV file genereren met alle relevante data velden.

**Validates: Requirements 40.1, 40.2, 40.3, 40.4, 40.5, 40.6**


## Error Handling

### Error Handling Strategie

Het systeem implementeert een comprehensive error handling strategie met focus op resilience, graceful degradation, en observability.

### Error Categories

#### 1. Validation Errors (HTTP 400)

**Oorzaken**:
- Ongeldige request parameters
- Schema validation failures
- Malformed JSON
- Missing required fields

**Handling**:
```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public value?: any
  ) {
    super(`Validation failed for ${field}: ${message}`);
  }
}

// In API handler
try {
  const validated = validateUnifiedProject(data);
} catch (error) {
  if (error instanceof ValidationError) {
    return reply.code(400).send({
      error: 'Validation Error',
      field: error.field,
      message: error.message,
      value: error.value
    });
  }
}
```

#### 2. Authentication Errors (HTTP 401)

**Oorzaken**:
- Invalid JWT token
- Expired token
- Missing authentication header
- Invalid webhook signature

**Handling**:
```typescript
class AuthenticationError extends Error {
  constructor(public reason: string) {
    super(`Authentication failed: ${reason}`);
  }
}

// JWT validation middleware
async function validateJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new AuthenticationError('Missing token');
    }
    const user = await verifyToken(token);
    request.user = user;
  } catch (error) {
    reply.code(401).send({
      error: 'Authentication Error',
      message: error.message
    });
  }
}
```

#### 3. Authorization Errors (HTTP 403)

**Oorzaken**:
- Insufficient permissions
- Team access denied
- Role-based access control violation

**Handling**:
```typescript
class AuthorizationError extends Error {
  constructor(
    public resource: string,
    public action: string,
    public userRole: string
  ) {
    super(`User with role ${userRole} cannot ${action} ${resource}`);
  }
}

// Authorization middleware
async function checkPermission(
  user: User,
  resource: string,
  action: string
) {
  if (!hasPermission(user.role, resource, action)) {
    throw new AuthorizationError(resource, action, user.role);
  }
}
```

#### 4. Not Found Errors (HTTP 404)

**Oorzaken**:
- Non-existent project ID
- Non-existent user ID
- Non-existent team ID

**Handling**:
```typescript
class NotFoundError extends Error {
  constructor(
    public resourceType: string,
    public resourceId: string
  ) {
    super(`${resourceType} with ID ${resourceId} not found`);
  }
}

// In API handler
const project = await prisma.project.findUnique({ where: { id } });
if (!project) {
  throw new NotFoundError('Project', id);
}
```

#### 5. Rate Limit Errors (HTTP 429)

**Oorzaken**:
- Too many requests per minute
- Too many requests per hour
- Exceeded quota

**Handling**:
```typescript
// Rate limiting middleware
await fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (request, context) => {
    return {
      error: 'Rate Limit Exceeded',
      message: `Too many requests. Retry after ${context.after}`,
      retryAfter: context.after
    };
  }
});
```

#### 6. Service Unavailable Errors (HTTP 503)

**Oorzaken**:
- Database connection failure
- Redis connection failure
- External service unavailable

**Handling**:
```typescript
class ServiceUnavailableError extends Error {
  constructor(
    public service: string,
    public reason: string
  ) {
    super(`Service ${service} unavailable: ${reason}`);
  }
}

// Database connection check
try {
  await prisma.$queryRaw`SELECT 1`;
} catch (error) {
  throw new ServiceUnavailableError('Database', error.message);
}
```

### Adapter Error Handling

#### Connection Failures

```typescript
class AdapterConnectionError extends Error {
  constructor(
    public adapterType: string,
    public url: string,
    public originalError: Error
  ) {
    super(`${adapterType} adapter failed to connect to ${url}`);
  }
}

// In adapter
async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
  try {
    const response = await axios.get(config.url, {
      timeout: 30000,
      headers: this.buildAuthHeaders(config.auth)
    });
    return this.transform(response.data);
  } catch (error) {
    logger.error('Adapter connection failed', {
      adapter: config.type,
      url: config.url,
      error: error.message
    });
    
    // Return offline status instead of throwing
    return {
      id: config.projectId,
      name: 'Unknown',
      type: 'service',
      status: 'offline'
    };
  }
}
```

#### Timeout Handling

```typescript
// Axios timeout configuration
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
  timeoutErrorMessage: 'Request timed out after 30 seconds'
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      logger.warn('Request timeout', {
        url: error.config.url,
        timeout: error.config.timeout
      });
    }
    throw error;
  }
);
```

### Circuit Breaker Pattern

```typescript
import CircuitBreaker from 'opossum';

class ExternalAPIClient {
  private breaker: CircuitBreaker;
  
  constructor() {
    this.breaker = new CircuitBreaker(this.makeRequest, {
      timeout: 30000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10
    });
    
    this.breaker.fallback(() => this.getCachedData());
    
    this.breaker.on('open', () => {
      logger.warn('Circuit breaker opened');
    });
    
    this.breaker.on('halfOpen', () => {
      logger.info('Circuit breaker half-open, testing...');
    });
    
    this.breaker.on('close', () => {
      logger.info('Circuit breaker closed');
    });
  }
  
  async fetch(url: string): Promise<any> {
    return this.breaker.fire(url);
  }
  
  private async makeRequest(url: string): Promise<any> {
    const response = await axios.get(url);
    await this.cacheData(url, response.data);
    return response.data;
  }
  
  private async getCachedData(): Promise<any> {
    // Return cached data if available
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info('Returning cached data due to circuit breaker');
      return JSON.parse(cached);
    }
    throw new Error('No cached data available');
  }
}
```

### Retry Logic with Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`Retry attempt ${attempt + 1} after ${delay}ms`, {
          error: error.message
        });
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

// Usage in Background Worker
async processSyncJob(job: Job): Promise<void> {
  await retryWithBackoff(async () => {
    const project = await prisma.project.findUnique({
      where: { id: job.data.projectId },
      include: { config: true }
    });
    
    const adapter = this.adapterManager.getAdapter(project.config.adapterType);
    const data = await adapter.fetchProjectData(project.config);
    
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: data.status,
        lastBuild: data.lastBuild,
        updatedAt: new Date()
      }
    });
    
    this.websocketManager.broadcast({
      type: 'project_update',
      data: data,
      timestamp: new Date().toISOString()
    });
  }, 3, 1000);
}
```

### Error Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Structured logging
logger.error('Adapter connection failed', {
  adapter: 'node',
  projectId: 'abc-123',
  url: 'https://example.com',
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});
```

### Global Error Handler

```typescript
// Fastify error handler
fastify.setErrorHandler((error, request, reply) => {
  // Log all errors
  logger.error('Request error', {
    method: request.method,
    url: request.url,
    error: error.message,
    stack: error.stack,
    userId: request.user?.id
  });
  
  // Handle specific error types
  if (error instanceof ValidationError) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: error.message,
      field: error.field
    });
  }
  
  if (error instanceof AuthenticationError) {
    return reply.code(401).send({
      error: 'Authentication Error',
      message: error.message
    });
  }
  
  if (error instanceof AuthorizationError) {
    return reply.code(403).send({
      error: 'Authorization Error',
      message: error.message
    });
  }
  
  if (error instanceof NotFoundError) {
    return reply.code(404).send({
      error: 'Not Found',
      message: error.message
    });
  }
  
  if (error instanceof ServiceUnavailableError) {
    return reply.code(503).send({
      error: 'Service Unavailable',
      message: error.message
    });
  }
  
  // Default to 500 for unknown errors
  reply.code(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message
  });
});
```

### Frontend Error Handling

```typescript
// React Error Boundary
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Er is iets misgegaan</h1>
          <p>Probeer de pagina te verversen</p>
          <button onClick={() => window.location.reload()}>
            Ververs pagina
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// API error handling
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.message);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      // Show user-friendly error message
      toast.error(error.message);
    } else {
      // Network error or other issue
      toast.error('Netwerkfout. Controleer je internetverbinding.');
    }
    throw error;
  }
}
```


## Testing Strategy

### Dual Testing Approach

Het systeem gebruikt een comprehensive testing strategie die unit tests en property-based tests combineert voor maximale coverage en correctheidsgaranties.

#### Unit Tests
- Specifieke voorbeelden en edge cases
- Integratiepunten tussen componenten
- Error conditions en boundary cases
- Mock external dependencies

#### Property-Based Tests
- Universele properties over alle inputs
- Comprehensive input coverage via randomization
- Minimum 100 iteraties per property test
- Validatie van correctness properties uit design document

### Property-Based Testing Library

**Fast-check** wordt gebruikt voor property-based testing in TypeScript/JavaScript:

```bash
npm install --save-dev fast-check @types/fast-check
```

### Test Structure

```
backend/
├── src/
│   └── __tests__/
│       ├── unit/
│       │   ├── adapters/
│       │   │   ├── nodeAdapter.test.ts
│       │   │   ├── pythonAdapter.test.ts
│       │   │   ├── phpAdapter.test.ts
│       │   │   ├── restAdapter.test.ts
│       │   │   └── dbAdapter.test.ts
│       │   ├── api/
│       │   │   ├── projects.test.ts
│       │   │   ├── analytics.test.ts
│       │   │   ├── payments.test.ts
│       │   │   └── webhooks.test.ts
│       │   ├── workers/
│       │   │   ├── syncWorker.test.ts
│       │   │   ├── analyticsWorker.test.ts
│       │   │   └── paymentWorker.test.ts
│       │   └── auth/
│       │       └── authManager.test.ts
│       ├── properties/
│       │   ├── schema.properties.test.ts
│       │   ├── adapter.properties.test.ts
│       │   ├── api.properties.test.ts
│       │   ├── database.properties.test.ts
│       │   ├── websocket.properties.test.ts
│       │   ├── webhook.properties.test.ts
│       │   ├── worker.properties.test.ts
│       │   ├── queue.properties.test.ts
│       │   ├── wizard.properties.test.ts
│       │   ├── auth.properties.test.ts
│       │   └── export.properties.test.ts
│       └── integration/
│           ├── endToEnd.test.ts
│           ├── websocket.integration.test.ts
│           └── workflow.integration.test.ts

frontend/
├── src/
│   └── __tests__/
│       ├── components/
│       │   ├── Dashboard.test.tsx
│       │   ├── ProjectCard.test.tsx
│       │   ├── Wizard.test.tsx
│       │   └── AnalyticsChart.test.tsx
│       ├── properties/
│       │   ├── dashboard.properties.test.tsx
│       │   └── wizard.properties.test.tsx
│       └── integration/
│           └── userFlow.test.tsx
```

### Property-Based Test Examples

#### Property 1: UnifiedProject Schema Normalisatie

```typescript
// backend/src/__tests__/properties/schema.properties.test.ts
import fc from 'fast-check';
import { NodeAdapter } from '../../adapters/nodeAdapter';
import { PythonAdapter } from '../../adapters/pythonAdapter';
import { PHPAdapter } from '../../adapters/phpAdapter';
import { RESTAdapter } from '../../adapters/restAdapter';
import { DBAdapter } from '../../adapters/dbAdapter';

/**
 * Feature: superstash-unified-dashboard, Property 1: 
 * Voor alle project data van elk adapter type (Node, Python, PHP, REST, DB), 
 * moet de genormaliseerde output een geldig UnifiedProject object zijn met 
 * alle verplichte velden: id, name, type, status.
 */
describe('Property 1: UnifiedProject Schema Normalisatie', () => {
  const adapters = [
    new NodeAdapter(),
    new PythonAdapter(),
    new PHPAdapter(),
    new RESTAdapter(),
    new DBAdapter()
  ];
  
  test('should normalize all adapter outputs to valid UnifiedProject schema', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          type: fc.constantFrom('node', 'python', 'php', 'rest', 'db'),
          url: fc.webUrl(),
          projectData: fc.record({
            name: fc.string({ minLength: 1 }),
            status: fc.constantFrom('live', 'staging', 'offline'),
            type: fc.constantFrom('web', 'app', 'service'),
            analytics: fc.option(fc.record({
              users: fc.nat(),
              pageviews: fc.nat(),
              revenue: fc.option(fc.float({ min: 0 }))
            })),
            payments: fc.option(fc.record({
              lastPayment: fc.date().map(d => d.toISOString()),
              total: fc.float({ min: 0 })
            }))
          })
        }),
        async (config) => {
          const adapter = adapters.find(a => a.type === config.type);
          const result = await adapter.fetchProjectData({
            type: config.type,
            url: config.url
          });
          
          // Verify required fields exist
          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('name');
          expect(result).toHaveProperty('type');
          expect(result).toHaveProperty('status');
          
          // Verify types are correct
          expect(typeof result.id).toBe('string');
          expect(typeof result.name).toBe('string');
          expect(['web', 'app', 'service']).toContain(result.type);
          expect(['live', 'staging', 'offline']).toContain(result.status);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property 15: Database CRUD Round-Trip

```typescript
// backend/src/__tests__/properties/database.properties.test.ts
import fc from 'fast-check';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Feature: superstash-unified-dashboard, Property 15: 
 * Voor alle UnifiedProject objecten, moet create-then-read hetzelfde object 
 * returnen, update-then-read moet wijzigingen reflecteren, en delete-then-read 
 * moet not found returnen.
 */
describe('Property 15: Database CRUD Round-Trip', () => {
  afterEach(async () => {
    await prisma.project.deleteMany();
  });
  
  test('create-then-read should return same object', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          type: fc.constantFrom('web', 'app', 'service'),
          status: fc.constantFrom('live', 'staging', 'offline'),
          repo: fc.option(fc.webUrl()),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }))
        }),
        async (projectData) => {
          // Create
          const created = await prisma.project.create({
            data: projectData
          });
          
          // Read
          const read = await prisma.project.findUnique({
            where: { id: created.id }
          });
          
          // Verify
          expect(read).not.toBeNull();
          expect(read.name).toBe(projectData.name);
          expect(read.type).toBe(projectData.type);
          expect(read.status).toBe(projectData.status);
          expect(read.repo).toBe(projectData.repo);
          expect(read.tags).toEqual(projectData.tags);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('update-then-read should reflect changes', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          initial: fc.record({
            name: fc.string({ minLength: 1 }),
            type: fc.constantFrom('web', 'app', 'service'),
            status: fc.constantFrom('live', 'staging', 'offline')
          }),
          update: fc.record({
            name: fc.string({ minLength: 1 }),
            status: fc.constantFrom('live', 'staging', 'offline')
          })
        }),
        async ({ initial, update }) => {
          // Create
          const created = await prisma.project.create({
            data: initial
          });
          
          // Update
          await prisma.project.update({
            where: { id: created.id },
            data: update
          });
          
          // Read
          const read = await prisma.project.findUnique({
            where: { id: created.id }
          });
          
          // Verify changes
          expect(read.name).toBe(update.name);
          expect(read.status).toBe(update.status);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('delete-then-read should return null', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1 }),
          type: fc.constantFrom('web', 'app', 'service'),
          status: fc.constantFrom('live', 'staging', 'offline')
        }),
        async (projectData) => {
          // Create
          const created = await prisma.project.create({
            data: projectData
          });
          
          // Delete
          await prisma.project.delete({
            where: { id: created.id }
          });
          
          // Read
          const read = await prisma.project.findUnique({
            where: { id: created.id }
          });
          
          // Verify not found
          expect(read).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property 18: WebSocket Broadcast on Data Change

```typescript
// backend/src/__tests__/properties/websocket.properties.test.ts
import fc from 'fast-check';
import { WebSocketManager } from '../../websocket/websocketManager';
import { EventEmitter } from 'events';

/**
 * Feature: superstash-unified-dashboard, Property 18: 
 * Voor alle data wijzigingen (project updates, analytics updates, payment updates, 
 * deployment updates), moet de server een WebSocket broadcast sturen naar alle 
 * geconnecteerde clients.
 */
describe('Property 18: WebSocket Broadcast on Data Change', () => {
  let wsManager: WebSocketManager;
  let mockClients: Map<string, EventEmitter>;
  
  beforeEach(() => {
    wsManager = new WebSocketManager();
    mockClients = new Map();
  });
  
  test('should broadcast all data change types to all connected clients', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          messageType: fc.constantFrom(
            'project_update',
            'analytics_update',
            'payment_update',
            'deployment_update'
          ),
          data: fc.anything(),
          numClients: fc.integer({ min: 1, max: 10 })
        }),
        async ({ messageType, data, numClients }) => {
          // Setup mock clients
          const receivedMessages: any[][] = [];
          for (let i = 0; i < numClients; i++) {
            const clientId = `client-${i}`;
            const mockWs = new EventEmitter();
            const messages: any[] = [];
            
            mockWs.on('message', (msg) => messages.push(msg));
            receivedMessages.push(messages);
            
            wsManager.registerConnection(clientId, mockWs as any);
            mockClients.set(clientId, mockWs);
          }
          
          // Broadcast message
          wsManager.broadcast({
            type: messageType,
            data: data,
            timestamp: new Date().toISOString()
          });
          
          // Verify all clients received the message
          for (const messages of receivedMessages) {
            expect(messages.length).toBe(1);
            expect(messages[0].type).toBe(messageType);
            expect(messages[0].data).toEqual(data);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property 29: Analytics Aggregation Calculation

```typescript
// backend/src/__tests__/properties/worker.properties.test.ts
import fc from 'fast-check';
import { AnalyticsWorker } from '../../workers/analyticsWorker';

/**
 * Feature: superstash-unified-dashboard, Property 29: 
 * Voor alle sets van projecten met analytics data, moet de aggregation worker 
 * de totalen correct berekenen: sum(users), sum(pageviews), sum(revenue).
 */
describe('Property 29: Analytics Aggregation Calculation', () => {
  const worker = new AnalyticsWorker();
  
  test('should correctly sum analytics across all projects', () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            analytics: fc.record({
              users: fc.nat({ max: 1000000 }),
              pageviews: fc.nat({ max: 10000000 }),
              revenue: fc.option(fc.float({ min: 0, max: 1000000 }))
            })
          }),
          { minLength: 1, maxLength: 50 }
        ),
        async (projects) => {
          // Calculate expected totals
          const expectedUsers = projects.reduce(
            (sum, p) => sum + p.analytics.users, 
            0
          );
          const expectedPageviews = projects.reduce(
            (sum, p) => sum + p.analytics.pageviews, 
            0
          );
          const expectedRevenue = projects.reduce(
            (sum, p) => sum + (p.analytics.revenue || 0), 
            0
          );
          
          // Run aggregation
          const result = await worker.aggregateAnalytics(projects);
          
          // Verify
          expect(result.totalUsers).toBe(expectedUsers);
          expect(result.totalPageviews).toBe(expectedPageviews);
          expect(result.totalRevenue).toBeCloseTo(expectedRevenue, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property 56: Dashboard Filtering

```typescript
// frontend/src/__tests__/properties/dashboard.properties.test.tsx
import fc from 'fast-check';
import { filterProjects } from '../../utils/filterProjects';

/**
 * Feature: superstash-unified-dashboard, Property 56: 
 * Voor alle filter criteria (type, status, search query), moet de Dashboard 
 * alleen projecten tonen die aan de criteria voldoen.
 */
describe('Property 56: Dashboard Filtering', () => {
  test('should only show projects matching filter criteria', () => {
    fc.assert(
      fc.property(
        fc.record({
          projects: fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1 }),
              type: fc.constantFrom('web', 'app', 'service'),
              status: fc.constantFrom('live', 'staging', 'offline'),
              tags: fc.array(fc.string())
            }),
            { minLength: 10, maxLength: 100 }
          ),
          filter: fc.record({
            type: fc.option(fc.constantFrom('web', 'app', 'service')),
            status: fc.option(fc.constantFrom('live', 'staging', 'offline')),
            search: fc.option(fc.string())
          })
        }),
        ({ projects, filter }) => {
          const filtered = filterProjects(projects, filter);
          
          // Verify all filtered projects match criteria
          for (const project of filtered) {
            if (filter.type) {
              expect(project.type).toBe(filter.type);
            }
            if (filter.status) {
              expect(project.status).toBe(filter.status);
            }
            if (filter.search) {
              const searchLower = filter.search.toLowerCase();
              const matchesSearch = 
                project.name.toLowerCase().includes(searchLower) ||
                project.tags.some(tag => 
                  tag.toLowerCase().includes(searchLower)
                );
              expect(matchesSearch).toBe(true);
            }
          }
          
          // Verify no matching projects were excluded
          for (const project of projects) {
            const shouldBeIncluded = 
              (!filter.type || project.type === filter.type) &&
              (!filter.status || project.status === filter.status) &&
              (!filter.search || 
                project.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                project.tags.some(tag => 
                  tag.toLowerCase().includes(filter.search.toLowerCase())
                )
              );
            
            const isIncluded = filtered.some(p => p.id === project.id);
            expect(isIncluded).toBe(shouldBeIncluded);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Examples

#### Adapter Unit Tests

```typescript
// backend/src/__tests__/unit/adapters/nodeAdapter.test.ts
import { NodeAdapter } from '../../../adapters/nodeAdapter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NodeAdapter', () => {
  let adapter: NodeAdapter;
  
  beforeEach(() => {
    adapter = new NodeAdapter();
    jest.clearAllMocks();
  });
  
  test('should fetch data from Node.js project endpoints', async () => {
    const mockResponse = {
      data: {
        name: 'Test Project',
        status: 'live',
        analytics: { users: 100, pageviews: 1000 },
        payments: { lastPayment: '2024-01-01', total: 500 }
      }
    };
    
    mockedAxios.get.mockResolvedValue(mockResponse);
    
    const result = await adapter.fetchProjectData({
      type: 'node',
      url: 'https://example.com',
      endpoints: {
        status: '/status',
        analytics: '/analytics',
        payments: '/payments'
      }
    });
    
    expect(result.name).toBe('Test Project');
    expect(result.status).toBe('live');
    expect(result.analytics.users).toBe(100);
  });
  
  test('should return offline status on connection failure', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Connection refused'));
    
    const result = await adapter.fetchProjectData({
      type: 'node',
      url: 'https://example.com'
    });
    
    expect(result.status).toBe('offline');
  });
  
  test('should handle timeout errors', async () => {
    mockedAxios.get.mockRejectedValue({
      code: 'ECONNABORTED',
      message: 'timeout of 30000ms exceeded'
    });
    
    const result = await adapter.fetchProjectData({
      type: 'node',
      url: 'https://example.com'
    });
    
    expect(result.status).toBe('offline');
  });
});
```

#### API Endpoint Unit Tests

```typescript
// backend/src/__tests__/unit/api/projects.test.ts
import { build } from '../../../server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Projects API', () => {
  let app;
  
  beforeAll(async () => {
    app = await build();
  });
  
  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });
  
  beforeEach(async () => {
    await prisma.project.deleteMany();
  });
  
  test('GET /api/projects should return all projects', async () => {
    await prisma.project.createMany({
      data: [
        { name: 'Project 1', type: 'web', status: 'live' },
        { name: 'Project 2', type: 'app', status: 'staging' }
      ]
    });
    
    const response = await app.inject({
      method: 'GET',
      url: '/api/projects',
      headers: {
        authorization: `Bearer ${getTestToken()}`
      }
    });
    
    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.projects).toHaveLength(2);
  });
  
  test('POST /api/projects should create new project', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: {
        authorization: `Bearer ${getTestToken()}`
      },
      payload: {
        name: 'New Project',
        type: 'web',
        config: {
          type: 'node',
          url: 'https://example.com'
        }
      }
    });
    
    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.project.name).toBe('New Project');
  });
  
  test('GET /api/projects/:id should return 404 for non-existent project', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/projects/non-existent-id',
      headers: {
        authorization: `Bearer ${getTestToken()}`
      }
    });
    
    expect(response.statusCode).toBe(404);
  });
});
```

### Integration Tests

```typescript
// backend/src/__tests__/integration/endToEnd.test.ts
import { build } from '../../server';
import { PrismaClient } from '@prisma/client';
import WebSocket from 'ws';

const prisma = new PrismaClient();

describe('End-to-End Integration', () => {
  let app;
  let ws: WebSocket;
  
  beforeAll(async () => {
    app = await build();
    await app.listen({ port: 4001 });
  });
  
  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });
  
  test('complete workflow: create project, receive WebSocket update', async (done) => {
    // Connect WebSocket
    ws = new WebSocket('ws://localhost:4001', {
      headers: {
        authorization: `Bearer ${getTestToken()}`
      }
    });
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'project_update') {
        expect(message.data.name).toBe('Integration Test Project');
        ws.close();
        done();
      }
    });
    
    // Create project via API
    await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: {
        authorization: `Bearer ${getTestToken()}`
      },
      payload: {
        name: 'Integration Test Project',
        type: 'web',
        config: {
          type: 'rest',
          url: 'https://example.com'
        }
      }
    });
  });
});
```

### Test Configuration

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 30000
};
```

### Test Commands

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:properties": "jest --testPathPattern=properties",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

### Coverage Requirements

- **Unit Tests**: Minimum 80% code coverage
- **Property Tests**: Alle 89 correctness properties geïmplementeerd
- **Integration Tests**: Alle kritieke user flows gedekt
- **E2E Tests**: Happy path en error scenarios

