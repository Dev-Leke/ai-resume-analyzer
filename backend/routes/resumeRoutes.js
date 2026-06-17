const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  createAnalysis,
  getAnalyses,
  getAnalysis,
} = require("../controllers/resumeController");

// memoryStorage keeps the file in RAM as a Buffer (req.file.buffer) — no temp
// files on disk to clean up, and it feeds straight into the PDF parser.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap (maximum expected resume size, plus a safety margin)
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("ONLY_PDF")); // rejected → handled in server.js error handler
  },
});

router.post("/analyze", upload.single("resume"), createAnalysis);
router.get("/analyses", getAnalyses);
router.get("/analyses/:id", getAnalysis);

module.exports = router;
