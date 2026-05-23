"use client";

import { useCallback, useMemo, useState } from "react";
import { Paper, MainCategory, SubCategory } from "@/types/paper";
import { CategoryFilter } from "./CategoryFilter";
import { PaperList } from "./PaperList";
import { PaperViewer } from "./PaperViewer";

interface PapersMeta {
  source: string;
  count: number;
  fetchedAt: string;
  message?: string;
}

interface DashboardProps {
  initialPapers: Paper[];
  initialMeta: PapersMeta;
}

export function Dashboard({ initialPapers, initialMeta }: DashboardProps) {
  const [papers, setPapers] = useState<Paper[]>(initialPapers);
  const [meta, setMeta] = useState<PapersMeta>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<MainCategory | "all">(
    "all"
  );
  const [activeSubCategory, setActiveSubCategory] = useState<
    SubCategory | "all"
  >("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPapers[0]?.id ?? null
  );

  const loadPapers = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/papers${refresh ? "?refresh=true" : ""}`
      );
      if (!res.ok) throw new Error("논문 목록을 불러오지 못했습니다.");

      const data = await res.json();
      setPapers(data.papers);
      setMeta(data.meta);
      setSelectedId(data.papers[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory)
        return false;
      if (
        activeCategory === "asset-management" &&
        activeSubCategory !== "all" &&
        p.subCategory !== activeSubCategory
      )
        return false;
      return true;
    });
  }, [papers, activeCategory, activeSubCategory]);

  const selectedPaper = useMemo(() => {
    if (filteredPapers.length === 0) return null;
    if (selectedId) {
      const found = filteredPapers.find((p) => p.id === selectedId);
      if (found) return found;
    }
    return filteredPapers[0];
  }, [filteredPapers, selectedId]);

  const counts = useMemo(() => {
    const result: Record<MainCategory | "all", number> = {
      all: papers.length,
      "asset-allocation": 0,
      "asset-management": 0,
      "risk-management": 0,
      "performance-evaluation": 0,
    };
    papers.forEach((p) => {
      result[p.category]++;
    });
    return result;
  }, [papers]);

  const handleCategoryChange = (cat: MainCategory | "all") => {
    setActiveCategory(cat);
    if (cat !== "asset-management") {
      setActiveSubCategory("all");
    }
  };

  const handlePaperUpdate = (updated: Paper) => {
    setPapers((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelectedId(updated.id);
  };

  const formatFetchedAt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur">
        <div>
          <h1 className="text-lg font-bold text-white">
            글로벌 연기금 운용 논문 대시보드
          </h1>
          <p className="text-xs text-slate-500">
            {loading
              ? "논문 수집 중..."
              : `${meta.source === "openalex" || meta.source === "mixed" ? "OpenAlex+CrossRef" : meta.source === "crossref" ? "CrossRef" : meta.source === "cache" ? "캐시" : meta.source} · ${meta.count} papers · ${formatFetchedAt(meta.fetchedAt)}`}
            {(meta.source === "openalex" ||
              meta.source === "crossref" ||
              meta.source === "mixed") && (
              <span className="ml-2 text-emerald-500">● 실시간 수집</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => loadPapers(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {refreshing ? "수집 중..." : "최신 논문 수집"}
          </button>
          <div className="hidden items-center gap-4 sm:flex">
            <Stat label="자산배분" value={counts["asset-allocation"]} color="text-emerald-400" />
            <Stat label="자산운용" value={counts["asset-management"]} color="text-blue-400" />
            <Stat label="리스크관리" value={counts["risk-management"]} color="text-amber-400" />
            <Stat label="성과평가" value={counts["performance-evaluation"]} color="text-violet-400" />
          </div>
        </div>
      </header>

      {error && (
        <div className="border-b border-red-900/50 bg-red-950/30 px-6 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {meta.message && (
        <div className="border-b border-amber-900/50 bg-amber-950/20 px-6 py-2 text-xs text-amber-400">
          {meta.message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <aside className="flex w-full flex-col border-b border-slate-800 lg:w-[380px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <CategoryFilter
            activeCategory={activeCategory}
            activeSubCategory={activeSubCategory}
            onCategoryChange={handleCategoryChange}
            onSubCategoryChange={setActiveSubCategory}
            counts={counts}
          />
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-slate-500">
              {loading
                ? "불러오는 중..."
                : `${filteredPapers.length}건 · 마우스를 올리면 초록 확인`}
            </span>
          </div>
          {loading ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
                <p className="text-xs text-slate-500">
                  논문 DB에서 최신 논문 수집 중...
                </p>
              </div>
            </div>
          ) : (
            <PaperList
              papers={filteredPapers}
              selectedId={selectedPaper?.id ?? null}
              onSelect={(paper) => setSelectedId(paper.id)}
              activeCategory={activeCategory}
              activeSubCategory={activeSubCategory}
            />
          )}
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden bg-slate-900/30">
          <PaperViewer
            key={selectedPaper?.id ?? "empty"}
            paper={selectedPaper}
            onPaperUpdate={handlePaperUpdate}
          />
        </main>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
