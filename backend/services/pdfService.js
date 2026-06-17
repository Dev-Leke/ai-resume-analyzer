// Extracts the text layer from a PDF buffer.
async function extractPdfText(buffer) {
  const { extractText, getDocumentProxy } = await import("unpdf");

  // pdf.js works on a Uint8Array, not a Node Buffer, so convert.
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  // mergePages: true returns one combined string instead of per-page array.
  const { totalPages, text } = await extractText(pdf, { mergePages: true });

  const cleaned = (text || "").replace(/[ \t]+\n/g, "\n").trim();

  // Scanned/image PDFs have no real text layer → near-empty result.
  // Under ~50 chars means "no extractable text" → signal the caller to fall back.
  if (cleaned.length < 50) {
    const err = new Error("NO_TEXT_LAYER");
    err.code = "NO_TEXT_LAYER";
    throw err;
  }

  return { text: cleaned, pages: totalPages };
}

module.exports = { extractPdfText };
