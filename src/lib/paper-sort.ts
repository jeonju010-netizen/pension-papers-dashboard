import { Paper } from "@/types/paper";

export type PaperSortOption = "newest" | "citations";

export const PAPER_SORT_LABELS: Record<PaperSortOption, string> = {
  newest: "최신순",
  citations: "인용순",
};

export function sortPapers(papers: Paper[], sortBy: PaperSortOption): Paper[] {
  const sorted = [...papers];

  if (sortBy === "citations") {
    sorted.sort(
      (a, b) =>
        (b.citationCount ?? 0) - (a.citationCount ?? 0) ||
        b.year - a.year ||
        a.title.localeCompare(b.title)
    );
    return sorted;
  }

  sorted.sort(
    (a, b) =>
      b.year - a.year ||
      (b.citationCount ?? 0) - (a.citationCount ?? 0) ||
      a.title.localeCompare(b.title)
  );
  return sorted;
}
