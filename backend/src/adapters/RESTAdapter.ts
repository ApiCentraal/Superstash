/**
 * REST Adapter
 * 
 * Generieke adapter voor REST APIs met custom field mapping.
 * Ondersteunt verschillende authenticatie methoden (API Key, Bearer, Basic).
 */

import { BaseAdapter } from './BaseAdapter';
import { UnifiedProject, AdapterConfig, ProjectType, ProjectStatus } from '../types';
import { AdapterConnectionError } from './IAdapter';

/**
 * RESTAdapter - Generieke adapter voor REST APIs
 * 
 * Gebruikt custom field mapping om willekeurige API responses
 * te transformeren naar UnifiedProject format.
 */
export class RESTAdapter extends BaseAdapter {
  /**
   * Fetch project data van REST API
   * 
   * Gebruikt de geconfigureerde endpoint en past field mapping toe
   * om de response te transformeren naar UnifiedProject format.
   */
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
    try {
      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Ongeldige configuratie: ${validation.errors?.join(', ')}`);
      }

      const baseUrl = config.url!;
      const endpoint = config.endpoints?.status || '/';

      // Fetch data van custom endpoint
      const data = await this.makeRequest(
        {
          method: 'GET',
          url: `${baseUrl}${endpoint}`,
        },
        config
      );

      // Pas field mapping toe
      const mappedData = this.applyFieldMapping(data, config.fieldMapping || {});

      // Transformeer naar UnifiedProject
      return this.transformToUnifiedProject(mappedData);
    } catch (error: any) {
      if (error instanceof AdapterConnectionError) {
        return this.handleConnectionFailure(
          config.url || 'unknown',
          'REST API',
          error
        );
      }
      throw error;
    }
  }

  /**
   * Pas field mapping toe op API response
   * 
   * Transformeert velden van de API response naar UnifiedProject velden
   * op basis van de geconfigureerde mapping.
   * 
   * Voorbeeld mapping:
   * {
   *   "project_id": "id",
   *   "project_name": "name",
   *   "project_type": "type",
   *   "current_status": "status"
   * }
   * 
   * @param data - Originele API response
   * @param fieldMapping - Mapping van source velden naar target velden
   * @returns Gemapte data object
   */
  applyFieldMapping(data: any, fieldMapping: Record<string, string>): any {
    const mapped: any = {};

    // Itereer over alle mapping entries
    for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
      // Haal waarde op van source field (ondersteunt nested paths met dot notation)
      const value = this.getNestedValue(data, sourceField);
      
      if (value !== undefined) {
        // Zet waarde op target field (ondersteunt nested paths met dot notation)
        this.setNestedValue(mapped, targetField, value);
      }
    }

    // Kopieer ook alle niet-gemapte velden voor fallback
    for (const [key, value] of Object.entries(data)) {
      if (!fieldMapping[key] && mapped[key] === undefined) {
        mapped[key] = value;
      }
    }

    return mapped;
  }

  /**
   * Haal nested waarde op met dot notation
   * 
   * Voorbeeld: getNestedValue({ user: { name: "John" } }, "user.name") => "John"
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Zet nested waarde met dot notation
   * 
   * Voorbeeld: setNestedValue({}, "user.name", "John") => { user: { name: "John" } }
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === undefined) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Transformeer gemapte data naar UnifiedProject format
   */
  private transformToUnifiedProject(data: any): UnifiedProject {
    const id = data.id || data.projectId || data.project_id || 'unknown';
    const name = data.name || data.projectName || data.project_name || 'Unknown Project';
    const type = this.normalizeType(data.type || data.projectType || data.project_type);
    const status = this.normalizeStatus(data.status || data.projectStatus || data.project_status);
    const repo = data.repo || data.repository || undefined;
    const lastBuild = data.lastBuild || data.last_build || data.lastDeployment || undefined;
    const tags = data.tags || [];

    // Extract analytics data (kan nested zijn)
    const analyticsData = data.analytics || data;
    const analytics = (analyticsData.users !== undefined || analyticsData.pageviews !== undefined) ? {
      users: analyticsData.users || analyticsData.activeUsers || analyticsData.active_users || 0,
      pageviews: analyticsData.pageviews || analyticsData.views || 0,
      revenue: analyticsData.revenue || analyticsData.totalRevenue || analyticsData.total_revenue || undefined,
    } : undefined;

    // Extract payments data (kan nested zijn)
    const paymentsData = data.payments || data;
    const payments = (paymentsData.lastPayment !== undefined || paymentsData.total !== undefined) ? {
      lastPayment: paymentsData.lastPayment || paymentsData.last_payment || paymentsData.lastTransaction || new Date().toISOString(),
      total: paymentsData.total || paymentsData.totalAmount || paymentsData.total_amount || 0,
    } : undefined;

    return { id, name, type, status, repo, analytics, payments, lastBuild, tags };
  }

  /**
   * Normaliseer project type
   */
  private normalizeType(type: any): ProjectType {
    const typeStr = String(type || 'service').toLowerCase();
    if (typeStr === 'web' || typeStr === 'website') return ProjectType.WEB;
    if (typeStr === 'app' || typeStr === 'application' || typeStr === 'mobile') return ProjectType.APP;
    return ProjectType.SERVICE;
  }

  /**
   * Normaliseer project status
   */
  private normalizeStatus(status: any): ProjectStatus {
    const statusStr = String(status || 'offline').toLowerCase();
    if (statusStr === 'live' || statusStr === 'production' || statusStr === 'online') return ProjectStatus.LIVE;
    if (statusStr === 'staging' || statusStr === 'development' || statusStr === 'dev') return ProjectStatus.STAGING;
    return ProjectStatus.OFFLINE;
  }

  /**
   * Valideer REST adapter configuratie
   */
  async validateConfig(config: AdapterConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const baseValidation = await super.validateConfig(config);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];

    if (config.type !== 'rest') {
      errors.push('Adapter type moet "rest" zijn voor RESTAdapter');
    }

    if (!config.url) {
      errors.push('URL is verplicht voor REST adapter');
    }

    // Valideer URL format
    if (config.url) {
      try {
        new URL(config.url);
      } catch {
        errors.push('URL heeft een ongeldig format');
      }
    }

    // Valideer authentication configuratie indien aanwezig
    if (config.auth) {
      if (!['apiKey', 'bearer', 'basic'].includes(config.auth.type)) {
        errors.push('Auth type moet "apiKey", "bearer" of "basic" zijn');
      }

      if (!config.auth.credentials) {
        errors.push('Auth credentials zijn verplicht wanneer auth is geconfigureerd');
      }
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  /**
   * Test connectie met REST API
   * 
   * Voert een GET request uit naar de geconfigureerde endpoint
   * om te verifiëren dat de API bereikbaar is en authenticatie werkt.
   */
  async testConnection(config: AdapterConfig): Promise<boolean> {
    try {
      if (!config.url) {
        return false;
      }

      const endpoint = config.endpoints?.status || '/';
      const response = await this.makeRequest(
        {
          method: 'GET',
          url: `${config.url}${endpoint}`,
          timeout: 5000, // Kortere timeout voor connection test
        },
        config
      );

      // Als we een response krijgen zonder error, is de connectie succesvol
      return response !== null && response !== undefined;
    } catch (error) {
      this.logError('Connection test failed', error, config);
      return false;
    }
  }
}
