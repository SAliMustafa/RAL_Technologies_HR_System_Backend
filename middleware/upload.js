const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Keep using the existing shared upload folder for employee and leave documents.
    const uploadDirectory = path.join(__dirname, "../image/");

    // Create the folder on first use so uploads also work on a fresh installation.
    fs.mkdirSync(uploadDirectory, { recursive: true });
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {
    // Remove unsafe filename characters before saving the uploaded file.
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, Date.now() + "-" + safeName);
  }
});

const upload = multer({
  storage,

  // Limit uploads to 5 MB so a user cannot upload an unexpectedly large file.
  limits: { fileSize: 5 * 1024 * 1024 },

  // Employee documents and leave evidence only need these common safe formats.
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF, JPG and PNG files are allowed."));
    }

    cb(null, true);
  }
});

module.exports = upload;
