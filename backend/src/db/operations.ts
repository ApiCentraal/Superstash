/**
 * Database CRUD Operaties
 * 
 * Dit bestand bevat alle database operaties voor projecten met referential integrity checks.
 * Alle functies zijn gedocumenteerd in het Nederlands.
 */

import prisma from './prisma';
import { Project, ProjectConfig, Prisma } from '@prisma/client';
import { UnifiedProject, AdapterConfig } from '../types';

/**
 * Converteer Prisma Project naar UnifiedProject format
 * 
 * @param project - Prisma project object met relaties
 * @returns UnifiedProject object
 */
function toUnifiedProject(project: Project & { 
  config?: ProjectConfig | null;
  analytics?: any[];
  payments?: any[];
}): UnifiedProject {
  // Haal de meest recente analytics en payment data op
  const latestAnalytics = project.analytics?.[0];
  const latestPayment = project.payments?.[0];
  
  return {
    id: project.id,
    name: project.name,
    type: project.type as 'web' | 'app' | 'service',
    status: project.status as 'live' | 'staging' | 'offline',
    repo: project.repo || undefined,
    analytics: latestAnalytics ? {
      users: latestAnalytics.users,
      pageviews: latestAnalytics.pageviews,
      revenue: latestAnalytics.revenue || undefined,
    } : undefined,
    payments: latestPayment ? {
      lastPayment: latestPayment.transactionDate.toISOString(),
      total: latestPayment.amount,
    } : undefined,
    lastBuild: project.lastBuild?.toISOString() || undefined,
    tags: project.tags,
  };
}

/**
 * Maak een nieuw project aan in de database
 * 
 * Creëert een project met bijbehorende configuratie en valideert referential integrity.
 * 
 * @param data - Project data inclusief naam, type, config en optionele velden
 * @returns Promise<UnifiedProject> - Het aangemaakte project
 * @throws Error als teamId niet bestaat of data invalid is
 */
export async function createProject(data: {
  name: string;
  type: 'web' | 'app' | 'service';
  config: AdapterConfig;
  tags?: string[];
  teamId?: string;
  repo?: string;
}): Promise<UnifiedProject> {
  // Valideer team bestaat als teamId is opgegeven
  if (data.teamId) {
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
    });
    
    if (!team) {
      throw new Error(`Team met ID ${data.teamId} bestaat niet`);
    }
  }

  // Maak project aan met config in een transactie
  const project = await prisma.project.create({
    data: {
      name: data.name,
      type: data.type,
      status: 'offline', // Default status
      repo: data.repo,
      tags: data.tags || [],
      teamId: data.teamId,
      config: {
        create: {
          adapterType: data.config.type,
          url: data.config.url,
          endpoints: data.config.endpoints as Prisma.JsonValue,
          auth: data.config.auth as Prisma.JsonValue,
          dbConfig: data.config.dbConfig as Prisma.JsonValue,
          fieldMapping: data.config.fieldMapping as Prisma.JsonValue,
        },
      },
    },
    include: {
      config: true,
      analytics: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
      payments: {
        orderBy: { transactionDate: 'desc' },
        take: 1,
      },
    },
  });

  return toUnifiedProject(project);
}

/**
 * Haal een project op uit de database
 * 
 * @param id - Project ID
 * @returns Promise<UnifiedProject | null> - Het project of null als niet gevonden
 */
export async function getProject(id: string): Promise<UnifiedProject | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      config: true,
      analytics: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
      payments: {
        orderBy: { transactionDate: 'desc' },
        take: 1,
      },
    },
  });

  if (!project) {
    return null;
  }

  return toUnifiedProject(project);
}

/**
 * Haal alle projecten op met optionele filtering
 * 
 * @param filters - Optionele filters voor type, status, teamId
 * @param pagination - Optionele paginatie parameters
 * @returns Promise<UnifiedProject[]> - Lijst van projecten
 */
