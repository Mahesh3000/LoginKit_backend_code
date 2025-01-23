const { validateRegistrationData } = require("../utils/validators");

const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  const validationError = validateRegistrationData(username, email, password);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  next(); // Proceed to the next middleware/controller
};

module.exports = { validateRegistration };
