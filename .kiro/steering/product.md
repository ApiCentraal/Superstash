# Product Overview

## Superstash: Central Application Manager

**Purpose:** A unified dashboard that centralizes management of all projects, sites, apps, repositories, payments, analytics, and deployments across multiple technologies and platforms.

## Core Value Proposition

- **Single pane of glass** for all projects regardless of technology stack
- **Plug-and-play connectors** for existing projects without code changes
- **Real-time and event-driven** updates across all integrated systems
- **Modular and extensible** architecture for future SaaS integrations
- **Multi-user, team-ready** with SSO capabilities

## Key Features

1. **Unified Project View** - All projects displayed in a consistent format
2. **Project Adapters** - Connect Node.js, Python, PHP, REST APIs, and databases
3. **Real-time Sync** - Webhook listeners and periodic polling for data updates
4. **Analytics Aggregation** - Centralized metrics from multiple sources
5. **Payment Management** - Unified payment and subscription tracking
6. **Deployment Monitoring** - Build and deployment status tracking
7. **Plug-and-Play Wizard** - Add projects without writing code

## Target Users

- Development teams managing multiple projects
- SaaS platforms needing centralized monitoring
- Organizations with heterogeneous tech stacks
- Teams requiring multi-user access and role-based permissions

## Data Model

All projects normalize to a unified schema:

```typescript
type UnifiedProject = {
  id: string;
  name: string;
  type: 'web' | 'app' | 'service';
  status: 'live' | 'staging' | 'offline';
  repo?: string;
  analytics?: { users: number; pageviews: number; revenue?: number };
  payments?: { lastPayment: string; total: number };
  lastBuild?: string;
  tags?: string[];
};
```

This schema ensures consistency across all project types and data sources.