export async function getProjects(
  filters?: {
    type?: 'web' | 'app' | 'service';
    status?: 'live' | 'staging' | 'offline';
    teamId?: string;
    search?: string;
  },
  pagination?: {
    skip?: number;
    take?: number;
  }
): Promise<{ projects: UnifiedProject[]; total: number }> {
  const where: Prisma.ProjectWhereInput = {};

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.teamId) {
    where.teamId = filters.teamId;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { tags: { has: filters.search } },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        config: true,
        analytics: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        payments: {
          orderBy: { transactionDate: 'desc' },
          take: 1,
        },
      },
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects: projects.map(toUnifiedProject),
    total,
  };
}

/**
 * Update een bestaand project
 * 
 * @param id - Project ID
 * @param data - Te updaten velden
 * @returns Promise<UnifiedProject> - Het geüpdatete project
 * @throws Error als project niet bestaat of teamId invalid is
 */
export async function updateProject(
  id: string,
  data: {
    name?: string;
    type?: 'web' | 'app' | 'service';
    status?: 'live' | 'staging' | 'offline';
    repo?: string;
    tags?: string[];
    teamId?: string;
    lastBuild?: Date;
    config?: AdapterConfig;
  }
): Promise<UnifiedProject> {
  // Valideer project bestaat
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    throw new Error(`Project met ID ${id} bestaat niet`);
  }

  // Valideer team bestaat als teamId is opgegeven
  if (data.teamId) {
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
    });
    
    if (!team) {
      throw new Error(`Team met ID ${data.teamId} bestaat niet`);
    }
  }

  // Update project en optioneel config
  const updateData: Prisma.ProjectUpdateInput = {
    name: data.name,
    type: data.type,
    status: data.status,
    repo: data.repo,
    tags: data.tags,
    teamId: data.teamId,
    lastBuild: data.lastBuild,
  };

  // Update config als opgegeven
  if (data.config) {
    updateData.config = {
      update: {
        adapterType: data.config.type,
        url: data.config.url,
        endpoints: data.config.endpoints as Prisma.JsonValue,
        auth: data.config.auth as Prisma.JsonValue,
        dbConfig: data.config.dbConfig as Prisma.JsonValue,
        fieldMapping: data.config.fieldMapping as Prisma.JsonValue,
      },
    };
  }

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      config: true,
      analytics: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
      payments: {
        orderBy: { transactionDate: 'desc' },
        take: 1,
      },
    },
  });

  return toUnifiedProject(project);
}

/**
 * Verwijder een project uit de database
 * 
 * Verwijdert het project en alle gerelateerde data (cascade delete).
 * Referential integrity wordt gehandhaafd door Prisma.
 * 
 * @param id - Project ID
 * @returns Promise<void>
 * @throws Error als project niet bestaat
 */
export async function deleteProject(id: string): Promise<void> {
  // Valideer project bestaat
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    throw new Error(`Project met ID ${id} bestaat niet`);
  }

  // Delete project (cascade delete zorgt voor gerelateerde data)
  await prisma.project.delete({
    where: { id },
  });
}

/**
 * Maak of update analytics data voor een project
 * 
 * @param projectId - Project ID
 * @param data - Analytics data (users, pageviews, revenue)
 * @returns Promise<void>
 */
export async function upsertAnalytics(
  projectId: string,
  data: {
    users: number;
    pageviews: number;
    revenue?: number;
  }
): Promise<void> {
  await prisma.analytics.create({
    data: {
      projectId,
      users: data.users,
      pageviews: data.pageviews,
      revenue: data.revenue,
      timestamp: new Date(),
    },
  });
}

/**
 * Maak een payment record aan voor een project
 * 
 * @param projectId - Project ID
 * @param data - Payment data
 * @returns Promise<void>
 */
export async function createPayment(
  projectId: string,
  data: {
    amount: number;
    provider: string;
    status: string;
    transactionId: string;
    transactionDate: Date;
  }
): Promise<void> {
  await prisma.payment.create({
    data: {
      projectId,
      amount: data.amount,
      provider: data.provider,
      status: data.status,
      transactionId: data.transactionId,
      transactionDate: data.transactionDate,
    },
  });
}
