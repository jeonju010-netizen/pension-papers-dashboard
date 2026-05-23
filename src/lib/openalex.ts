import { Paper } from "@/types/paper";
import { categorizePaper } from "./categorizer";
import { fetchLatestPapers as fetchFromCrossRef } from "./crossref";
import {
  extractCountryFromAuthorships,
  inferCountryFromText,
} from "./country";

const OPENALEX_BASE = "https://api.openalex.org/works";
const API_KEY = process.env.OPENALEX_API_KEY;
const MAILTO = process.env.OPENALEX_EMAIL ?? "pension-dashboard@example.com";

/** search(유료) 대신 filter list(무료) 사용 */
const FILTER_QUERIES = [
  "title.search:pension fund,publication_year:2022|2023|2024|2025|2026",
  "title.search:pension investment,publication_year:2022|2023|2024|2025|2026",
  "title.search:pension asset allocation,publication_year:2022|2023|2024|2025|2026",
  "title.search:pension risk management,publication_year:2022|2023|2024|2025|2026",
  "title.search:pension performance,publication_year:2022|2023|2024|2025|2026",
  "title.search:retirement fund investment,publication_year:2022|2023|2024|2025|2026",
  "title.search:defined benefit pension,publication_year:2022|2023|2024|2025|2026",
  "title.search:public pension,publication_year:2022|2023|2024|2025|2026",
];

interface OpenAlexWork {
  id: string;
  title: string;
  publication_year: number | null;
  abstract_inverted_index: Record<string, number[]> | null;
  doi: string | null;
  authorships: {
    author: { display_name: string };
    countries?: string[];
    institutions?: { country_code?: string }[];
  }[];
  primary_location: {
    source?: { display_name: string };
    landing_page_url?: string;
    pdf_url?: string;
  } | null;
  open_access?: { oa_url?: string };
}

interface OpenAlexResponse {
  results: OpenAlexWork[];
}

function reconstructAbstract(
  invertedIndex: Record<string, number[]> | null
): string {
  if (!invertedIndex) return "";
  const tokens: [number, string][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) tokens.push([pos, word]);
  }
  tokens.sort((a, b) => a[0] - b[0]);
  return tokens.map((t) => t[1]).join(" ");
}

function isRelevant(title: string, abstract: string): boolean {
  const text = `${title} ${abstract}`.toLowerCase();
  const core = ["pension", "retirement", "superannuation", "provident fund"];
  if (!core.some((kw) => text.includes(kw))) return false;

  const financeCtx = [
    "fund",
    "investment",
    "portfolio",
    "asset",
    "return",
    "risk",
    "allocation",
    "benefit",
    "liability",
    "governance",
  ];
  return financeCtx.some((kw) => text.includes(kw));
}

function mapWorkToPaper(work: OpenAlexWork): Paper | null {
  const abstract = reconstructAbstract(work.abstract_inverted_index);
  const title = work.title?.replace(/\s+/g, " ").trim();
  if (!title) return null;

  const year = work.publication_year ?? new Date().getFullYear();
  const maxYear = new Date().getFullYear() + 1;
  if (year < 2022 || year > maxYear) return null;
  if (!isRelevant(title, abstract)) return null;

  const { category, subCategory } = categorizePaper(title, abstract);
  const oaId = work.id.replace("https://openalex.org/", "");
  const countryCode =
    extractCountryFromAuthorships(work.authorships) ??
    inferCountryFromText(`${title} ${abstract}`);

  return {
    id: oaId,
    openAlexId: oaId,
    title,
    titleKo: title,
    authors:
      work.authorships
        .map((a) => a.author?.display_name)
        .filter(Boolean)
        .slice(0, 5) || ["Unknown"],
    year,
    journal: work.primary_location?.source?.display_name ?? "Academic Journal",
    category,
    subCategory,
    abstract: abstract || "Abstract not available for this paper.",
    abstractKo: abstract || "이 논문의 초록 정보가 제공되지 않습니다.",
    summaryKo: "",
    originalUrl:
      work.primary_location?.landing_page_url ??
      work.doi ??
      work.open_access?.oa_url ??
      `https://openalex.org/${oaId}`,
    pdfUrl:
      work.primary_location?.pdf_url ?? work.open_access?.oa_url ?? undefined,
    hasAiSummary: false,
    countryCode,
  };
}

async function fetchOpenAlexFilter(filter: string): Promise<OpenAlexWork[]> {
  const params = new URLSearchParams({
    filter,
    sort: "publication_date:desc",
    per_page: "15",
    mailto: MAILTO,
  });
  if (API_KEY) params.set("api_key", API_KEY);

  const res = await fetch(`${OPENALEX_BASE}?${params}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`OpenAlex filter failed [${filter}]: ${res.status}`);
    return [];
  }

  const data = (await res.json()) as OpenAlexResponse;
  return data.results ?? [];
}

async function fetchFromOpenAlex(): Promise<Paper[]> {
  const results = await Promise.all(FILTER_QUERIES.map(fetchOpenAlexFilter));
  const seen = new Set<string>();
  const papers: Paper[] = [];

  for (const batch of results) {
    for (const work of batch) {
      const id = work.id.replace("https://openalex.org/", "");
      if (seen.has(id)) continue;
      seen.add(id);
      const paper = mapWorkToPaper(work);
      if (paper) papers.push(paper);
    }
  }

  return papers;
}

/** OpenAlex filter(주) + CrossRef(보조) 병합 수집 */
export async function fetchLatestPapers(): Promise<Paper[]> {
  const [openalexPapers, crossrefPapers] = await Promise.all([
    fetchFromOpenAlex(),
    fetchFromCrossRef(),
  ]);

  const seen = new Set<string>();
  const merged: Paper[] = [];

  for (const paper of [...openalexPapers, ...crossrefPapers]) {
    const key = paper.id;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(paper);
  }

  merged.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return merged.slice(0, 60);
}

export interface FetchMeta {
  source: "openalex" | "crossref" | "mixed" | "fallback";
  count: number;
  fetchedAt: string;
}
