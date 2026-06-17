require("dotenv").config();
const express = require("express");
const cors = require("cors");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ message: "AI Resume Analyzer API running", status: "ok" });
});

app.use("/api", resumeRoutes);

// Error handler — 4 args is what marks a function as Express error middleware.
app.use((err, req, res, next) => {
  if (err?.message === "ONLY_PDF") {
    return res.status(415).json({
      error:
        "Only PDF files are accepted. Paste the text instead if it isn't a PDF.",
    });
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "PDF is too large (max 5 MB)." });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Server error.", detail: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
