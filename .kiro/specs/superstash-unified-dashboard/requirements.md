# Requirements Document

## Introductie

Superstash is een centrale applicatiemanager die een unified dashboard biedt voor het beheren van alle projecten, sites, apps, repositories, betalingen, analytics en deployments over meerdere technologieën en platforms heen. Het systeem normaliseert heterogene projectdata naar een consistent UnifiedProject schema en biedt real-time synchronisatie via WebSocket en event-driven architectuur.

## Glossary

- **Superstash_System**: Het complete centrale applicatiemanagement platform
- **Unified_API**: De Node.js/Fastify backend API die alle adapters orkestreert
- **Dashboard**: De React/Next.js frontend gebruikersinterface
- **Project_Adapter**: Een module die project-specifieke data normaliseert naar UnifiedProject schema
- **UnifiedProject**: Het gestandaardiseerde data schema voor alle projecten
- **Wizard**: De plug-and-play interface voor het toevoegen van nieuwe projecten
- **Background_Worker**: Een asynchrone taak voor data synchronisatie, analytics of betalingen
- **WebSocket_Connection**: Real-time bidirectionele communicatie tussen backend en frontend
- **Webhook_Listener**: Een endpoint die events van externe projecten ontvangt
- **Database**: PostgreSQL database met Prisma ORM
- **Queue_System**: BullMQ job queue voor asynchrone taken
- **Node_Adapter**: Adapter voor Node.js/Express/Fastify projecten
- **Python_Adapter**: Adapter voor Python/Flask/FastAPI projecten
- **PHP_Adapter**: Adapter voor PHP projecten
- **REST_Adapter**: Generieke adapter voor REST API endpoints
- **DB_Adapter**: Adapter voor directe database connecties
- **Analytics_Data**: Metrics zoals users, pageviews, revenue
- **Payment_Data**: Betalingsinformatie zoals lastPayment, total
- **Deployment_Status**: Build en deployment informatie

## Requirements

### Requirement 1: UnifiedProject Data Schema

**User Story:** Als een ontwikkelaar wil ik dat alle projecten genormaliseerd worden naar een consistent schema, zodat ik een uniforme interface heb ongeacht de onderliggende technologie.

#### Acceptance Criteria

1. THE Unified_API SHALL normalize all project data to the UnifiedProject schema containing: id, name, type, status, repo, analytics, payments, lastBuild, and tags
2. THE UnifiedProject SHALL support type values: 'web', 'app', 'service'
3. THE UnifiedProject SHALL support status values: 'live', 'staging', 'offline'
4. WHEN a Project_Adapter processes project data, THE Unified_API SHALL validate the output against the UnifiedProject schema
5. IF validation fails, THEN THE Unified_API SHALL return a descriptive error with the validation failure details

### Requirement 2: Node.js Project Adapter

**User Story:** Als een ontwikkelaar wil ik Node.js projecten kunnen integreren, zodat ik Express/Fastify applicaties kan monitoren in het dashboard.

#### Acceptance Criteria

1. THE Node_Adapter SHALL connect to Node.js projects via REST endpoints
2. WHEN the Node_Adapter receives project data, THE Node_Adapter SHALL extract name, status, analytics, and payment information
3. THE Node_Adapter SHALL transform the extracted data into UnifiedProject format
4. WHEN a Node.js project exposes /status endpoint, THE Node_Adapter SHALL fetch the current project status
5. WHEN a Node.js project exposes /analytics endpoint, THE Node_Adapter SHALL fetch analytics data
6. WHEN a Node.js project exposes /payments endpoint, THE Node_Adapter SHALL fetch payment data
7. IF a connection fails, THEN THE Node_Adapter SHALL log the error and return status 'offline'

### Requirement 3: Python Project Adapter

**User Story:** Als een ontwikkelaar wil ik Python projecten kunnen integreren, zodat ik Flask/FastAPI applicaties kan monitoren in het dashboard.

#### Acceptance Criteria

