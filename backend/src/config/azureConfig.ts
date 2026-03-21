import sql from "mssql";

// ─────────────────────────────────────────────
// SQL Server Connection Config
// Supports both local Docker and Azure SQL
// ─────────────────────────────────────────────

const isAzure = process.env.NODE_ENV === "production";

const dbConfig: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "ontario_tax_db",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourLocalPassword123!",
  port: parseInt(process.env.DB_PORT || "1433", 10),
  options: {
    encrypt: isAzure,              // true for Azure SQL, false for local Docker
    trustServerCertificate: !isAzure, // true for local, false for Azure
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// ─────────────────────────────────────────────
// Singleton Connection Pool
// ─────────────────────────────────────────────

let pool: sql.ConnectionPool | null = null;

/**
 * Returns a singleton mssql ConnectionPool.
 * Reuses existing connection if already established.
 */
export const getPool = async (): Promise<sql.ConnectionPool> => {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log(`[DB] Connected to SQL Server — ${dbConfig.server}/${dbConfig.database}`);
    return pool;
  } catch (error) {
    console.error("[DB] Connection failed:", error);
    throw new Error("Database connection could not be established.");
  }
};

/**
 * Gracefully closes the connection pool.
 * Call this on app shutdown.
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("[DB] Connection pool closed.");
  }
};