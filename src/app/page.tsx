import { Dashboard } from "@/components/Dashboard";
import { fetchLatestPapers } from "@/lib/openalex";
import { papers as fallbackPapers } from "@/data/papers";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialPapers = fallbackPapers;
  let initialMeta = {
    source: "fallback",
    count: fallbackPapers.length,
    fetchedAt: new Date().toISOString(),
  };

  try {
    const papers = await fetchLatestPapers();
    if (papers.length > 0) {
      initialPapers = papers;
      initialMeta = {
        source: papers.some((p) => p.openAlexId?.startsWith("W"))
          ? "openalex"
          : "crossref",
        count: papers.length,
        fetchedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Initial paper fetch failed:", error);
  }

  return (
    <Dashboard initialPapers={initialPapers} initialMeta={initialMeta} />
  );
}