1. THE Python_Adapter SHALL connect to Python projects via REST endpoints
2. WHEN the Python_Adapter receives project data, THE Python_Adapter SHALL extract name, status, analytics, and payment information
3. THE Python_Adapter SHALL transform the extracted data into UnifiedProject format
4. WHEN a Python project exposes /status endpoint, THE Python_Adapter SHALL fetch the current project status
5. WHEN a Python project exposes /analytics endpoint, THE Python_Adapter SHALL fetch analytics data
6. WHEN a Python project exposes /payments endpoint, THE Python_Adapter SHALL fetch payment data
7. IF a connection fails, THEN THE Python_Adapter SHALL log the error and return status 'offline'

### Requirement 4: PHP Project Adapter

**User Story:** Als een ontwikkelaar wil ik PHP projecten kunnen integreren, zodat ik PHP applicaties kan monitoren in het dashboard.

#### Acceptance Criteria

1. THE PHP_Adapter SHALL connect to PHP projects via REST endpoints
2. WHEN the PHP_Adapter receives project data, THE PHP_Adapter SHALL extract name, status, analytics, and payment information
3. THE PHP_Adapter SHALL transform the extracted data into UnifiedProject format
4. IF a connection fails, THEN THE PHP_Adapter SHALL log the error and return status 'offline'

### Requirement 5: Generic REST API Adapter

**User Story:** Als een ontwikkelaar wil ik generieke REST APIs kunnen integreren, zodat ik elk project met een HTTP interface kan monitoren.

#### Acceptance Criteria

1. THE REST_Adapter SHALL connect to any REST API endpoint via HTTP/HTTPS
2. WHEN the REST_Adapter receives JSON response data, THE REST_Adapter SHALL map configurable fields to UnifiedProject schema
3. THE REST_Adapter SHALL support custom field mapping configuration
4. THE REST_Adapter SHALL support authentication via API keys, Bearer tokens, or Basic auth
5. IF a connection fails, THEN THE REST_Adapter SHALL log the error and return status 'offline'

### Requirement 6: Database Direct Adapter

**User Story:** Als een ontwikkelaar wil ik direct database connecties kunnen maken, zodat ik projectdata rechtstreeks uit databases kan ophalen.

#### Acceptance Criteria

1. THE DB_Adapter SHALL connect to PostgreSQL, MySQL, and MongoDB databases
2. WHEN the DB_Adapter executes a query, THE DB_Adapter SHALL map query results to UnifiedProject schema
3. THE DB_Adapter SHALL support configurable SQL queries for data extraction
4. THE DB_Adapter SHALL support connection pooling for performance
5. IF a database connection fails, THEN THE DB_Adapter SHALL log the error and return status 'offline'

### Requirement 7: Unified API Endpoints

**User Story:** Als een frontend ontwikkelaar wil ik RESTful API endpoints, zodat ik projectdata kan ophalen en manipuleren vanuit het dashboard.

#### Acceptance Criteria

1. THE Unified_API SHALL expose GET /api/projects endpoint to retrieve all projects
2. THE Unified_API SHALL expose GET /api/projects/:id endpoint to retrieve a specific project
3. THE Unified_API SHALL expose POST /api/projects endpoint to add a new project
4. THE Unified_API SHALL expose PUT /api/projects/:id endpoint to update a project
5. THE Unified_API SHALL expose DELETE /api/projects/:id endpoint to remove a project
6. THE Unified_API SHALL expose GET /api/analytics endpoint to retrieve aggregated analytics
7. THE Unified_API SHALL expose GET /api/payments endpoint to retrieve payment data
8. WHEN an API request is invalid, THE Unified_API SHALL return HTTP 400 with error details
9. WHEN a resource is not found, THE Unified_API SHALL return HTTP 404
10. WHEN an API request succeeds, THE Unified_API SHALL return HTTP 200 with JSON response

### Requirement 8: Database Persistence

**User Story:** Als een systeembeheerder wil ik dat projectdata persistent opgeslagen wordt, zodat data behouden blijft tussen server restarts.

#### Acceptance Criteria

