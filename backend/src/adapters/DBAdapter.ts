/**
 * Database Adapter
 * 
 * Adapter voor directe database connecties (PostgreSQL, MySQL, MongoDB).
 * Gebruikt connection pooling en voert custom queries uit.
 */

import { BaseAdapter } from './BaseAdapter';
import { UnifiedProject, AdapterConfig, ProjectType, ProjectStatus } from '../types';
import { AdapterConnectionError } from './IAdapter';
import { Pool as PgPool } from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

/**
 * DBAdapter - Adapter voor database connecties
 * 
 * Ondersteunt PostgreSQL, MySQL en MongoDB met connection pooling.
 * Voert custom queries uit en mapt resultaten naar UnifiedProject format.
 */
export class DBAdapter extends BaseAdapter {
  private pgPool?: PgPool;
  private mysqlPool?: mysql.Pool;
  private mongoClient?: MongoClient;

  /**
   * Fetch project data van database
   * 
   * Voert de geconfigureerde query uit en transformeert het resultaat
   * naar UnifiedProject format.
   */
  async fetchProjectData(config: AdapterConfig): Promise<UnifiedProject> {
    try {
      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Ongeldige configuratie: ${validation.errors?.join(', ')}`);
      }

      if (!config.dbConfig) {
        throw new Error('Database configuratie is verplicht');
      }

      // Voer query uit op basis van database type
      const result = await this.executeQuery(config);

      // Transformeer resultaat naar UnifiedProject
      return this.transformToUnifiedProject(result);
    } catch (error: any) {
      if (error instanceof AdapterConnectionError) {
        return this.handleConnectionFailure(
          config.dbConfig?.connectionString || 'unknown',
          'Database',
          error
        );
      }
      throw error;
    }
  }

  /**
   * Voer database query uit
   * 
   * Maakt connectie met de database, voert de query uit en returned het resultaat.
   * Gebruikt connection pooling voor optimale performance.
   * 
   * @param config - Adapter configuratie met database settings
   * @returns Query resultaat
   */
  async executeQuery(config: AdapterConfig): Promise<any> {
    if (!config.dbConfig) {
      throw new Error('Database configuratie is verplicht');
    }

    const { type, connectionString, query } = config.dbConfig;

    switch (type) {
      case 'postgresql':
        return await this.executePostgreSQLQuery(connectionString, query);
      
      case 'mysql':
        return await this.executeMySQLQuery(connectionString, query);
      
      case 'mongodb':
        return await this.executeMongoDBQuery(connectionString, query);
      
      default:
        throw new Error(`Onbekend database type: ${type}`);
    }
  }

  /**
   * Voer PostgreSQL query uit met connection pooling
   */
  private async executePostgreSQLQuery(connectionString: string, query: string): Promise<any> {
    try {
      // Maak of hergebruik connection pool
      if (!this.pgPool) {
        this.pgPool = new PgPool({
          connectionString,
          min: 5,  // Minimum connections
          max: 20, // Maximum connections
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
      }

      const result = await this.pgPool.query(query);
      
      // Return eerste row of alle rows afhankelijk van resultaat
      return result.rows.length === 1 ? result.rows[0] : result.rows;
    } catch (error: any) {
      throw new AdapterConnectionError(
        `PostgreSQL query gefaald: ${error.message}`
      );
    }
  }

  /**
   * Voer MySQL query uit met connection pooling
   */
  private async executeMySQLQuery(connectionString: string, query: string): Promise<any> {
    try {
      // Maak of hergebruik connection pool
      if (!this.mysqlPool) {
        this.mysqlPool = mysql.createPool({
          uri: connectionString,
          waitForConnections: true,
          connectionLimit: 20,
          queueLimit: 0,
          connectTimeout: 5000,
        });
      }

      const [rows] = await this.mysqlPool.query(query);
      
      // Return eerste row of alle rows
      return Array.isArray(rows) && rows.length === 1 ? rows[0] : rows;
    } catch (error: any) {
      throw new AdapterConnectionError(
        `MySQL query gefaald: ${error.message}`
      );
    }
  }

  /**
   * Voer MongoDB query uit
   * 
   * MongoDB query moet een JSON string zijn met collection en filter:
   * { "collection": "projects", "filter": { "id": "123" } }
   */
  private async executeMongoDBQuery(connectionString: string, queryStr: string): Promise<any> {
    try {
      // Parse query string naar object
      const queryObj = JSON.parse(queryStr);
      
      if (!queryObj.collection) {
        throw new Error('MongoDB query moet een "collection" veld bevatten');
      }

      // Maak of hergebruik MongoDB client
      if (!this.mongoClient) {
        this.mongoClient = new MongoClient(connectionString, {
          maxPoolSize: 20,
          minPoolSize: 5,
          connectTimeoutMS: 5000,
        });
        await this.mongoClient.connect();
      }

      const db = this.mongoClient.db();
      const collection = db.collection(queryObj.collection);
      
      // Voer query uit
      const filter = queryObj.filter || {};
      const result = await collection.findOne(filter);
      
      return result;
    } catch (error: any) {
      throw new AdapterConnectionError(
        `MongoDB query gefaald: ${error.message}`
      );
    }
  }

  /**
   * Transformeer database resultaat naar UnifiedProject format
   */
  private transformToUnifiedProject(data: any): UnifiedProject {
    // Handle array resultaat (neem eerste item)
    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }

    const id = data.id || data.project_id || data.projectId || 'unknown';
    const name = data.name || data.project_name || data.projectName || 'Unknown Project';
    const type = this.normalizeType(data.type || data.project_type || data.projectType);
    const status = this.normalizeStatus(data.status || data.project_status || data.projectStatus);
    const repo = data.repo || data.repository || undefined;
    const lastBuild = data.last_build || data.lastBuild || data.last_deployment || undefined;
    const tags = data.tags || [];

    // Extract analytics data
    const analytics = (data.users !== undefined || data.pageviews !== undefined) ? {
      users: data.users || data.active_users || data.activeUsers || 0,
      pageviews: data.pageviews || data.views || 0,
      revenue: data.revenue || data.total_revenue || data.totalRevenue || undefined,
    } : undefined;

    // Extract payments data
    const payments = (data.last_payment !== undefined || data.total !== undefined) ? {
      lastPayment: data.last_payment || data.lastPayment || data.last_transaction || new Date().toISOString(),
      total: data.total || data.total_amount || data.totalAmount || 0,
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
   * Valideer database adapter configuratie
   */
  async validateConfig(config: AdapterConfig): Promise<{ valid: boolean; errors?: string[] }> {
    const baseValidation = await super.validateConfig(config);
    if (!baseValidation.valid) return baseValidation;

    const errors: string[] = [];

    if (config.type !== 'db') {
      errors.push('Adapter type moet "db" zijn voor DBAdapter');
    }

    if (!config.dbConfig) {
      errors.push('Database configuratie is verplicht voor database adapter');
    } else {
      if (!config.dbConfig.type) {
        errors.push('Database type is verplicht');
      }

      if (!['postgresql', 'mysql', 'mongodb'].includes(config.dbConfig.type)) {
        errors.push('Database type moet "postgresql", "mysql" of "mongodb" zijn');
      }

      if (!config.dbConfig.connectionString) {
        errors.push('Connection string is verplicht');
      }

      if (!config.dbConfig.query) {
        errors.push('Query is verplicht');
      }
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  /**
   * Test database connectie
   * 
   * Voert een simpele test query uit om te verifiëren dat de database bereikbaar is.
   */
  async testConnection(config: AdapterConfig): Promise<boolean> {
    try {
      if (!config.dbConfig) {
        return false;
      }

      const { type, connectionString } = config.dbConfig;

      switch (type) {
        case 'postgresql': {
          const pool = new PgPool({ connectionString, connectionTimeoutMillis: 5000 });
          await pool.query('SELECT 1');
          await pool.end();
          return true;
        }

        case 'mysql': {
          const pool = mysql.createPool({ uri: connectionString, connectTimeout: 5000 });
          await pool.query('SELECT 1');
          await pool.end();
          return true;
        }

        case 'mongodb': {
          const client = new MongoClient(connectionString, { connectTimeoutMS: 5000 });
          await client.connect();
          await client.close();
          return true;
        }

        default:
          return false;
      }
    } catch (error) {
      this.logError('Connection test failed', error, config);
      return false;
    }
  }

  /**
   * Sluit alle database connecties
   * 
   * Moet aangeroepen worden bij graceful shutdown.
   */
  async closeConnections(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
      this.pgPool = undefined;
    }

    if (this.mysqlPool) {
      await this.mysqlPool.end();
      this.mysqlPool = undefined;
    }

    if (this.mongoClient) {
      await this.mongoClient.close();
      this.mongoClient = undefined;
    }
  }
}
