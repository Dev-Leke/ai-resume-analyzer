import { getScoreTier } from "@/lib/score";

export default function ScoreMeter({ score }: { score: number }) {
  const tier = getScoreTier(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-serif text-5xl text-ink">{Math.round(clamped)}</span>
        <span className="font-mono text-sm text-muted">/100</span>
        <span className={`font-mono text-xs uppercase tracking-[0.1em] ml-2 ${tier.textClass}`}>
          {tier.label}
        </span>
      </div>
      <div className="relative h-2.5 bg-ink/10 rounded-full overflow-hidden">
        {/* reference ticks at 50 and 75 */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-paper/60 z-10" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-paper/60 z-10" />
        <div
          className={`h-full ${tier.bgClass} transition-all duration-700 rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}