1. THE Database SHALL store UnifiedProject records in a projects table
2. THE Database SHALL store user accounts in a users table
3. THE Database SHALL store team information in a teams table
4. THE Database SHALL store event history in a logs table
5. THE Database SHALL store payment records in a payments table
6. WHEN the Unified_API creates a project, THE Database SHALL persist the UnifiedProject data
7. WHEN the Unified_API updates a project, THE Database SHALL update the corresponding record
8. WHEN the Unified_API deletes a project, THE Database SHALL remove the corresponding record
9. THE Database SHALL enforce referential integrity via foreign key constraints

### Requirement 9: Real-time WebSocket Updates

**User Story:** Als een dashboard gebruiker wil ik real-time updates zien, zodat ik direct op de hoogte ben van wijzigingen zonder de pagina te verversen.

#### Acceptance Criteria

1. THE Unified_API SHALL establish WebSocket_Connection on port 4000
2. WHEN a client connects, THE Unified_API SHALL authenticate the WebSocket_Connection
3. WHEN project data changes, THE Unified_API SHALL broadcast the update via WebSocket_Connection to all connected clients
4. WHEN analytics data updates, THE Unified_API SHALL broadcast the update via WebSocket_Connection
5. WHEN payment data updates, THE Unified_API SHALL broadcast the update via WebSocket_Connection
6. THE Dashboard SHALL establish WebSocket_Connection to the Unified_API on mount
7. WHEN the Dashboard receives a WebSocket message, THE Dashboard SHALL update the UI without page refresh
8. IF WebSocket_Connection drops, THEN THE Dashboard SHALL attempt reconnection with exponential backoff

### Requirement 10: Webhook Event Listeners

**User Story:** Als een systeembeheerder wil ik webhooks kunnen ontvangen van externe projecten, zodat het systeem event-driven updates kan verwerken.

#### Acceptance Criteria

1. THE Unified_API SHALL expose POST /api/webhooks/:projectId endpoint
2. WHEN a Webhook_Listener receives an event, THE Unified_API SHALL validate the webhook signature
3. WHEN a webhook event is valid, THE Unified_API SHALL update the corresponding project data
4. WHEN a webhook event is processed, THE Unified_API SHALL broadcast the update via WebSocket_Connection
5. THE Unified_API SHALL support webhook events for: status changes, deployment completion, payment received, analytics update
6. IF webhook signature validation fails, THEN THE Unified_API SHALL return HTTP 401 and log the attempt

### Requirement 11: Background Sync Worker

**User Story:** Als een systeembeheerder wil ik periodieke data synchronisatie, zodat projectdata up-to-date blijft ook zonder webhooks.

#### Acceptance Criteria

1. THE Background_Worker SHALL poll all configured projects every 5 minutes
2. WHEN the Background_Worker fetches project data, THE Background_Worker SHALL use the appropriate Project_Adapter
3. WHEN the Background_Worker detects data changes, THE Background_Worker SHALL update the Database
4. WHEN the Background_Worker updates data, THE Unified_API SHALL broadcast the update via WebSocket_Connection
5. THE Background_Worker SHALL log all sync operations with timestamp and status
6. IF a sync operation fails, THEN THE Background_Worker SHALL retry with exponential backoff up to 3 attempts

### Requirement 12: Analytics Aggregation Worker

**User Story:** Als een dashboard gebruiker wil ik geaggregeerde analytics over alle projecten, zodat ik totaaloverzichten kan zien.

#### Acceptance Criteria

1. THE Background_Worker SHALL aggregate analytics data from all projects every 15 minutes
2. THE Background_Worker SHALL calculate total users across all projects
3. THE Background_Worker SHALL calculate total pageviews across all projects
4. THE Background_Worker SHALL calculate total revenue across all projects
5. THE Background_Worker SHALL store aggregated analytics in the Database
6. WHEN aggregation completes, THE Unified_API SHALL broadcast the updated analytics via WebSocket_Connection

### Requirement 13: Payment Reconciliation Worker

**User Story:** Als een financieel beheerder wil ik automatische betalingsreconciliatie, zodat betalingsdata consistent is over alle projecten.

#### Acceptance Criteria

