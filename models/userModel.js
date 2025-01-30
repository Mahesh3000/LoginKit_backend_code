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

      // Check if a user already exists with the given email
      const existingUserByEmail = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (existingUserByEmail.rows.length > 0) {
        // If a user exists by email, handle username collision
        const existingUser = existingUserByEmail.rows[0];

        // Check if the username already exists for other users with different emails
        const existingUsername = await db.query(
          "SELECT * FROM users WHERE username = $1 AND email != $2",
          [username, email]
        );

        if (existingUsername.rows.length > 0) {
          // If the username is already taken, modify it to make it unique
          const uniqueUsername = `${username}_${googleId}`; // You can modify the username more as needed
          await db.query(
            "UPDATE users SET username = $1 WHERE email = $2 RETURNING *",
            [uniqueUsername, email]
          );
          // Return the updated user with the unique username
          return { ...existingUser, username: uniqueUsername };
        } else {
          // If no username collision, just use the original username
          return existingUser;
        }
      }

      // If no user exists with this email, create a new user
      // Check if the username already exists (for the case of a new user)
      const existingUsernameCheck = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      if (existingUsernameCheck.rows.length > 0) {
        // Username already exists, modify the username to make it unique
        const uniqueUsername = `${username}_${googleId}`;
        // Proceed with user creation using the unique username
        const query = `
          INSERT INTO users (google_id, email, username, profile_photo, password)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `;
        const result = await db.query(query, [
          googleId,
          email,
          uniqueUsername,
          profilePhoto,
          username, // You can set a default password if needed, or handle differently
        ]);
        return result.rows[0];
      }

      // If username is unique, proceed with the regular user creation
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
        username, // You can set a default password if needed, or handle differently
      ]);

      return result.rows[0];
    } catch (err) {
      throw new Error("Error creating user: " + err.message);
    }
  },
};

module.exports = User;
