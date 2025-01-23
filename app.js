const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const imageRoutes = require("./routes/imagesRoutes");
// const cookieSession = require("cookie-session");
const session = require("express-session");
require("./config/passport");

const passport = require("passport");

require("dotenv").config();

const app = express();
app.use(express.json());

// app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   })
// );
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(bodyParser.json());

app.use("/auth", authRoutes);

app.use("/otp", otpRoutes);

app.use("/images", imageRoutes);

app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: false, // Set to true if you're using HTTPS
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error", err.stack);
    process.exit(1); // Exit the application if DB connection fails
  } else {
    console.log("Connected to the database", res.rows[0]);
  }
});

module.exports = app;
