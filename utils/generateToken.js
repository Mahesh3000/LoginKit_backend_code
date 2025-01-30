const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h", // Adjust as needed
  });
};

module.exports = generateToken;
