const { randomUUID } = require("crypto");
const { analyzeResume } = require("../services/openaiService");
const { extractPdfText } = require("../services/pdfService");
const {
  saveAnalysis,
  listAnalyses,
  getAnalysisById: fetchAnalysisById,
} = require("../services/storageService");

async function createAnalysis(req, res) {
  try {
    let resumeText;
    let source;

    if (req.file) {
      // --- PDF path ---
      try {
        const { text } = await extractPdfText(req.file.buffer);
        resumeText = text;
        source = "pdf";
      } catch (err) {
        if (err.code === "NO_TEXT_LAYER") {
          // The graceful fallback: tell the client to use the paste path.
          return res.status(422).json({
            error:
              "Couldn't read text from this PDF (it may be a scanned image). Please paste the resume text instead.",
          });
        }
        throw err; // unexpected → bubble to the catch below
      }
    } else if (req.body?.text?.trim()) {
      // --- Paste path ---
      resumeText = req.body.text.trim();
      source = "text";
    } else {
      return res.status(400).json({
        error:
          "Provide a resume: upload a PDF (field 'resume') or paste text (field 'text').",
      });
    }

    const result = await analyzeResume(resumeText);

    const record = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      source,
      resumeText,
      score: result.score,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || [],
    };

    const storage = await saveAnalysis(record);
    return res.status(201).json({ ...record, storage });
  } catch (err) {
    console.error("Analysis error:", err);
    return res
      .status(500)
      .json({ error: "Failed to analyze resume.", detail: err.message });
  }
}

async function getAnalyses(req, res) {
  try {
    const records = await listAnalyses();
    const analyses = records.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      score: r.score,
      source: r.source,
      preview: r.resumeText ? r.resumeText.slice(0, 120) : "",
    }));
    return res.json({ count: analyses.length, analyses });
  } catch (err) {
    console.error("List error:", err);
    return res
      .status(500)
      .json({ error: "Failed to list analyses.", detail: err.message });
  }
}

async function getAnalysis(req, res) {
  try {
    const record = await fetchAnalysisById(req.params.id);
    if (!record) return res.status(404).json({ error: "Analysis not found." });
    return res.json(record);
  } catch (err) {
    console.error("Fetch error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch analysis.", detail: err.message });
  }
}

module.exports = { createAnalysis, getAnalyses, getAnalysis };
