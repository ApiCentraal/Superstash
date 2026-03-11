/**
 * IAdapter Interface
 * 
 * Definieert de interface die alle adapters moeten implementeren.
 * Zorgt voor consistente API over alle adapter types (Node, Python, PHP, REST, DB).
 */

import { UnifiedProject, AdapterConfig } from '../types';

/**
 * Adapter Interface
 * 
 * Alle adapters moeten deze interface implementeren om project data
 * te kunnen fetchen en transformeren naar het UnifiedProject schema.
 */
export interface IAdapter {
  /**
   * Fetch project data van de externe bron
   * 
   * Haalt data op van het project en transformeert het naar UnifiedProject format.
   * Bij connection failures wordt de status op 'offline' gezet.
   * 
   * @param config - Adapter configuratie met URL, endpoints, auth, etc.
   * @returns Promise<UnifiedProject> - Genormaliseerde project data
   * @throws Error bij timeout (>30s) of andere kritieke fouten
   */
  fetchProjectData(config: AdapterConfig): Promise<UnifiedProject>;

  /**
   * Valideer adapter configuratie
   * 
   * Controleert of de configuratie alle benodigde velden bevat
   * en of de waarden geldig zijn.
   * 
   * @param config - Te valideren configuratie
   * @returns Promise<{ valid: boolean; errors?: string[] }> - Validatie resultaat
   */
  validateConfig(config: AdapterConfig): Promise<{ valid: boolean; errors?: string[] }>;

  /**
   * Test connectie met het project
   * 
   * Voert een simpele connectie test uit zonder volledige data fetch.
   * Gebruikt voor de wizard "Test Connection" functionaliteit.
   * 
   * @param config - Adapter configuratie
   * @returns Promise<boolean> - true als connectie succesvol, false bij failure
   */
  testConnection(config: AdapterConfig): Promise<boolean>;
}

/**
 * Adapter Error Types
 * 
 * Specifieke error types voor verschillende adapter failures.
 */

export class AdapterConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterConnectionError';
  }
}

export class AdapterTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterTimeoutError';
  }
}

export class AdapterValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message);
    this.name = 'AdapterValidationError';
  }
}

export class AdapterAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterAuthenticationError';
  }
}
