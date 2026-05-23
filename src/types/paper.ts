export type MainCategory =
  | "asset-allocation"
  | "asset-management"
  | "risk-management"
  | "performance-evaluation";

export type SubCategory = "equity" | "bond" | "alternative";

export interface Paper {
  id: string;
  openAlexId?: string;
  title: string;
  titleKo: string;
  authors: string[];
  year: number;
  journal: string;
  category: MainCategory;
  subCategory?: SubCategory;
  abstract: string;
  abstractKo: string;
  summaryKo: string;
  originalUrl: string;
  pdfUrl?: string;
  hasAiSummary?: boolean;
  countryCode?: string;
}

export const CATEGORY_LABELS: Record<MainCategory, string> = {
  "asset-allocation": "자산배분",
  "asset-management": "자산운용",
  "risk-management": "리스크관리",
  "performance-evaluation": "성과평가",
};

export const SUB_CATEGORY_LABELS: Record<SubCategory, string> = {
  equity: "주식",
  bond: "채권",
  alternative: "대체투자",
};

export const CATEGORY_COLORS: Record<MainCategory, string> = {
  "asset-allocation": "emerald",
  "asset-management": "blue",
  "risk-management": "amber",
  "performance-evaluation": "violet",
};
