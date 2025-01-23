const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "secret";
const EXPIRES_IN = "1h";

// Function to generate a JWT
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
};

// Function to verify a JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = { generateToken, verifyToken };
