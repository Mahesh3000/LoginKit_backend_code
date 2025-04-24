const express = require("express");
const {
  registerUser,
  login,
  getUser,
  toggleTotpHandler,
  toggleOtpHandler,
} = require("../controllers/authControllers");
const passport = require("passport");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/get-user/:identifier", getUser);
router.post("/toggle-totp", toggleTotpHandler);
router.post("/toggle-otp", toggleOtpHandler);

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `https://main.d2kp62byamf4dd.amplifyapp.com`,
  }),
  (req, res) => {
    const token = req.user.token;

    res.redirect(
      `https://main.d2kp62byamf4dd.amplifyapp.com/dashboard?token=${token}`
    );
  }
);

module.exports = router;
