const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const imageRoutes = require("./routes/imagesRoutes");
require("./config/passport");

const passport = require("passport");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    credentials: true,
  })
);
// app.use(cors({ origin: "http://98.82.175.42/:5173", credentials: true }));

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.use("/otp", otpRoutes);

app.use("/images", imageRoutes);

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error", err.stack);
    process.exit(1); // Exit the application if DB connection fails
  } else {
    console.log("Connected to the database", res.rows[0]);
  }
});

module.exports = app;
