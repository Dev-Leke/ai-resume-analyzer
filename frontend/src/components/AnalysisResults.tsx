import { AnalysisRecord } from "@/lib/types";
import { formatTimestamp } from "@/lib/score";
import ScoreMeter from "./ScoreMeter";

function FeedbackList({
  title,
  items,
  markerClass,
}: {
  title: string;
  items: string[];
  markerClass: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-6">
      <p className={`font-mono text-xs uppercase tracking-[0.1em] mb-2 ${markerClass}`}>
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-ink leading-relaxed">
            <span className={`font-mono ${markerClass}`}>—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalysisResults({ result }: { result: AnalysisRecord }) {
  return (
    <div>
      <ScoreMeter score={result.score} />

      <div className="mt-7 pt-6 border-t border-rule">
        <FeedbackList title="Strengths" items={result.strengths} markerClass="text-sage" />
        <FeedbackList title="Weaknesses" items={result.weaknesses} markerClass="text-rust" />
        <FeedbackList title="Suggestions" items={result.suggestions} markerClass="text-accent-deep" />
      </div>

      <p className="font-mono text-xs text-muted pt-2 border-t border-rule">
        From {result.source === "pdf" ? "an uploaded PDF" : "pasted text"} ·{" "}
        {formatTimestamp(result.timestamp)}
      </p>
    </div>
  );
}