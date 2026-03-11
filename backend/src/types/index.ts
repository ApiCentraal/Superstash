/**
 * Superstash Unified Dashboard - Type Definitions
 * 
 * Dit bestand bevat alle TypeScript type definities voor het systeem.
 * Alle types zijn gedocumenteerd in het Nederlands volgens de requirements.
 */

/**
 * ProjectType - Enum voor project types
 * 
 * Definieert de mogelijke types van projecten in het systeem.
 */
export enum ProjectType {
  WEB = 'web',
  APP = 'app',
  SERVICE = 'service'
}

/**
 * ProjectStatus - Enum voor project status
 * 
 * Definieert de mogelijke statussen van projecten.
 */
export enum ProjectStatus {
  LIVE = 'live',
  STAGING = 'staging',
  OFFLINE = 'offline'
}

/**
 * AdapterType - Enum voor adapter types
 * 
 * Definieert de ondersteunde adapter types voor verschillende technologieën.
 */
export enum AdapterType {
  NODE = 'node',
  PYTHON = 'python',
  PHP = 'php',
  REST = 'rest',
  DB = 'db'
}

/**
 * AuthType - Enum voor authenticatie types
 * 
 * Definieert de ondersteunde authenticatie methoden voor adapters.
 */
export enum AuthType {
  API_KEY = 'apiKey',
  BEARER = 'bearer',
  BASIC = 'basic'
}

/**
 * DatabaseType - Enum voor database types
 * 
 * Definieert de ondersteunde database types voor de database adapter.
 */
export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MONGODB = 'mongodb'
}

/**
 * UserRole - Enum voor gebruikersrollen
 * 
 * Definieert de mogelijke rollen voor gebruikers in het systeem.
 */
export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  VIEWER = 'viewer'
}

/**
 * WebSocketMessageType - Enum voor WebSocket bericht types
 * 
 * Definieert de types van real-time berichten die via WebSocket worden verzonden.
 */
export enum WebSocketMessageType {
  PROJECT_UPDATE = 'project_update',
  ANALYTICS_UPDATE = 'analytics_update',
  PAYMENT_UPDATE = 'payment_update',
  DEPLOYMENT_UPDATE = 'deployment_update'
}

/**
 * WebhookEventType - Enum voor webhook event types
 * 
 * Definieert de types van events die via webhooks worden ontvangen.
 */
export enum WebhookEventType {
  STATUS_CHANGE = 'status_change',
  DEPLOYMENT = 'deployment',
  PAYMENT = 'payment',
  ANALYTICS = 'analytics'
}

/**
 * UnifiedProject - Het gestandaardiseerde project schema
 * 
 * Alle projecten worden genormaliseerd naar dit schema ongeacht de onderliggende technologie.
 * Dit zorgt voor een consistente interface over alle adapter types heen.
 * 
 * @property id - Unieke identifier voor het project
 * @property name - Naam van het project
 * @property type - Type project (web, app, of service)
 * @property status - Huidige status (live, staging, of offline)
 * @property repo - Optionele repository URL
 * @property analytics - Optionele analytics data met users, pageviews en revenue
 * @property payments - Optionele payment data met lastPayment en total
 * @property lastBuild - Optionele ISO timestamp van laatste build
 * @property tags - Optionele tags voor categorisatie en filtering
 */
export interface UnifiedProject {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
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

/**
 * AdapterConfig - Configuratie voor project adapters
 * 
 * Bevat alle benodigde informatie om een adapter te configureren
 * voor verschillende project types (Node, Python, PHP, REST, Database).
 * 
 * @property type - Type adapter (node, python, php, rest, of db)
 * @property url - Basis URL voor REST-based adapters
 * @property endpoints - Endpoint configuratie voor data fetching
 * @property auth - Authenticatie configuratie
 * @property dbConfig - Database configuratie voor database adapter
 * @property fieldMapping - Custom field mapping voor REST adapter
 */
export interface AdapterConfig {
  type: AdapterType;
  url?: string;
  endpoints?: {
    status?: string;
    analytics?: string;
    payments?: string;
  };
  auth?: {
    type: AuthType;
    credentials: string;
  };
  dbConfig?: {
    type: DatabaseType;
    connectionString: string;
    query: string;
  };
  fieldMapping?: Record<string, string>;
}

/**
 * WebSocketMessage - Bericht structuur voor WebSocket communicatie
 * 
 * Gebruikt voor real-time updates tussen backend en frontend.
 * 
 * @property type - Type bericht (project_update, analytics_update, payment_update, deployment_update)
 * @property data - Payload data voor het bericht
 * @property timestamp - ISO timestamp van het bericht
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: string;
}

/**
 * WebhookEvent - Structuur voor inkomende webhook events
 * 
 * Gebruikt voor event-driven updates van externe projecten.
 * 
 * @property projectId - ID van het project dat het event triggerde
 * @property type - Type event (status_change, deployment, payment, analytics)
 * @property data - Event payload data
 * @property signature - HMAC signature voor validatie
 * @property timestamp - ISO timestamp van het event
 */
export interface WebhookEvent {
  projectId: string;
  type: WebhookEventType;
  data: any;
  signature: string;
  timestamp: string;
}

/**
 * AuthToken - JWT authenticatie token met gebruikersinformatie
 * 
 * @property token - JWT token string
 * @property expiresAt - Expiratie datum van de token
 * @property user - Gebruikersinformatie gekoppeld aan de token
 */
export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}

/**
 * User - Gebruikersinformatie voor authenticatie en autorisatie
 * 
 * @property id - Unieke identifier voor de gebruiker
 * @property email - Email adres van de gebruiker
 * @property role - Rol van de gebruiker (admin, developer, viewer)
 * @property teams - Lijst van team IDs waar de gebruiker lid van is
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  teams: string[];
}

/**
 * TimeSeriesData - Time-series data voor analytics visualisatie
 */
export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  projectId?: string;
}

/**
 * HealthCheckResult - Resultaat van health check endpoint
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: boolean;
    redis: boolean;
    queue: boolean;
  };
  timestamp: string;
}

/**
 * API Request/Response Types
 */

export interface GetProjectsResponse {
  projects: UnifiedProject[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProjectRequest {
  name: string;
  type: ProjectType;
  config: AdapterConfig;
  tags?: string[];
  teamId?: string;
}

export interface CreateProjectResponse {
  project: UnifiedProject;
  message: string;
}

export interface UpdateProjectRequest {
  name?: string;
  type?: ProjectType;
  config?: AdapterConfig;
  tags?: string[];
  status?: ProjectStatus;
}

export interface WebhookRequest {
  type: WebhookEventType;
  data: any;
  signature: string;
}

export interface GetAnalyticsRequest {
  projectIds?: string[];
  startDate?: string;
  endDate?: string;
  metric?: 'users' | 'pageviews' | 'revenue';
}

export interface GetAnalyticsResponse {
  data: TimeSeriesData[];
  aggregated: {
    totalUsers: number;
    totalPageviews: number;
    totalRevenue: number;
  };
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  memberIds: string[];
}

export interface GetLogsRequest {
  userId?: string;
  projectId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface GetLogsResponse {
  logs: any[];
  total: number;
  page: number;
  pageSize: number;
}
