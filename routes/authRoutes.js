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
    failureRedirect: `https://app.loginkit.maheshsivangi.tech`,
  }),
  (req, res) => {
    const token = req.user.token;

    res.redirect(
      `https://app.loginkit.maheshsivangi.tech/dashboard?token=${token}`
    );
  }
);

module.exports = router;
