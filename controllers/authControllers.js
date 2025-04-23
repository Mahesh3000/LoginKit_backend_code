const bcrypt = require("bcrypt");
const { validateRegistrationData } = require("../utils/validators");
const { authenticator } = require("otplib");
const { sendLoginResponse } = require("../utils/response");
const userServices = require("../services/userServices"); // Adjust the path if needed
const { generateToken } = require("../config/jwt");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, phone_number } = req.body;
    const saltRounds = 10;
    const secret = authenticator.generateSecret();

    const validationError = validateRegistrationData(
      username,
      email,
      password,
      phone_number
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the user to the database
    const user = await userServices.createUser(
      username,
      email,
      hashedPassword,
      phone_number,
      secret
    );

    if (user.error) {
      return res.status(400).json({ error: user.error });
    }

    // Generate JWT token using the existing utility
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Send login response using sendLoginResponse
    return sendLoginResponse(res, user, token, "User registered successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

const login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Identifier and password are required" });
  }

  try {
    const result = await userServices.loginUser(identifier, password);

    if (result.error) {
      return res.status(401).json({ message: result.message });
    }

    if (!result.user.otp_enabled && !result.user.totp_enabled) {
      return sendLoginResponse(res, result.user, result.token);
    }

    // If TOTP is enabled, ask for the TOTP code
    if (result.user.totp_enabled) {
      return res.status(200).json({
        success: true,
        message: "TOTP verification required",
        // token: result.token, // Send token to verify TOTP later
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          phone_number: result.user.phone_number,
          totp_enabled: result.user.totp_enabled,
          otp_enabled: result.user.otp_enabled,
          phone_number: result.user.phone_number || "",
        },
      });
    }

    // If OTP is enabled, ask for the OTP code
    if (result.user.otp_enabled) {
      return res.status(200).json({
        success: true,
        message: "OTP verification required",
        // token: result.token, // Send token to verify OTP later
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          phone_number: result.user.phone_number,
          totp_enabled: result.user.totp_enabled,
          otp_enabled: result.user.otp_enabled,
          phone_number: result.user.phone_number || "",
        },
      });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  // Capture identifier from request params
  const { identifier } = req.params;

  // Check if identifier is provided
  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: "Identifier (email or username) is required",
    });
  }

  try {
    // Call the function to get user by email or username
    const user = await userServices.getUsernameByEmailOrUsername(identifier);

    // If user is not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Successfully found user
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Error handling for any issues that occur in the try block
    console.error("Error in getUser API:", error.message);
    // Provide a generic error response to the client while logging the details for debugging
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

const updateTotpFirstTimeUserStatus = async (userId) => {
  try {
    const result = await userServices.updateUserById(userId, {
      is_first_time_user: false,
    });
    console.log("First-time user status updated successfully", result);
  } catch (error) {
    console.error("Error updating first-time user status:", error);
    throw new Error("Failed to update first-time user status");
  }
};

const toggleTotpHandler = async (req, res) => {
  try {
    const { identifier, enable } = req.body;

    // Fetch user by email or username
    const user = await userServices.getUserByEmailOrUsername(identifier);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("enable", enable);

    // If enabling TOTP, generate a secret; otherwise, set secret to null
    // const secret = enable ? authenticator.generateSecret() : null;

    // Update the user's TOTP settings
    const updatedUser = await userServices.updateUserTOTP(user.id, enable);

    res.status(200).json({
      success: true,
      message: `TOTP ${enable ? "enabled" : "disabled"} successfully`,
      // ...(enable && { secret: updatedUser.totp_secret }), // Only include the secret if enabling
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

const toggleOtpHandler = async (req, res) => {
  try {
    const { identifier, enable } = req.body;

    // Fetch user by email or username
    const user = await userServices.getUserByEmailOrUsername(identifier);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update OTP settings
    const updatedUser = await userServices.updateUserOTP(user.id, enable);

    res.status(200).json({
      message: `OTP ${enable ? "enabled" : "disabled"} successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

module.exports = {
  registerUser,
  login,
  getUser,
  updateTotpFirstTimeUserStatus,
  toggleOtpHandler,
  toggleTotpHandler,
};
