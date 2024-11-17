const express = require("express");
const { login, fileUpload } = require("../controllers/operationController");
const router = express.Router();
const { auth } = require("../auth");
const multer = require("multer");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error("Invalid file type. Only .pptx, .docx, or .xlsx are allowed."),
      false
    );
  }
};

// Multer upload configuration
const uploadStorage = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post("/login",login);
router.post("/uploadFile",auth('ops'), uploadStorage.single("file"), fileUpload);
module.exports = router;
