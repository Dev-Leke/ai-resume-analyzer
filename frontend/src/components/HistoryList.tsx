import { AnalysisListItem } from "@/lib/types";
import { formatTimestamp, getScoreTier } from "@/lib/score";

export default function HistoryList({
  analyses,
  onSelect,
}: {
  analyses: AnalysisListItem[];
  onSelect: (id: string) => void;
}) {
  if (analyses.length === 0) {
    return (
      <p className="text-muted italic text-sm">
        No analyses yet. Run one from the Analyze tab and it&#x2019;ll show up here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-rule">
      {analyses.map((item) => {
        const tier = getScoreTier(item.score);
        return (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item.id)}
              className="w-full text-left py-4 flex items-start gap-4 hover:bg-ink/[0.03] transition-colors px-1 -mx-1 rounded-sm"
            >
              <span className={`flex-none mt-0.5 font-mono text-xs px-2 py-1 rounded-sm text-paper ${tier.bgClass}`}>
                {item.score}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-ink truncate">
                  {item.preview || "(no preview available)"}
                </span>
                <span className="block font-mono text-xs text-muted mt-1">
                  {item.source === "pdf" ? "PDF" : "Pasted text"} ·{" "}
                  {formatTimestamp(item.timestamp)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}