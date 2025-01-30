const express = require("express");
const {
  sendEmailOtpHandler,
  sendPhoneOtpHandler,
  verifyEmailHandler,
  listOfVerfiedEmailHandler,
  verifyOtpHandler,
  requestOTPHandler,
} = require("../controllers/otpController");
const {
  generateQRHandler,
  verifyTOTPHandler,
} = require("../controllers/totpController");

const router = express.Router();

// Otp routes with email and phone
router.post("/verify-email", verifyEmailHandler);
router.post("/request-otp", requestOTPHandler);
router.post("/verify-otp", verifyOtpHandler);
router.get("/list-verified-emails", listOfVerfiedEmailHandler);
router.post("/send-email-otp", sendEmailOtpHandler);
router.post("/phone", sendPhoneOtpHandler);

// Totp routes for google authenticator
router.post("/generate-qr", generateQRHandler);
router.post("/verify-totp", verifyTOTPHandler);

module.exports = router;
