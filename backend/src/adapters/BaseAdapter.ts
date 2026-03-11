/**
 * Base Adapter Class
 * 
 * Bevat gedeelde functionaliteit voor alle adapters zoals error handling,
 * timeout management en logging.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  IAdapter, 
  AdapterConnectionError, 
  AdapterTimeoutError,
  AdapterAuthenticationError 
} from './IAdapter';
import { AdapterConfig } from '../types';

/**
 * BaseAdapter - Abstract base class voor alle adapters
 * 
 * Implementeert gemeenschappelijke functionaliteit zoals:
 * - HTTP client met timeout (30 seconden)
 * - Error handling en logging
 * - Connection failure handling
 */
export abstract class BaseAdapter implements IAdapter {
  protected readonly timeout: number = 30000; // 30 seconden
  protected axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: this.timeout,
      validateStatus: (status) => status < 500, // Accepteer alle status codes < 500
    });
  }

  /**
   * Abstract method - moet geïmplementeerd worden door subclasses
   */
  abstract fetchProjectData(config: AdapterConfig): Promise<any>;

  /**
   * Valideer adapter configuratie
   * 
   * Base implementatie controleert op required velden.
   * Subclasses kunnen deze method overriden voor specifieke validatie.
   */
  async validateConfig(config: AdapterConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];

    if (!config.type) {
      errors.push('Adapter type is verplicht');
    }

    if (!config.url && config.type !== 'db') {
      errors.push('URL is verplicht voor niet-database adapters');
    }

    if (config.type === 'db' && !config.dbConfig) {
      errors.push('Database configuratie is verplicht voor database adapter');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Test connectie met het project
   * 
   * Voert een simpele HEAD request uit om connectie te testen.
   */
  async testConnection(config: AdapterConfig): Promise<boolean> {
    try {
      if (!config.url) {
        return false;
      }

      const response = await this.axiosInstance.head(config.url, {
        timeout: 5000, // Kortere timeout voor connection test
      });

      return response.status < 400;
    } catch (error) {
      this.logError('Connection test failed', error, config);
      return false;
    }
  }

  /**
   * Maak HTTP request met error handling
   * 
   * Wrapper rond axios met automatische error handling en logging.
   * 
   * @param config - Axios request configuratie
   * @param adapterConfig - Adapter configuratie voor logging
   * @returns Promise<any> - Response data
   * @throws AdapterTimeoutError bij timeout
   * @throws AdapterConnectionError bij connection failures
   * @throws AdapterAuthenticationError bij auth failures
   */
  protected async makeRequest(
    config: AxiosRequestConfig,
    adapterConfig: AdapterConfig
  ): Promise<any> {
    try {
      // Voeg authentication headers toe indien geconfigureerd
      if (adapterConfig.auth) {
        config.headers = config.headers || {};
        
        switch (adapterConfig.auth.type) {
          case 'apiKey':
            config.headers['X-API-Key'] = adapterConfig.auth.credentials;
            break;
          case 'bearer':
            config.headers['Authorization'] = `Bearer ${adapterConfig.auth.credentials}`;
            break;
          case 'basic':
            config.headers['Authorization'] = `Basic ${adapterConfig.auth.credentials}`;
            break;
        }
      }

      const response = await this.axiosInstance.request(config);

      // Check voor authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new AdapterAuthenticationError(
          `Authenticatie gefaald: ${response.status} ${response.statusText}`
        );
      }

      return response.data;
    } catch (error: any) {
      // Handle verschillende error types
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        this.logError('Request timeout', error, adapterConfig);
        throw new AdapterTimeoutError(
          `Request timeout na ${this.timeout}ms voor ${config.url}`
        );
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        this.logError('Connection refused', error, adapterConfig);
        throw new AdapterConnectionError(
          `Kan geen verbinding maken met ${config.url}: ${error.message}`
        );
      }

      if (error instanceof AdapterAuthenticationError) {
        this.logError('Authentication failed', error, adapterConfig);
        throw error;
      }

      // Generic error
      this.logError('Request failed', error, adapterConfig);
      throw new AdapterConnectionError(
        `Request gefaald: ${error.message}`
      );
    }
  }

  /**
   * Log error met context
   * 
   * Logt errors met adapter type en configuratie voor debugging.
   * In productie zou dit naar een logging service gaan (Winston, etc.)
   */
  protected logError(message: string, error: any, config: AdapterConfig): void {
    console.error(`[${config.type.toUpperCase()} Adapter] ${message}:`, {
      error: error.message || error,
      url: config.url,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle connection failure
   * 
   * Returned een UnifiedProject met status 'offline' bij connection failures.
   * Dit voorkomt dat één failing project de hele sync blokkeert.
   */
  protected handleConnectionFailure(
    projectId: string,
    projectName: string,
    error: Error
  ): any {
    console.warn(`Project ${projectName} (${projectId}) is offline:`, error.message);
    
    return {
      id: projectId,
      name: projectName,
      type: 'service',
      status: 'offline',
      tags: ['connection-failed'],
    };
  }
}
