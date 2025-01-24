const { Pool } = require("pg");
require("dotenv").config(); // To load environment variables

// Log environment variables to check if they are loaded correctly
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  host: process.env.DB_HOST, // RDS endpoint (e.g., your-db-name.rds.amazonaws.com)
  port: process.env.DB_PORT || 5432, // Default port is 5432
  user: process.env.DB_USER, // DB username
  password: process.env.DB_PASSWORD, // DB password
  database: process.env.DB_NAME, // Database name
  max: process.env.DB_MAX_CLIENTS || 10, // Maximum number of clients in the pool (default 10)
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000, // Close idle clients after this time (default 30s)
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000, // Timeout for new connections (default 2s)
});

// Connection success event
pool.on("connect", () => {
  console.log("Connected to PostgreSQL via connection pool");
});

// Error handling event
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1); // Exit the process if there is an error
});

// Test connection
const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Current Time from DB:", res.rows[0]);
  } catch (err) {
    console.error("Error executing query:", err);
  }
};

// Call the testConnection function to check if the pool is working correctly
testConnection();

// Export the pool so you can use it in other parts of your application
module.exports = pool;