1. THE Background_Worker SHALL reconcile payment data from all projects every 30 minutes
2. THE Background_Worker SHALL fetch payment data from Stripe, PayPal, and Square APIs
3. THE Background_Worker SHALL match payments to corresponding projects
4. THE Background_Worker SHALL update payment totals in the Database
5. WHEN reconciliation completes, THE Unified_API SHALL broadcast updated payment data via WebSocket_Connection
6. IF payment API calls fail, THEN THE Background_Worker SHALL log the error and continue with remaining sources

### Requirement 14: Job Queue System

**User Story:** Als een systeembeheerder wil ik een betrouwbaar job queue systeem, zodat asynchrone taken gegarandeerd uitgevoerd worden.

#### Acceptance Criteria

1. THE Queue_System SHALL use BullMQ for job management
2. THE Queue_System SHALL support job types: sync, analytics, payments, webhook
3. WHEN a job is added, THE Queue_System SHALL persist the job to Redis
4. WHEN a worker is available, THE Queue_System SHALL assign the next job from the queue
5. WHEN a job fails, THE Queue_System SHALL retry up to 3 times with exponential backoff
6. THE Queue_System SHALL provide job status monitoring via /api/jobs endpoint
7. IF a job fails after all retries, THEN THE Queue_System SHALL move the job to a dead letter queue

### Requirement 15: Advanced Project Wizard - Bulk Import

**User Story:** Als een ontwikkelaar wil ik meerdere projecten tegelijk kunnen toevoegen, zodat ik snel een groot aantal projecten kan importeren.

#### Acceptance Criteria

1. THE Wizard SHALL accept multiple project URLs as input (comma-separated or line-separated)
2. WHEN the Wizard receives multiple URLs, THE Wizard SHALL process each URL in parallel
3. THE Wizard SHALL display progress for each URL being processed
4. WHEN all URLs are processed, THE Wizard SHALL display a summary with success and failure counts
5. IF a URL fails, THEN THE Wizard SHALL display the error for that specific URL without blocking others

### Requirement 16: Advanced Project Wizard - Auto-detection

**User Story:** Als een ontwikkelaar wil ik automatische detectie van projecttype, zodat ik niet handmatig hoef te specificeren welke adapter gebruikt moet worden.

#### Acceptance Criteria

1. WHEN the Wizard receives a project URL, THE Wizard SHALL probe the URL for technology indicators
2. THE Wizard SHALL detect Node.js projects by checking for package.json or Express/Fastify headers
3. THE Wizard SHALL detect Python projects by checking for requirements.txt or Flask/FastAPI headers
4. THE Wizard SHALL detect PHP projects by checking for composer.json or PHP headers
5. WHEN detection succeeds, THE Wizard SHALL pre-select the appropriate Project_Adapter
6. WHEN detection is ambiguous, THE Wizard SHALL present multiple options to the user
7. IF detection fails, THEN THE Wizard SHALL default to REST_Adapter

### Requirement 17: Advanced Project Wizard - Endpoint Pre-fill

**User Story:** Als een ontwikkelaar wil ik dat standaard endpoints automatisch ingevuld worden, zodat ik minder handmatig hoef te configureren.

#### Acceptance Criteria

1. WHEN the Wizard detects a project type, THE Wizard SHALL pre-fill /status endpoint
2. THE Wizard SHALL pre-fill /analytics endpoint
3. THE Wizard SHALL pre-fill /payments endpoint
4. THE Wizard SHALL allow users to modify pre-filled endpoints
5. THE Wizard SHALL validate that endpoints return valid responses before saving

### Requirement 18: Advanced Project Wizard - AI-suggested Mapping

**User Story:** Als een ontwikkelaar wil ik AI-suggesties voor field mapping, zodat ik snel custom API responses kan mappen naar UnifiedProject schema.

#### Acceptance Criteria

1. WHEN the Wizard fetches a sample response from a project endpoint, THE Wizard SHALL analyze the JSON structure
2. THE Wizard SHALL suggest field mappings from response fields to UnifiedProject fields
3. THE Wizard SHALL display confidence scores for each suggested mapping
4. THE Wizard SHALL allow users to accept, reject, or modify suggested mappings
5. WHEN users accept mappings, THE Wizard SHALL save the configuration for the REST_Adapter

