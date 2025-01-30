const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel"); // Import your user model

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"], // Requesting profile and email scope
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findUserByEmail(profile.emails[0].value);

        // If the user doesn't exist, create a new user
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
            profilePhoto: profile.photos[0].value,
          });
        }

        // Log in the user
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
passport.serializeUser((user, done) => done(null, user.email));

// Deserialize user from session
passport.deserializeUser(async (email, done) => {
  try {
    const user = await User.findUserByEmail(email); // Retrieve user by email
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
