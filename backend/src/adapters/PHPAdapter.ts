/**
 * PHP Adapter
 * 
 * Adapter voor PHP projecten die data exposen via REST endpoints.
 * Gebruikt dezelfde endpoint structuur als NodeAdapter en PythonAdapter.
 */

import { BaseAdapter } from './BaseAdapter';
import { UnifiedProject, AdapterConfig, ProjectType, ProjectStatus } from '../types';
import { AdapterConnectionError } from './IAdapter';

/**
 * PHPAdapter - Adapter voor PHP projecten
 * 
 * Verwacht dat het PHP project de volgende endpoints exposed:
 * - GET /status - Project status en metadata
 * - GET /analytics - Analytics data (users, pageviews, revenue)
 * - GET /payments - Payment data (lastPayment, total)
 */
export class PHPAdapter extends BaseAdapter {
  /**
   * Fetch project data van PHP project
   */
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
    try {
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

      const [statusData, analyticsData, paymentsData] = await Promise.all([
        this.fetchStatus(baseUrl, endpoints.status || '/status', config),
        this.fetchAnalytics(baseUrl, endpoints.analytics || '/analytics', config),
        this.fetchPayments(baseUrl, endpoints.payments || '/payments', config),
      ]);

      return this.transformToUnifiedProject(statusData, analyticsData, paymentsData);
    } catch (error: any) {
      if (error instanceof AdapterConnectionError) {
        return this.handleConnectionFailure(
          config.url || 'unknown',
          'PHP Project',
          error
        );
      }
      throw error;
    }
  }

  private async fetchStatus(baseUrl: string, endpoint: string, config: AdapterConfig): Promise<any> {
    return await this.makeRequest({ method: 'GET', url: `${baseUrl}${endpoint}` }, config);
  }

  private async fetchAnalytics(baseUrl: string, endpoint: string, config: AdapterConfig): Promise<any> {
    try {
      return await this.makeRequest({ method: 'GET', url: `${baseUrl}${endpoint}` }, config);
    } catch (error) {
      this.logError('Analytics fetch failed', error, config);
      return null;
    }
  }

  private async fetchPayments(baseUrl: string, endpoint: string, config: AdapterConfig): Promise<any> {
    try {
      return await this.makeRequest({ method: 'GET', url: `${baseUrl}${endpoint}` }, config);
    } catch (error) {
      this.logError('Payments fetch failed', error, config);
      return null;
    }
  }

  private transformToUnifiedProject(
    statusData: any,
    analyticsData: any,
    paymentsData: any
  ): UnifiedProject {
    const id = statusData.id || statusData.projectId || 'unknown';
    const name = statusData.name || statusData.projectName || 'Unknown Project';
    const type = this.normalizeType(statusData.type);
    const status = this.normalizeStatus(statusData.status);
    const repo = statusData.repo || statusData.repository || undefined;
    const lastBuild = statusData.lastBuild || statusData.lastDeployment || undefined;
    const tags = statusData.tags || [];

    const analytics = analyticsData ? {
      users: analyticsData.users || analyticsData.activeUsers || 0,
      pageviews: analyticsData.pageviews || analyticsData.views || 0,
      revenue: analyticsData.revenue || analyticsData.totalRevenue || undefined,
    } : undefined;

    const payments = paymentsData ? {
      lastPayment: paymentsData.lastPayment || paymentsData.lastTransaction || new Date().toISOString(),
      total: paymentsData.total || paymentsData.totalAmount || 0,
    } : undefined;

    return { id, name, type, status, repo, analytics, payments, lastBuild, tags };
  }

  private normalizeType(type: any): ProjectType {
    const typeStr = String(type || 'service').toLowerCase();
    if (typeStr === 'web' || typeStr === 'website') return ProjectType.WEB;
    if (typeStr === 'app' || typeStr === 'application' || typeStr === 'mobile') return ProjectType.APP;
    return ProjectType.SERVICE;
  }

  private normalizeStatus(status: any): ProjectStatus {
    const statusStr = String(status || 'offline').toLowerCase();
    if (statusStr === 'live' || statusStr === 'production' || statusStr === 'online') return ProjectStatus.LIVE;
    if (statusStr === 'staging' || statusStr === 'development' || statusStr === 'dev') return ProjectStatus.STAGING;
    return ProjectStatus.OFFLINE;
  }

  async validateConfig(config: AdapterConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const baseValidation = await super.validateConfig(config);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];
    if (config.type !== 'php') {
      errors.push('Adapter type moet "php" zijn voor PHPAdapter');
    }
    if (!config.url) {
      errors.push('URL is verplicht voor PHP adapter');
    }
    if (config.url) {
      try {
        new URL(config.url);
      } catch {
        errors.push('URL heeft een ongeldig format');
      }
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }
}
