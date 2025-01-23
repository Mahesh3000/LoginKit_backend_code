const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel"); // Import your user model

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//       scope: ["profile", "email"], // Requesting profile and email scope
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const googleId = profile.id;
//         const email = profile.emails[0].value;
//         const username = profile.displayName;
//         const profilePhoto = profile.photos[0]?.value; // Get the profile photo if available

//         // Check if user already exists with this Google ID
//         const existingUser = await User.findByGoogleId(googleId);

//         if (existingUser) {
//           // User already exists, pass the user to done
//           return done(null, existingUser);
//         } else {
//           // If the user does not exist, create a new user
//           const newUser = await User.create({
//             googleId,
//             email,
//             username,
//             profilePhoto,
//           });
//           return done(null, newUser); // Pass the newly created user to done
//         }
//       } catch (err) {
//         console.error("Error during Google login:", err);
//         return done(err, null); // Handle errors
//       }
//     }
//   )
// );

// Serialize user ID to save in the session

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
        let user = await User.findByGoogleId(profile.emails[0].value);

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
