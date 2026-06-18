export type AnalysisSource = "pdf" | "text";

export type AnalysisRecord = {
  id: string;
  timestamp: string;
  source: AnalysisSource;
  resumeText?: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export type AnalysisListItem = {
  id: string;
  timestamp: string;
  score: number;
  source: AnalysisSource;
  preview: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}