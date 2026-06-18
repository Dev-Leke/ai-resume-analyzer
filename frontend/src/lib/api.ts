import { AnalysisListItem, AnalysisRecord, ApiError } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const MAX_PDF_BYTES = 5 * 1024 * 1024;

async function readJsonOrThrow(res: Response) {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // backend should always return JSON, but guard against an empty/non-JSON body
  }
  if (!res.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status}).`;
    throw new ApiError(message, res.status);
  }
  return data;
}

export async function analyzeText(text: string): Promise<AnalysisRecord> {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return readJsonOrThrow(res);
}

export async function analyzePdf(file: File): Promise<AnalysisRecord> {
  const formData = new FormData();
  formData.append("resume", file);
  // Do NOT set Content-Type manually — the browser sets the multipart boundary.
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });
  return readJsonOrThrow(res);
}

export async function listAnalyses(): Promise<AnalysisListItem[]> {
  const res = await fetch(`${API_URL}/api/analyses`);
  const data = await readJsonOrThrow(res);
  return data.analyses;
}

export async function getAnalysis(id: string): Promise<AnalysisRecord | null> {
  const res = await fetch(`${API_URL}/api/analyses/${id}`);
  if (res.status === 404) return null;
  return readJsonOrThrow(res);
}