const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("../config/jwt"); // Assuming you have a utility for JWT
const { generateToken } = require("../config/jwt");
const { authenticator } = require("otplib");

const checkIfUserExists = async (email, username) => {
  const query = "SELECT * FROM users WHERE email = $1 OR username = $2";
  const values = [email, username];

  try {
    const { rows } = await pool.query(query, values);
    return rows.length > 0; // Return true if user exists
  } catch (err) {
    throw new Error("Error checking user existence: " + err.message);
  }
};

// Function to create a new user
const createUser = async (username, email, password, phoneNumber, secret) => {
  const userExists = await checkIfUserExists(email, username);

  if (userExists) {
    return { error: "User with this email or username already exists." }; // Return error object
  }

  const query =
    "INSERT INTO users (username, email, password, phone_number,totp_secret) VALUES ($1, $2, $3, $4,$5) RETURNING *";
  const values = [username, email, password, phoneNumber, secret];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the created user
  } catch (err) {
    throw new Error("Error creating user: " + err.message);
  }
};

const getUserByEmailOrUsername = async (identifier) => {
  const query = "SELECT * FROM users WHERE email = $1 OR username = $1";
  const values = [identifier];

  try {
    const { rows } = await pool.query(query, values);
    return rows.length ? rows[0] : null;
  } catch (err) {
    throw new Error("Error fetching user: " + err.message);
  }
};

const getUsernameByEmailOrUsername = async (identifier) => {
  const query =
    "SELECT username,email FROM users WHERE email = $1 OR username = $1";
  const values = [identifier];

  try {
    const { rows } = await pool.query(query, values);
    return rows.length ? rows[0] : null;
  } catch (err) {
    throw new Error("Error fetching user: " + err.message);
  }
};

const loginUser = async (identifier, password) => {
  const user = await getUserByEmailOrUsername(identifier);

  if (!user) {
    return { error: true, message: "User not found" };
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { error: true, message: "Invalid credentials" };
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    error: false,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_first_time_user: user.is_first_time_user,
      totp_enabled: user.totp_enabled,
      otp_enabled: user.otp_enabled,
      two_fa_method: user.two_fa_method, // TOTP or OTP or none
    },
  };
};

const getTOTPSecret = async (username) => {
  const query = "SELECT totp_secret FROM users WHERE username = $1";
  const values = [username];

  try {
    const result = await pool.query(query, values);
    return result.rows.length ? result.rows[0].totp_secret : null;
  } catch (error) {
    console.error("Error retrieving TOTP secret:", error);
    throw error;
  }
};

const updateUserById = async (userId) => {
  // const query =
  //   "UPDATE users SET is_first_time_user = false,totp_enabled=true WHERE id = $1";
  // const values = [userId];
  // try {
  //   const result = await pool.query(query, values);
  //   return result.rowCount > 0; // Returns true if the update was successful
  // } catch (error) {
  //   console.error("Error updating is_first_time_user status:", error);
  //   throw error;
  // }
};

const updateUserTOTP = async (userId, totpEnabled) => {
  const query = `
    UPDATE users
    SET totp_enabled = $1
    WHERE id = $2
  `;
  const values = [totpEnabled, userId];
  try {
    const { rows } = await pool.query(query, values);
    return rows.length ? rows[0] : null;
  } catch (err) {
    throw new Error("Error updating TOTP: " + err.message);
  }
};

const updateUserOTP = async (userId, otpEnabled) => {
  const query = `
    UPDATE users 
    SET otp_enabled = $1 
    WHERE id = $2 
    RETURNING otp_enabled;
  `;
  const values = [otpEnabled, userId];

  try {
    const { rows } = await pool.query(query, values);
    return rows.length ? rows[0] : null;
  } catch (err) {
    throw new Error("Error updating OTP: " + err.message);
  }
};
module.exports = {
  createUser,
  loginUser,
  getTOTPSecret,
  getUserByEmailOrUsername,
  updateUserById,
  updateUserTOTP,
  updateUserOTP,
  getUsernameByEmailOrUsername,
};
