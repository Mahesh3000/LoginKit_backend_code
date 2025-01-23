const { authenticator } = require("otplib");
const QRCode = require("qrcode");
// const { totpServices } = require("../services/userServices");
const { sendLoginResponse } = require("../utils/response");
// const getUserByEmailOrUsername = require("../services/userServices");
const userServices = require("../services/userServices"); // Adjust the path if needed
const { generateToken } = require("../config/jwt");
const { updateTotpFirstTimeUserStatus } = require("./authControllers");

const generateQRHandler = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    // Fetch the stored secret from the database
    const totpSecret = await userServices.getTOTPSecret(username);
    if (!totpSecret) {
      return res.status(404).json({
        success: false,
        message: "User not found or TOTP secret not set.",
      });
    }

    // Generate the otpauth URI
    const otpauth = authenticator.keyuri(username, "LoginKitApp", totpSecret);

    // Generate the QR code
    const qrCodeDataURL = await QRCode.toDataURL(otpauth);

    res.status(200).json({ success: true, qrCode: qrCodeDataURL });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
};

const verifyTOTPHandler = async (req, res) => {
  const { identifier, code } = req.body;

  if (!identifier || !code) {
    return res
      .status(400)
      .json({ message: "Username and TOTP code are required" });
  }

  try {
    const user = await userServices.getUserByEmailOrUsername(identifier);

    const totpSecret = await userServices.getTOTPSecret(user.username);

    if (!totpSecret) {
      return res.status(404).json({
        success: false,
        message: "User not found or TOTP secret not set.",
      });
    }

    const isValid = authenticator.verify({ token: code, secret: totpSecret });

    if (isValid) {
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      await updateTotpFirstTimeUserStatus(user.id);

      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      sendLoginResponse(res, user, token, "TOTP verified successfully.");
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid TOTP code.",
      });
    }
  } catch (error) {
    console.error("Error verifying TOTP:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { generateQRHandler, verifyTOTPHandler };