### Requirement 19: Advanced Project Wizard - Test & Validation

**User Story:** Als een ontwikkelaar wil ik projecten kunnen testen voordat ze toegevoegd worden, zodat ik zeker weet dat de configuratie correct is.

#### Acceptance Criteria

1. THE Wizard SHALL provide a "Test Connection" button
2. WHEN the user clicks "Test Connection", THE Wizard SHALL attempt to fetch data using the configured adapter
3. WHEN the test succeeds, THE Wizard SHALL display the fetched UnifiedProject data as preview
4. WHEN the test fails, THE Wizard SHALL display the error message with troubleshooting suggestions
5. THE Wizard SHALL prevent saving until at least one successful test has been performed

### Requirement 20: Advanced Project Wizard - Real-time Feedback

**User Story:** Als een ontwikkelaar wil ik real-time feedback tijdens het configureren, zodat ik direct zie of mijn configuratie werkt.

#### Acceptance Criteria

1. WHEN the user types a project URL, THE Wizard SHALL validate the URL format in real-time
2. WHEN the user modifies endpoint paths, THE Wizard SHALL validate the paths in real-time
3. THE Wizard SHALL display validation status with visual indicators (green checkmark, red X)
4. WHEN auto-detection runs, THE Wizard SHALL display a loading indicator
5. WHEN auto-detection completes, THE Wizard SHALL display the detected project type with confidence level

### Requirement 21: Dashboard Project List View

**User Story:** Als een dashboard gebruiker wil ik alle projecten in een overzicht zien, zodat ik snel de status van al mijn projecten kan controleren.

#### Acceptance Criteria

1. THE Dashboard SHALL display all projects in a grid or list layout
2. THE Dashboard SHALL display for each project: name, type, status, last update time
3. THE Dashboard SHALL support filtering projects by type
4. THE Dashboard SHALL support filtering projects by status
5. THE Dashboard SHALL support searching projects by name or tags
6. THE Dashboard SHALL support sorting projects by name, status, or last update
7. WHEN a project updates via WebSocket_Connection, THE Dashboard SHALL update the project card without page refresh

### Requirement 22: Dashboard Project Detail View

**User Story:** Als een dashboard gebruiker wil ik gedetailleerde informatie over een specifiek project zien, zodat ik diepgaande analytics en metrics kan bekijken.

#### Acceptance Criteria

1. WHEN the user clicks a project, THE Dashboard SHALL navigate to the project detail page
2. THE Dashboard SHALL display complete project information: name, type, status, repo, tags
3. THE Dashboard SHALL display analytics data: users, pageviews, revenue
4. THE Dashboard SHALL display payment data: lastPayment, total
5. THE Dashboard SHALL display deployment information: lastBuild, build status
6. THE Dashboard SHALL display a chart visualizing analytics trends over time
7. WHEN project data updates via WebSocket_Connection, THE Dashboard SHALL update the detail view in real-time

### Requirement 23: Dashboard Analytics Visualization

**User Story:** Als een dashboard gebruiker wil ik analytics data visueel gepresenteerd zien, zodat ik trends en patronen snel kan herkennen.

#### Acceptance Criteria

1. THE Dashboard SHALL display a line chart for pageviews over time
2. THE Dashboard SHALL display a line chart for users over time
3. THE Dashboard SHALL display a line chart for revenue over time
4. THE Dashboard SHALL support time range selection: 24 hours, 7 days, 30 days, 90 days
5. THE Dashboard SHALL display aggregated totals across all projects
6. THE Dashboard SHALL support filtering charts by specific projects

### Requirement 24: Authentication & Authorization

**User Story:** Als een systeembeheerder wil ik gebruikersauthenticatie en autorisatie, zodat alleen geautoriseerde gebruikers toegang hebben tot het dashboard.

#### Acceptance Criteria

