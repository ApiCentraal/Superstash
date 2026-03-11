/**
 * Node.js Adapter
 * 
 * Adapter voor Node.js projecten die data exposen via REST endpoints.
 * Fetcht data van /status, /analytics en /payments endpoints.
 */

import { BaseAdapter } from './BaseAdapter';
import { UnifiedProject, AdapterConfig, ProjectType, ProjectStatus } from '../types';
import { AdapterConnectionError } from './IAdapter';

/**
 * NodeAdapter - Adapter voor Node.js projecten
 * 
 * Verwacht dat het Node.js project de volgende endpoints exposed:
 * - GET /status - Project status en metadata
 * - GET /analytics - Analytics data (users, pageviews, revenue)
 * - GET /payments - Payment data (lastPayment, total)
 */
export class NodeAdapter extends BaseAdapter {
  /**
   * Fetch project data van Node.js project
   * 
   * Haalt data op van de geconfigureerde endpoints en transformeert
   * het naar UnifiedProject format.
   * 
   * @param config - Adapter configuratie met URL en endpoints
   * @returns Promise<UnifiedProject> - Genormaliseerde project data
   */
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
    try {
      // Valideer configuratie
      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Ongeldige configuratie: ${validation.errors?.join(', ')}`);
      }

      const baseUrl = config.url!;
      const endpoints = config.endpoints || {
        status: '/status',
        analytics: '/analytics',
        payments: '/payments',
      };

      // Fetch data van alle endpoints parallel
      const [statusData, analyticsData, paymentsData] = await Promise.all([
        this.fetchStatus(baseUrl, endpoints.status || '/status', config),
        this.fetchAnalytics(baseUrl, endpoints.analytics || '/analytics', config),
        this.fetchPayments(baseUrl, endpoints.payments || '/payments', config),
      ]);

      // Transformeer naar UnifiedProject format
      return this.transformToUnifiedProject(statusData, analyticsData, paymentsData);
    } catch (error: any) {
      // Bij connection failures, return offline status
      if (error instanceof AdapterConnectionError) {
        return this.handleConnectionFailure(
          config.url || 'unknown',
          'Node.js Project',
          error
        );
      }
      throw error;
    }
  }

  /**
   * Fetch status data van /status endpoint
   */
  private async fetchStatus(
    baseUrl: string,
    endpoint: string,
    config: AdapterConfig
  ): Promise<any> {
    try {
      return await this.makeRequest(
        {
          method: 'GET',
          url: `${baseUrl}${endpoint}`,
        },
        config
      );
    } catch (error) {
      // Status endpoint is kritiek, throw error
      throw error;
    }
  }

  /**
   * Fetch analytics data van /analytics endpoint
   */
  private async fetchAnalytics(
    baseUrl: string,
    endpoint: string,
    config: AdapterConfig
  ): Promise<any> {
    try {
      return await this.makeRequest(
        {
          method: 'GET',
          url: `${baseUrl}${endpoint}`,
        },
        config
      );
    } catch (error) {
      // Analytics is optioneel, return null bij failure
      this.logError('Analytics fetch failed', error, config);
      return null;
    }
  }

  /**
   * Fetch payments data van /payments endpoint
   */
  private async fetchPayments(
    baseUrl: string,
    endpoint: string,
    config: AdapterConfig
  ): Promise<any> {
    try {
      return await this.makeRequest(
        {
          method: 'GET',
          url: `${baseUrl}${endpoint}`,
        },
        config
      );
    } catch (error) {
      // Payments is optioneel, return null bij failure
      this.logError('Payments fetch failed', error, config);
      return null;
    }
  }

  /**
   * Transformeer fetched data naar UnifiedProject format
   */
  private transformToUnifiedProject(
    statusData: any,
    analyticsData: any,
    paymentsData: any
  ): UnifiedProject {
    // Extract data met fallbacks
    const id = statusData.id || statusData.projectId || 'unknown';
    const name = statusData.name || statusData.projectName || 'Unknown Project';
    const type = this.normalizeType(statusData.type);
    const status = this.normalizeStatus(statusData.status);
    const repo = statusData.repo || statusData.repository || undefined;
    const lastBuild = statusData.lastBuild || statusData.lastDeployment || undefined;
    const tags = statusData.tags || [];

    // Extract analytics data
    const analytics = analyticsData ? {
      users: analyticsData.users || analyticsData.activeUsers || 0,
      pageviews: analyticsData.pageviews || analyticsData.views || 0,
      revenue: analyticsData.revenue || analyticsData.totalRevenue || undefined,
    } : undefined;

    // Extract payments data
    const payments = paymentsData ? {
      lastPayment: paymentsData.lastPayment || paymentsData.lastTransaction || new Date().toISOString(),
      total: paymentsData.total || paymentsData.totalAmount || 0,
    } : undefined;

    return {
      id,
      name,
      type,
      status,
      repo,
      analytics,
      payments,
      lastBuild,
      tags,
    };
  }

  /**
   * Normaliseer project type naar UnifiedProject enum
   */
  private normalizeType(type: any): ProjectType {
    const typeStr = String(type || 'service').toLowerCase();
    
    if (typeStr === 'web' || typeStr === 'website') {
      return ProjectType.WEB;
    }
    if (typeStr === 'app' || typeStr === 'application' || typeStr === 'mobile') {
      return ProjectType.APP;
    }
    return ProjectType.SERVICE;
  }

  /**
   * Normaliseer project status naar UnifiedProject enum
   */
  private normalizeStatus(status: any): ProjectStatus {
    const statusStr = String(status || 'offline').toLowerCase();
    
    if (statusStr === 'live' || statusStr === 'production' || statusStr === 'online') {
      return ProjectStatus.LIVE;
    }
    if (statusStr === 'staging' || statusStr === 'development' || statusStr === 'dev') {
      return ProjectStatus.STAGING;
    }
    return ProjectStatus.OFFLINE;
  }

  /**
   * Valideer Node.js adapter configuratie
   */
  async validateConfig(config: AdapterConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const baseValidation = await super.validateConfig(config);
    
    if (!baseValidation.valid) {
      return baseValidation;
    }

    const errors: string[] = [];

    if (config.type !== 'node') {
      errors.push('Adapter type moet "node" zijn voor NodeAdapter');
    }

    if (!config.url) {
      errors.push('URL is verplicht voor Node.js adapter');
    }

    // Valideer URL format
    if (config.url) {
      try {
        new URL(config.url);
      } catch {
        errors.push('URL heeft een ongeldig format');
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
