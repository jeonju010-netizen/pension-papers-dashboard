import { MainCategory, SubCategory } from "@/types/paper";

interface CategoryRule {
  category: MainCategory;
  subCategory?: SubCategory;
  keywords: string[];
  weight?: number;
}

const RULES: CategoryRule[] = [
  {
    category: "performance-evaluation",
    keywords: [
      "performance",
      "attribution",
      "benchmark",
      "alpha",
      "sharpe",
      "peer group",
      "evaluation",
      "excess return",
      "tracking error",
    ],
    weight: 1.2,
  },
  {
    category: "risk-management",
    keywords: [
      "risk management",
      "risk",
      "var",
      "stress test",
      "climate risk",
      "liquidity",
      "volatility",
      "drawdown",
      "hedge",
      "erm",
      "solvency",
    ],
    weight: 1.1,
  },
  {
    category: "asset-allocation",
    keywords: [
      "asset allocation",
      "strategic allocation",
      "glide path",
      "rebalancing",
      "portfolio construction",
      "target date",
      "saa",
      "tactical allocation",
      "allocation policy",
    ],
    weight: 1.3,
  },
  {
    category: "asset-management",
    subCategory: "equity",
    keywords: [
      "equity",
      "stock",
      "shares",
      "esg",
      "active management",
      "index fund",
      "passive",
    ],
  },
  {
    category: "asset-management",
    subCategory: "bond",
    keywords: [
      "bond",
      "fixed income",
      "credit",
      "ldi",
      "liability driven",
      "immunization",
      "yield",
      "duration",
      "treasury",
    ],
  },
  {
    category: "asset-management",
    subCategory: "alternative",
    keywords: [
      "private equity",
      "infrastructure",
      "hedge fund",
      "alternative investment",
      "real asset",
      "real estate",
      "private market",
      "illiquid",
    ],
  },
];

function scoreRule(text: string, rule: CategoryRule): number {
  let score = 0;
  for (const kw of rule.keywords) {
    if (text.includes(kw)) score += rule.weight ?? 1;
  }
  return score;
}

export function categorizePaper(
  title: string,
  abstract: string
): { category: MainCategory; subCategory?: SubCategory } {
  const text = `${title} ${abstract}`.toLowerCase();

  let bestCategory: MainCategory = "asset-allocation";
  let bestSub: SubCategory | undefined;
  let bestScore = 0;

  const categoryScores: Partial<Record<MainCategory, number>> = {};
  const subScores: Partial<Record<SubCategory, number>> = {};

  for (const rule of RULES) {
    const score = scoreRule(text, rule);
    if (score === 0) continue;

    if (rule.subCategory) {
      subScores[rule.subCategory] = (subScores[rule.subCategory] ?? 0) + score;
      categoryScores["asset-management"] =
        (categoryScores["asset-management"] ?? 0) + score;
    } else {
      categoryScores[rule.category] =
        (categoryScores[rule.category] ?? 0) + score;
    }
  }

  for (const [cat, score] of Object.entries(categoryScores) as [
    MainCategory,
    number,
  ][]) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  if (bestCategory === "asset-management") {
    let topSub: SubCategory = "equity";
    let topSubScore = 0;
    for (const [sub, score] of Object.entries(subScores) as [
      SubCategory,
      number,
    ][]) {
      if (score > topSubScore) {
        topSubScore = score;
        topSub = sub;
      }
    }
    bestSub = topSubScore > 0 ? topSub : "equity";
  }

  if (bestScore === 0) {
    if (text.includes("pension") || text.includes("retirement")) {
      return { category: "asset-allocation" };
    }
    return { category: "asset-management", subCategory: "equity" };
  }

  return { category: bestCategory, subCategory: bestSub };
}
