/**
 * Adapter Manager
 * 
 * Centraal beheer voor alle adapters. Registreert adapters en routeert
 * requests naar de juiste adapter op basis van configuratie.
 */

import { IAdapter } from './IAdapter';
import { NodeAdapter } from './NodeAdapter';
import { PythonAdapter } from './PythonAdapter';
import { PHPAdapter } from './PHPAdapter';
import { RESTAdapter } from './RESTAdapter';
import { DBAdapter } from './DBAdapter';
import { UnifiedProject, AdapterConfig, AdapterType } from '../types';

/**
 * AdapterManager - Centraal adapter management
 * 
 * Beheert alle adapter instanties en routeert requests naar de juiste adapter.
 * Implementeert singleton pattern voor globale toegang.
 */
export class AdapterManager {
  private static instance: AdapterManager;
  private adapters: Map<AdapterType, IAdapter>;

  /**
   * Private constructor voor singleton pattern
   */
  private constructor() {
    this.adapters = new Map();
    this.registerDefaultAdapters();
  }

  /**
   * Haal de singleton instantie op
   */
  public static getInstance(): AdapterManager {
    if (!AdapterManager.instance) {
      AdapterManager.instance = new AdapterManager();
    }
    return AdapterManager.instance;
  }

  /**
   * Registreer alle standaard adapters
   * 
   * Wordt automatisch aangeroepen bij instantiatie.
   */
  private registerDefaultAdapters(): void {
    this.registerAdapter(AdapterType.NODE, new NodeAdapter());
    this.registerAdapter(AdapterType.PYTHON, new PythonAdapter());
    this.registerAdapter(AdapterType.PHP, new PHPAdapter());
    this.registerAdapter(AdapterType.REST, new RESTAdapter());
    this.registerAdapter(AdapterType.DB, new DBAdapter());
  }

  /**
   * Registreer een adapter
   * 
   * Voegt een adapter toe aan de registry. Kan gebruikt worden om
   * custom adapters te registreren.
   * 
   * @param type - Adapter type
   * @param adapter - Adapter instantie
   */
  public registerAdapter(type: AdapterType, adapter: IAdapter): void {
    this.adapters.set(type, adapter);
    console.log(`[AdapterManager] Registered adapter: ${type}`);
  }

  /**
   * Haal een adapter op op basis van type
   * 
   * @param type - Adapter type
   * @returns IAdapter instantie
   * @throws Error als adapter niet gevonden
   */
  public getAdapter(type: AdapterType): IAdapter {
    const adapter = this.adapters.get(type);
    
    if (!adapter) {
      throw new Error(`Adapter niet gevonden voor type: ${type}`);
    }

    return adapter;
  }

  /**
   * Fetch project data met de juiste adapter
   * 
   * Selecteert automatisch de juiste adapter op basis van de configuratie
   * en fetcht de project data.
   * 
   * @param config - Adapter configuratie
   * @returns Promise<UnifiedProject> - Genormaliseerde project data
   */
  public async fetchProject(config: AdapterConfig): Promise<UnifiedProject> {
    const adapter = this.getAdapter(config.type);
    
    console.log(`[AdapterManager] Fetching project with ${config.type} adapter`);
    
    return await adapter.fetchProjectData(config);
  }

  /**
   * Valideer project configuratie
   * 
   * Valideert de configuratie met de juiste adapter.
   * 
   * @param config - Te valideren configuratie
   * @returns Promise<{ valid: boolean; errors?: string[] }>
   */
  public async validateProject(config: AdapterConfig): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const adapter = this.getAdapter(config.type);
      return await adapter.validateConfig(config);
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Test project connectie
   * 
   * Test de connectie met het project zonder volledige data fetch.
   * Gebruikt voor de wizard "Test Connection" functionaliteit.
   * 
   * @param config - Adapter configuratie
   * @returns Promise<boolean> - true als connectie succesvol
   */
  public async testProject(config: AdapterConfig): Promise<boolean> {
    try {
      const adapter = this.getAdapter(config.type);
      return await adapter.testConnection(config);
    } catch (error: any) {
      console.error(`[AdapterManager] Connection test failed:`, error.message);
      return false;
    }
  }

  /**
   * Haal alle geregistreerde adapter types op
   * 
   * @returns Array van adapter types
   */
  public getRegisteredAdapterTypes(): AdapterType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check of een adapter type geregistreerd is
   * 
   * @param type - Adapter type om te checken
   * @returns boolean - true als adapter geregistreerd is
   */
  public hasAdapter(type: AdapterType): boolean {
    return this.adapters.has(type);
  }

  /**
   * Verwijder een adapter uit de registry
   * 
   * Kan gebruikt worden om adapters dynamisch te verwijderen.
   * 
   * @param type - Adapter type om te verwijderen
   * @returns boolean - true als adapter verwijderd, false als niet gevonden
   */
  public unregisterAdapter(type: AdapterType): boolean {
    const existed = this.adapters.has(type);
    this.adapters.delete(type);
    
    if (existed) {
      console.log(`[AdapterManager] Unregistered adapter: ${type}`);
    }
    
    return existed;
  }

  /**
   * Reset de adapter manager
   * 
   * Verwijdert alle adapters en registreert de standaard adapters opnieuw.
   * Gebruikt voor testing.
   */
  public reset(): void {
    this.adapters.clear();
    this.registerDefaultAdapters();
    console.log('[AdapterManager] Reset to default adapters');
  }
}

/**
 * Exporteer singleton instantie voor gemakkelijke toegang
 */
export const adapterManager = AdapterManager.getInstance();
