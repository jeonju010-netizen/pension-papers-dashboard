import { Dashboard } from "@/components/Dashboard";
import { fetchLatestPapers } from "@/lib/openalex";
import { papers as fallbackPapers } from "@/data/papers";
import { enrichPapers } from "@/lib/source";
import { DEFAULT_YEAR_FROM, getDefaultYearTo } from "@/lib/period";

export const dynamic = "force-dynamic";

export default async function Home() {
  const period = { yearFrom: DEFAULT_YEAR_FROM, yearTo: getDefaultYearTo() };
  let initialPapers = enrichPapers(fallbackPapers);
  let initialMeta = {
    source: "fallback",
    count: fallbackPapers.length,
    fetchedAt: new Date().toISOString(),
    yearFrom: period.yearFrom,
    yearTo: period.yearTo,
  };

  try {
    const papers = await fetchLatestPapers(period);
    if (papers.length > 0) {
      initialPapers = papers;
      initialMeta = {
        source: papers.some((p) => p.openAlexId?.startsWith("W"))
          ? "openalex"
          : "crossref",
        count: papers.length,
        fetchedAt: new Date().toISOString(),
        yearFrom: period.yearFrom,
        yearTo: period.yearTo,
      };
    }
  } catch (error) {
    console.error("Initial paper fetch failed:", error);
  }

  return (
    <Dashboard initialPapers={initialPapers} initialMeta={initialMeta} />
  );
}
