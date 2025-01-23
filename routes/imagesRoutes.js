// src/routes/imageRoutes.js
const express = require("express");
const { uploadImage } = require("../controllers/imageController");
const router = express.Router();

// POST route for image upload
router.post(
  "/upload",
  express.raw({ type: "application/json", limit: "50mb" }),
  uploadImage
);

module.exports = router;
