import { Paper } from "@/types/paper";

export function getSourceSiteLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    if (hostname.includes("doi.org")) return "DOI";
    if (hostname.includes("openalex.org")) return "OpenAlex";
    if (hostname.includes("ssrn.com")) return "SSRN";
    if (hostname.includes("cambridge.org")) return "Cambridge";
    if (hostname.includes("springer.com")) return "Springer";
    if (hostname.includes("wiley.com")) return "Wiley";
    if (hostname.includes("sciencedirect.com")) return "ScienceDirect";
    if (hostname.includes("tandfonline.com")) return "Taylor & Francis";
    if (hostname.includes("jstor.org")) return "JSTOR";

    const site = hostname.split(".")[0];
    return site.charAt(0).toUpperCase() + site.slice(1);
  } catch {
    return "원문";
  }
}

export function formatCitationCount(count?: number): string {
  if (count === undefined || count === null) return "-";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toLocaleString("ko-KR");
}

export function enrichPaper(paper: Paper): Paper {
  return {
    ...paper,
    citationCount: paper.citationCount ?? 0,
    sourceSite: paper.sourceSite ?? getSourceSiteLabel(paper.originalUrl),
  };
}

export function enrichPapers(papers: Paper[]): Paper[] {
  return papers.map(enrichPaper);
}
