const { Pool } = require("pg");
require("dotenv").config(); // To load environment variables

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: process.env.DB_MAX_CLIENTS || 10, // Maximum number of clients in the pool
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000, // Close idle clients after this time
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000, // Timeout for new connections
  ssl: {
    rejectUnauthorized: false, // Bypasses SSL certificate validation (Not recommended for high security)
  },
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL via connection pool");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