1. THE Unified_API SHALL support JWT-based authentication
2. THE Unified_API SHALL support OAuth2 authentication
3. THE Unified_API SHALL support SAML authentication for enterprise SSO
4. WHEN a user logs in, THE Unified_API SHALL issue a JWT token with expiration time
5. WHEN a user makes an API request, THE Unified_API SHALL validate the JWT token
6. IF a token is invalid or expired, THEN THE Unified_API SHALL return HTTP 401
7. THE Unified_API SHALL support role-based access control with roles: admin, developer, viewer

### Requirement 25: Team Management

**User Story:** Als een team lead wil ik teams kunnen beheren, zodat ik gebruikers kan groeperen en toegang kan verlenen tot specifieke projecten.

#### Acceptance Criteria

1. THE Unified_API SHALL expose POST /api/teams endpoint to create teams
2. THE Unified_API SHALL expose GET /api/teams endpoint to list all teams
3. THE Unified_API SHALL expose POST /api/teams/:id/members endpoint to add team members
4. THE Unified_API SHALL expose DELETE /api/teams/:id/members/:userId endpoint to remove team members
5. THE Unified_API SHALL support assigning projects to teams
6. WHEN a user is a team member, THE Unified_API SHALL grant access to team projects
7. WHEN a user is not a team member, THE Unified_API SHALL deny access to team projects

### Requirement 26: Audit Logging

**User Story:** Als een systeembeheerder wil ik audit logs van alle acties, zodat ik kan traceren wie wat wanneer heeft gedaan.

#### Acceptance Criteria

1. THE Unified_API SHALL log all API requests with: timestamp, user, endpoint, method, status code
2. THE Unified_API SHALL log all project modifications with: timestamp, user, project, action, changes
3. THE Unified_API SHALL log all authentication events with: timestamp, user, action, success/failure
4. THE Unified_API SHALL expose GET /api/logs endpoint to retrieve audit logs
5. THE Unified_API SHALL support filtering logs by: date range, user, action type, project
6. THE Database SHALL retain audit logs for at least 90 days

### Requirement 27: Docker Compose Orchestration

**User Story:** Als een ontwikkelaar wil ik alle services via Docker Compose kunnen starten, zodat ik snel een lokale ontwikkelomgeving kan opzetten.

#### Acceptance Criteria

1. THE Superstash_System SHALL provide a docker-compose.yml file
2. THE docker-compose.yml SHALL define a postgres service on port 5432
3. THE docker-compose.yml SHALL define a backend service on port 4000
4. THE docker-compose.yml SHALL define a frontend service on port 3000
5. THE docker-compose.yml SHALL define an example Node.js project service on port 5000
6. THE docker-compose.yml SHALL define an example Python project service on port 6000
7. WHEN a developer runs docker-compose up, THE Superstash_System SHALL start all services
8. THE backend service SHALL wait for postgres to be ready before starting
9. THE frontend service SHALL connect to backend on http://backend:4000

### Requirement 28: Environment Configuration

**User Story:** Als een systeembeheerder wil ik environment variables kunnen configureren, zodat ik het systeem kan aanpassen aan verschillende omgevingen.

#### Acceptance Criteria

1. THE Unified_API SHALL read DATABASE_URL from environment variables
2. THE Unified_API SHALL read NODE_ENV from environment variables
3. THE Unified_API SHALL read PORT from environment variables with default 4000
4. THE Unified_API SHALL read JWT_SECRET from environment variables
5. THE Unified_API SHALL read STRIPE_API_KEY from environment variables
6. THE Dashboard SHALL read REACT_APP_API_URL from environment variables
7. THE Dashboard SHALL read REACT_APP_WS_URL from environment variables
8. IF required environment variables are missing, THEN THE Superstash_System SHALL log an error and exit

### Requirement 29: Database Migrations

**User Story:** Als een ontwikkelaar wil ik database schema wijzigingen via migraties kunnen beheren, zodat schema updates veilig en traceerbaar zijn.

#### Acceptance Criteria

1. THE Superstash_System SHALL use Prisma for database migrations
2. THE Superstash_System SHALL store migration files in backend/prisma/migrations/
3. WHEN a developer runs npm run migrate, THE Superstash_System SHALL apply pending migrations
4. THE Superstash_System SHALL track applied migrations in the _prisma_migrations table
5. IF a migration fails, THEN THE Superstash_System SHALL rollback the transaction and log the error

