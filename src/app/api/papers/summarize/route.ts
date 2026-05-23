import { NextRequest, NextResponse } from "next/server";
import { getPaperFromCache } from "@/lib/cache";
import { generatePaperSummary } from "@/lib/summarizer";
import { Paper } from "@/types/paper";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      paperId?: string;
      paper?: Paper;
      force?: boolean;
    };

    let paper: Paper | null = body.paper ?? null;

    if (!paper && body.paperId) {
      paper = await getPaperFromCache(body.paperId);
    }

    if (!paper) {
      return NextResponse.json(
        { error: "논문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const result = await generatePaperSummary(paper, body.force ?? false);

    return NextResponse.json({
      paperId: paper.id,
      ...result,
    });
  } catch (error) {
    console.error("Summarize API error:", error);
    return NextResponse.json(
      { error: "AI 요약 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
