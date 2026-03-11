/**
 * Python Adapter
 * 
 * Adapter voor Python projecten (Flask, FastAPI, Django) die data exposen via REST endpoints.
 * Gebruikt dezelfde endpoint structuur als NodeAdapter.
 */

import { BaseAdapter } from './BaseAdapter';
import { UnifiedProject, AdapterConfig, ProjectType, ProjectStatus } from '../types';
import { AdapterConnectionError } from './IAdapter';

/**
 * PythonAdapter - Adapter voor Python projecten
 * 
 * Verwacht dat het Python project de volgende endpoints exposed:
 * - GET /status - Project status en metadata
 * - GET /analytics - Analytics data (users, pageviews, revenue)
 * - GET /payments - Payment data (lastPayment, total)
 */
export class PythonAdapter extends BaseAdapter {
  /**
   * Fetch project data van Python project
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
          'Python Project',
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
    const id = statusData.id || statusData.project_id || 'unknown';
    const name = statusData.name || statusData.project_name || 'Unknown Project';
    const type = this.normalizeType(statusData.type);
    const status = this.normalizeStatus(statusData.status);
    const repo = statusData.repo || statusData.repository || undefined;
    const lastBuild = statusData.last_build || statusData.last_deployment || undefined;
    const tags = statusData.tags || [];

    const analytics = analyticsData ? {
      users: analyticsData.users || analyticsData.active_users || 0,
      pageviews: analyticsData.pageviews || analyticsData.views || 0,
      revenue: analyticsData.revenue || analyticsData.total_revenue || undefined,
    } : undefined;

    const payments = paymentsData ? {
      lastPayment: paymentsData.last_payment || paymentsData.last_transaction || new Date().toISOString(),
      total: paymentsData.total || paymentsData.total_amount || 0,
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
    if (config.type !== 'python') {
      errors.push('Adapter type moet "python" zijn voor PythonAdapter');
    }
    if (!config.url) {
      errors.push('URL is verplicht voor Python adapter');
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