### Requirement 30: Error Handling & Resilience

**User Story:** Als een systeembeheerder wil ik robuuste error handling, zodat het systeem gracefully degradeert bij failures.

#### Acceptance Criteria

1. WHEN a Project_Adapter fails to connect, THE Unified_API SHALL mark the project as 'offline' and continue
2. WHEN a Background_Worker encounters an error, THE Background_Worker SHALL log the error and continue with remaining tasks
3. WHEN the Database connection fails, THE Unified_API SHALL return HTTP 503 and log the error
4. WHEN a WebSocket_Connection drops, THE Dashboard SHALL display a reconnection indicator
5. THE Unified_API SHALL implement circuit breaker pattern for external API calls
6. WHEN a circuit breaker opens, THE Unified_API SHALL return cached data if available
7. THE Unified_API SHALL implement request timeout of 30 seconds for all external calls
8. IF a request times out, THEN THE Unified_API SHALL log the timeout and return an error response

### Requirement 31: Performance & Scalability

**User Story:** Als een systeembeheerder wil ik dat het systeem performant is, zodat het honderden projecten kan beheren zonder vertraging.

#### Acceptance Criteria

1. THE Unified_API SHALL respond to GET /api/projects requests within 200ms for up to 1000 projects
2. THE Unified_API SHALL use database connection pooling with minimum 5 and maximum 20 connections
3. THE Unified_API SHALL implement caching for frequently accessed data with 5 minute TTL
4. THE Background_Worker SHALL process sync jobs in parallel with maximum 10 concurrent jobs
5. THE Dashboard SHALL implement virtual scrolling for project lists exceeding 100 items
6. THE Dashboard SHALL lazy load project detail data on demand
7. THE WebSocket_Connection SHALL use message batching to reduce network overhead

### Requirement 32: Integration Testing

**User Story:** Als een ontwikkelaar wil ik integration tests, zodat ik kan verifiëren dat alle componenten correct samenwerken.

#### Acceptance Criteria

1. THE Superstash_System SHALL provide integration tests for all API endpoints
2. THE Superstash_System SHALL provide integration tests for all Project_Adapters
3. THE Superstash_System SHALL provide integration tests for WebSocket_Connection functionality
4. THE Superstash_System SHALL provide integration tests for Background_Worker jobs
5. WHEN a developer runs npm test, THE Superstash_System SHALL execute all integration tests
6. THE integration tests SHALL use a separate test database
7. THE integration tests SHALL clean up test data after execution

### Requirement 33: API Documentation

**User Story:** Als een API gebruiker wil ik complete API documentatie, zodat ik weet hoe ik de API moet gebruiken.

#### Acceptance Criteria

1. THE Superstash_System SHALL provide OpenAPI/Swagger documentation
2. THE Unified_API SHALL expose /api/docs endpoint serving interactive API documentation
3. THE documentation SHALL include all endpoints with: path, method, parameters, request body, response schema, examples
4. THE documentation SHALL include authentication requirements for each endpoint
5. THE documentation SHALL include error response codes and meanings

### Requirement 34: Deployment Monitoring Integration

**User Story:** Als een DevOps engineer wil ik deployment status kunnen monitoren, zodat ik weet wanneer builds succesvol zijn of falen.

#### Acceptance Criteria

1. THE Unified_API SHALL integrate with Docker deployment events
2. THE Unified_API SHALL integrate with PM2 deployment events
3. THE Unified_API SHALL integrate with Vercel deployment webhooks
4. THE Unified_API SHALL integrate with Netlify deployment webhooks
5. WHEN a deployment completes, THE Unified_API SHALL update the project lastBuild timestamp
6. WHEN a deployment fails, THE Unified_API SHALL update the project status to indicate deployment failure
7. THE Dashboard SHALL display deployment status with visual indicators (success, failed, in progress)

### Requirement 35: Payment Provider Integration

**User Story:** Als een financieel beheerder wil ik integratie met payment providers, zodat ik betalingsdata automatisch kan synchroniseren.

#### Acceptance Criteria

