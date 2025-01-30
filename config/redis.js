const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: "127.0.0.1", // Localhost address (IPv4)
    port: 6379, // Default Redis port
  },
});

// redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis!");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

module.exports = redisClient;
