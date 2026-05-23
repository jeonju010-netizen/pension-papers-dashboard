import { NextRequest, NextResponse } from "next/server";
import { fetchLatestPapers } from "@/lib/openalex";
import { getCachedPapers, setCachedPapers } from "@/lib/cache";
import { papers as fallbackPapers } from "@/data/papers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const refresh = request.nextUrl.searchParams.get("refresh") === "true";

  try {
    if (!refresh) {
      const cached = await getCachedPapers();
      if (cached) {
        return NextResponse.json({
          papers: cached.papers,
          meta: {
            source: "cache",
            count: cached.papers.length,
            fetchedAt: cached.fetchedAt,
          },
        });
      }
    }

    const papers = await fetchLatestPapers();

    if (papers.length < 8) {
      const existingIds = new Set(papers.map((p) => p.id));
      for (const fp of fallbackPapers) {
        if (!existingIds.has(fp.id)) papers.push(fp);
      }
    }

    if (papers.length === 0) {
      return NextResponse.json({
        papers: fallbackPapers,
        meta: {
          source: "fallback",
          count: fallbackPapers.length,
          fetchedAt: new Date().toISOString(),
          message:
            "논문 API 수집 실패 — 샘플 데이터를 사용합니다. CrossRef/OpenAlex 연결을 확인해 주세요.",
        },
      });
    }

    await setCachedPapers(papers);

    const hasOpenAlex = papers.some((p) => p.openAlexId?.startsWith("W"));

    return NextResponse.json({
      papers,
      meta: {
        source: hasOpenAlex ? "openalex" : "crossref",
        count: papers.length,
        fetchedAt: new Date().toISOString(),
        openAlexEnabled: hasOpenAlex,
      },
    });
  } catch (error) {
    console.error("Papers API error:", error);
    return NextResponse.json({
      papers: fallbackPapers,
      meta: {
        source: "fallback",
        count: fallbackPapers.length,
        fetchedAt: new Date().toISOString(),
        message: "오류 발생 — 샘플 데이터 사용",
      },
    });
  }
}
