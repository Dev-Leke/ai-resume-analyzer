export type ScoreTier = {
  label: string;
  textClass: string;
  bgClass: string;
};

export function getScoreTier(score: number): ScoreTier {
  if (score >= 75) {
    return { label: "Strong", textClass: "text-sage", bgClass: "bg-sage" };
  }
  if (score >= 50) {
    return { label: "Solid", textClass: "text-accent-deep", bgClass: "bg-accent" };
  }
  return { label: "Needs work", textClass: "text-rust", bgClass: "bg-rust" };
}

export function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}