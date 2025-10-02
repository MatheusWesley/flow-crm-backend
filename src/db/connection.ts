import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/environment';
import * as schema from './schema';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// Create Drizzle database instance
export const db = drizzle(pool, { schema });

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};