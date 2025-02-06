const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel"); // Import your user model
const { generateToken } = require("./jwt");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://18.234.47.219:8000/auth/google/callback",
      scope: ["profile", "email"],
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

        // Generate JWT token
        const token = generateToken({
          id: user.id,
          googleId: user.googleId,
          email: user.email,
        });

        // Attach token to user object
        user.token = token;

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.email));

passport.deserializeUser(async (email, done) => {
  try {
    const user = await User.findUserByEmail(email);
    console.log("Deserialized User: ", user); // Check if user exists
    if (!user) {
      return done(null, false); // If no user found, pass false
    }
    done(null, user); // Otherwise, pass user object
  } catch (err) {
    console.error("Error during deserialization:", err);
    done(err, null); // Handle errors in deserialization
  }
});
