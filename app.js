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

const allowedOrigins = [
  "https://maheshsivangi.tech",
  "https://app.loginkit.maheshsivangi.tech/",
  "https://main.d2kp62byamf4dd.amplifyapp.com",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

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
