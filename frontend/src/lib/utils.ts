export function cn(...classes: (string | undefined | null | false | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function cleanQuestionText(rawText: string): string {
  if (!rawText) return "";
  // Strip markdown bold or leading numbers/bullets (e.g., "1. ", "1) ", "**1. ", "- ")
  return rawText
    .replace(/^(\*{0,2}\d+[\.\)]\s*|\-\s*|\*\s*)/g, "")
    .replace(/^\*{2}|\*{2}$/g, "")
    .trim();
}

export function extractNumericalScore(scoreText: string): number {
  if (!scoreText) return 7;
  // Match patterns like "8/10", "8.5/10", "8 out of 10", "Score: 8"
  const matchFraction = scoreText.match(/(\d+(?:\.\d+)?)\s*(?:\/|\s+out of\s+)\s*10/i);
  if (matchFraction && matchFraction[1]) {
    const val = parseFloat(matchFraction[1]);
    if (!isNaN(val)) return Math.min(10, Math.max(0, val));
  }

  const matchFirstNum = scoreText.match(/\b([0-9]|10)(?:\.([0-9]))?\b/);
  if (matchFirstNum && matchFirstNum[0]) {
    const val = parseFloat(matchFirstNum[0]);
    if (!isNaN(val)) return Math.min(10, Math.max(0, val));
  }

  return 7;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