1. THE Unified_API SHALL integrate with Stripe API for payment data
2. THE Unified_API SHALL integrate with PayPal API for payment data
3. THE Unified_API SHALL integrate with Square API for payment data
4. WHEN the Payment_Worker fetches payment data, THE Unified_API SHALL authenticate using API keys from environment variables
5. THE Unified_API SHALL map payment provider data to the UnifiedProject payments field
6. THE Unified_API SHALL handle rate limiting from payment provider APIs with exponential backoff

### Requirement 36: Analytics Provider Integration

**User Story:** Als een marketing manager wil ik integratie met analytics providers, zodat ik gebruikersdata automatisch kan synchroniseren.

#### Acceptance Criteria

1. THE Unified_API SHALL integrate with Google Analytics API for analytics data
2. THE Unified_API SHALL integrate with Matomo API for analytics data
3. THE Unified_API SHALL integrate with Supabase logs for analytics data
4. WHEN the Analytics_Worker fetches analytics data, THE Unified_API SHALL authenticate using API keys from environment variables
5. THE Unified_API SHALL map analytics provider data to the UnifiedProject analytics field
6. THE Unified_API SHALL aggregate analytics from multiple sources for projects using multiple providers

### Requirement 37: Configuration Validation

**User Story:** Als een systeembeheerder wil ik dat configuraties gevalideerd worden, zodat ik direct feedback krijg bij incorrecte configuratie.

#### Acceptance Criteria

1. WHEN the Unified_API starts, THE Unified_API SHALL validate all environment variables
2. WHEN a user adds a project via the Wizard, THE Unified_API SHALL validate the project configuration
3. THE Unified_API SHALL validate that URLs are well-formed
4. THE Unified_API SHALL validate that API keys are non-empty when required
5. THE Unified_API SHALL validate that database connection strings are valid
6. IF validation fails, THEN THE Unified_API SHALL return a descriptive error message with the validation failure

### Requirement 38: Health Check Endpoints

**User Story:** Als een DevOps engineer wil ik health check endpoints, zodat ik de status van het systeem kan monitoren.

#### Acceptance Criteria

1. THE Unified_API SHALL expose GET /health endpoint
2. WHEN /health is called, THE Unified_API SHALL check database connectivity
3. WHEN /health is called, THE Unified_API SHALL check Redis connectivity for Queue_System
4. WHEN all checks pass, THE Unified_API SHALL return HTTP 200 with status "healthy"
5. IF any check fails, THEN THE Unified_API SHALL return HTTP 503 with details of failed checks
6. THE Unified_API SHALL expose GET /health/ready endpoint for Kubernetes readiness probes
7. THE Unified_API SHALL expose GET /health/live endpoint for Kubernetes liveness probes

### Requirement 39: Rate Limiting

**User Story:** Als een systeembeheerder wil ik rate limiting, zodat het systeem beschermd is tegen misbruik en overbelasting.

#### Acceptance Criteria

1. THE Unified_API SHALL implement rate limiting on all public endpoints
2. THE Unified_API SHALL allow maximum 100 requests per minute per IP address
3. THE Unified_API SHALL allow maximum 1000 requests per hour per authenticated user
4. WHEN rate limit is exceeded, THE Unified_API SHALL return HTTP 429 with Retry-After header
5. THE Unified_API SHALL use Redis for distributed rate limiting across multiple instances
6. THE Unified_API SHALL exclude health check endpoints from rate limiting

### Requirement 40: Data Export

**User Story:** Als een dashboard gebruiker wil ik data kunnen exporteren, zodat ik analyses kan doen in externe tools.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an "Export" button on the project list page
2. WHEN the user clicks "Export", THE Dashboard SHALL generate a CSV file with all project data
3. THE Dashboard SHALL include in the export: id, name, type, status, repo, analytics, payments, lastBuild, tags
4. THE Dashboard SHALL provide an "Export" button on the analytics page
5. WHEN the user clicks "Export" on analytics, THE Dashboard SHALL generate a CSV file with time-series analytics data
6. THE Dashboard SHALL trigger browser download of the generated CSV file
