const db = require("../config/db");

const User = {
  // Method to find a user by email
  findUserByEmail: async (email) => {
    try {
      const query = "SELECT * FROM users WHERE email = $1";
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      throw new Error("Error finding user by email");
    }
  },

  // New method to find a user by Google ID
  findByGoogleId: async (email) => {
    try {
      const query = "SELECT * FROM users WHERE email = $1";
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      throw new Error("Error finding user by Google ID");
    }
  },

  // Method to create a new user
  create: async (userData) => {
    try {
      const { googleId, email, username, profilePhoto } = userData;
      console.log("userData", userData);

      const query = `
        INSERT INTO users (google_id, email, username, profile_photo, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const result = await db.query(query, [
        googleId,
        email,
        username,
        profilePhoto,
        username,
      ]);

      return result.rows[0];
    } catch (err) {
      throw new Error("Error creating user");
    }
  },
};

module.exports = User;
