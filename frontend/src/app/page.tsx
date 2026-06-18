"use client";

import { useRef, useState } from "react";
import { analyzeText, analyzePdf, listAnalyses, getAnalysis, API_URL, MAX_PDF_BYTES } from "@/lib/api";
import { ApiError, AnalysisRecord, AnalysisListItem } from "@/lib/types";
import AnalysisResults from "@/components/AnalysisResults";
import HistoryList from "@/components/HistoryList";

type InputMode = "paste" | "upload";
type Tab = "analyze" | "history";
type ErrorState = { message: string; status?: number } | null;

export default function Home() {
  const [tab, setTab] = useState<Tab>("analyze");

  // Analyze tab state
  const [mode, setMode] = useState<InputMode>("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const [result, setResult] = useState<AnalysisRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History tab state
  const [historyItems, setHistoryItems] = useState<AnalysisListItem[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<AnalysisRecord | null>(null);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }
    const looksLikePdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!looksLikePdf) {
      setError({ message: "Only PDF files are accepted. Paste the text instead if it isn't a PDF." });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (f.size > MAX_PDF_BYTES) {
      setError({ message: "PDF is too large (max 5 MB)." });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setError(null);
    setFile(f);
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function switchMode(next: InputMode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit() {
    if (loading) return;
    if (mode === "paste" && !text.trim()) return;
    if (mode === "upload" && !file) return;

    setLoading(true);
    setError(null);
    try {
      const data = mode === "paste" ? await analyzeText(text) : await analyzePdf(file as File);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError({ message: err.message, status: err.status });
      } else {
        setError({ message: err instanceof Error ? err.message : "Something went wrong." });
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function startNewAnalysis() {
    setResult(null);
    setError(null);
    setText("");
    clearFile();
  }

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const items = await listAnalyses();
      setHistoryItems(items);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Couldn't load history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  function openHistoryTab() {
    setTab("history");
    if (historyItems === null) loadHistory();
  }

  async function handleSelectHistory(id: string) {
    setHistoryDetailLoading(true);
    setHistoryError(null);
    try {
      const record = await getAnalysis(id);
      setSelectedHistory(record);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Couldn't load that analysis.");
    } finally {
      setHistoryDetailLoading(false);
    }
  }

  const originalWords = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <main className="min-h-screen bg-bg px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 md:mb-14">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-bg-text/70 mb-3">
            AI Resume Feedback
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-paper mb-3">
            Resume Analyzer
          </h1>
          <p className="text-bg-text/70 max-w-xl text-sm md:text-base">
            Paste your resume or upload a PDF. Get a score, what&#x2019;s
            working, and what to fix.
          </p>
        </header>

        <div className="flex gap-6 mb-6 border-b border-bg-text/15">
          <button
            onClick={() => setTab("analyze")}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "analyze"
                ? "border-accent text-paper"
                : "border-transparent text-bg-text/50 hover:text-bg-text/80"
            }`}
          >
            Analyze
          </button>
          <button
            onClick={openHistoryTab}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "history"
                ? "border-accent text-paper"
                : "border-transparent text-bg-text/50 hover:text-bg-text/80"
            }`}
          >
            History
          </button>
        </div>

        {tab === "analyze" && (
          <div className="bg-paper border border-rule rounded-sm p-6 md:p-10 grid md:grid-cols-2 gap-10 md:gap-12">
            {/* Input column */}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-4">
                01 — Submit
              </p>

              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => switchMode("paste")}
                  className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
                    mode === "paste"
                      ? "bg-ink text-paper border-ink"
                      : "bg-paper text-ink border-rule hover:border-muted"
                  }`}
                >
                  Paste text
                </button>
                <button
                  onClick={() => switchMode("upload")}
                  className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
                    mode === "upload"
                      ? "bg-ink text-paper border-ink"
                      : "bg-paper text-ink border-rule hover:border-muted"
                  }`}
                >
                  Upload PDF
                </button>
              </div>

              {mode === "paste" ? (
                <>
                  <label htmlFor="resume-text" className="sr-only">
                    Resume text
                  </label>
                  <textarea
                    id="resume-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your resume text here..."
                    rows={14}
                    className="w-full resize-none bg-paper border border-rule rounded-sm p-4 text-ink text-sm leading-relaxed focus:outline-none focus:border-accent placeholder:text-muted/70"
                  />
                  <div className="flex items-center justify-between mt-2 mb-6">
                    <span className="font-mono text-xs text-muted">
                      {originalWords} {originalWords === 1 ? "word" : "words"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="mb-6">
                  <label
                    htmlFor="resume-file"
                    className="flex flex-col items-center justify-center gap-2 border border-dashed border-rule rounded-sm p-8 text-center cursor-pointer hover:border-accent transition-colors"
                  >
                    <span className="text-sm text-ink">
                      {file ? "Replace file" : "Choose a PDF"}
                    </span>
                    <span className="font-mono text-xs text-muted">PDF only · max 5 MB</span>
                  </label>
                  <input
                    id="resume-file"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  {file && (
                    <div className="flex items-center justify-between mt-3 px-3 py-2 bg-ink/[0.04] rounded-sm">
                      <span className="text-sm text-ink truncate">
                        {file.name}{" "}
                        <span className="text-muted font-mono text-xs">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </span>
                      <button
                        onClick={clearFile}
                        aria-label="Remove file"
                        className="text-muted hover:text-rust text-sm ml-3 flex-none"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={(mode === "paste" ? !text.trim() : !file) || loading}
                className="w-full md:w-auto px-6 py-3 bg-accent text-ink font-medium text-sm rounded-sm transition-colors hover:bg-accent-deep disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent"
              >
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>

              {error && (
                <div className="mt-4">
                  <p className="text-sm text-red-700">{error.message}</p>
                  {error.status === 422 && (
                    <button
                      onClick={() => switchMode("paste")}
                      className="mt-2 text-sm text-accent-deep underline"
                    >
                      Switch to paste mode
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Output column */}
            <div className="md:border-l md:border-rule md:pl-12">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-4">
                02 — Review
              </p>

              {!result && !loading && (
                <p className="text-muted italic text-sm">
                  Your analysis will appear here.
                </p>
              )}

              {loading && (
                <p className="text-muted text-sm animate-pulse">Analyzing...</p>
              )}

              {result && !loading && (
                <div>
                  <AnalysisResults result={result} />
                  <button
                    onClick={startNewAnalysis}
                    className="mt-6 text-sm text-accent-deep underline"
                  >
                    Run another analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="bg-paper border border-rule rounded-sm p-6 md:p-10">
            {selectedHistory ? (
              <div>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="mb-6 text-sm text-accent-deep underline"
                >
                  ← Back to history
                </button>
                <AnalysisResults result={selectedHistory} />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    Past analyses
                  </p>
                  <button
                    onClick={loadHistory}
                    className="font-mono text-xs text-accent-deep underline"
                  >
                    Refresh
                  </button>
                </div>

                {historyDetailLoading && (
                  <p className="text-muted text-sm animate-pulse">Loading...</p>
                )}
                {historyLoading && (
                  <p className="text-muted text-sm animate-pulse">Loading history...</p>
                )}
                {historyError && (
                  <p className="text-sm text-red-700 mb-4">{historyError}</p>
                )}
                {!historyLoading && historyItems && (
                  <HistoryList analyses={historyItems} onSelect={handleSelectHistory} />
                )}
              </div>
            )}
          </div>
        )}

        <p className="mt-6 font-mono text-xs text-bg-text/40">
          API: {API_URL}/api/analyze
        </p>
      </div>
    </main>
  );
}