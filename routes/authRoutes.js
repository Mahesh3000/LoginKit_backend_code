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
    failureRedirect: `http://${process.env.LOCAL_IP}/:5173`,
  }),
  (req, res) => {
    res.redirect(`http://${process.env.LOCAL_IP}/:5173/dashboard`); // Redirect after successful login
  }
);

module.exports = router;
