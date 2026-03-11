/**
 * Jest Test Setup
 * 
 * Configuratie die wordt uitgevoerd voordat alle tests starten.
 */

// Verhoog timeout voor integration tests
jest.setTimeout(30000);

// Mock environment variables voor tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/superstash_test';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PORT = '4001';

// Global test utilities kunnen hier worden toegevoegd
