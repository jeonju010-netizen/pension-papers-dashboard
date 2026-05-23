# PRD: 글로벌 연기금 운용 논문 대시보드

## 1. 개요

### 1.1 제품명
**Pension Papers Dashboard** — 글로벌 연기금(Pension Fund) 운용 관련 최신 학술 논문을 탐색·요약·열람할 수 있는 인터랙티브 웹 대시보드

### 1.2 목적
연기금 운용 담당자, 리서치 애널리스트, 자산운용 실무자가 최신 학술 연구를 빠르게 파악하고, 주제별로 분류된 논문을 탐색하며, 선택한 논문의 원문을 한 화면에서 확인할 수 있도록 한다.

### 1.3 기술 스택
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: React 19 (Client Components for interactivity)
- **논문 수집**: [OpenAlex API](https://openalex.org/) (무료, API 키 불필요)
- **AI 요약**: OpenAI API (`gpt-4o-mini` 기본)

---

## 2. 사용자 및 사용 시나리오

### 2.1 타깃 사용자
| 페르소나 | 니즈 |
|---------|------|
| 연기금 CIO / PM | 자산배분·리스크관리 최신 트렌드 파악 |
| 리서치 애널리스트 | 주제별 논문 큐레이션 및 요약 검토 |
| 리스크·성과평가 담당 | 성과평가·리스크관리 논문 집중 탐색 |

### 2.2 핵심 사용 시나리오
1. 사용자가 대시보드에 접속한다.
2. 상단 또는 좌측 필터에서 **4대 주제** 중 하나를 선택한다.
3. 좌측 논문 목록에서 관심 논문에 **마우스를 올리면** 초록(Abstract)이 **팝업**으로 표시된다.
4. 논문을 **클릭**하면 우측 패널에 해당 논문의 **원문(PDF/링크)** 이 표시된다.
5. (자산운용 선택 시) 하위 분류(주식·채권·대체투자)로 추가 필터링한다.

---

## 3. 기능 요구사항

### 3.1 논문 분류 체계

| 대분류 | 코드 | 하위 분류 |
|--------|------|-----------|
| 자산배분 | `asset-allocation` | — |
| 자산운용 | `asset-management` | 주식(`equity`), 채권(`bond`), 대체투자(`alternative`) |
| 리스크관리 | `risk-management` | — |
| 성과평가 | `performance-evaluation` | — |

### 3.2 화면 구성 (2-Panel Layout)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: 제목 + 통계 (총 논문 수, 선택 주제)                  │
├──────────────────┬──────────────────────────────────────────┤
│  LEFT (35%)      │  RIGHT (65%)                             │
│                  │                                          │
│  [주제 필터 탭]   │  [선택 논문 메타정보]                     │
│  [하위 필터]      │  [한국어 요약]                            │
│                  │  [원문 PDF iframe / 외부 링크]             │
│  논문 목록        │                                          │
│  · 제목          │                                          │
│  · 저자·연도      │                                          │
│  · hover → 초록   │                                          │
│    팝업          │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

### 3.3 인터랙션 상세

| 기능 | 트리거 | 동작 |
|------|--------|------|
| 초록 팝업 | 논문 항목 `mouseenter` | 마우스 근처에 초록 텍스트 팝업 표시, `mouseleave` 시 숨김 |
| 논문 선택 | 논문 항목 `click` | 우측 패널에 해당 논문 원문·요약 로드, 선택 항목 하이라이트 |
| 주제 필터 | 탭/버튼 클릭 | 해당 주제 논문만 목록 표시, 첫 논문 자동 선택 |
| 하위 필터 | (자산운용 시) 버튼 클릭 | 주식/채권/대체투자 세부 필터 |

### 3.4 논문 데이터 필드

```typescript
interface Paper {
  id: string;
  title: string;           // 영문 원제
  titleKo: string;         // 한국어 제목
  authors: string[];
  year: number;
  journal: string;
  category: MainCategory;
  subCategory?: SubCategory;
  abstract: string;        // 영문 초록
  abstractKo: string;      // 한국어 초록
  summaryKo: string;       // 한국어 핵심 요약 (3~5문장)
  originalUrl: string;     // 원문 PDF 또는 DOI 링크
  pdfUrl?: string;         // 임베드 가능 PDF URL (선택)
}
```

### 3.5 비기능 요구사항
- **반응형**: 1024px 이상 2-panel, 미만 시 세로 스택
- **접근성**: 키보드 포커스, `aria-selected` on list items
- **성능**: 클라이언트 사이드 필터링 (초기 데이터 ~20건)
- **확장성**: 추후 Semantic Scholar / CrossRef API 연동 가능한 데이터 레이어 분리

---

## 4. UI/UX 가이드

### 4.1 디자인 톤
- 전문적·신뢰감 있는 금융 대시보드 스타일
- 배경: `#0f172a` (slate-900), 카드: `#1e293b` (slate-800)
- 강조색: `#3b82f6` (blue-500), 카테고리별 구분 색상

### 4.2 카테고리 색상
| 주제 | 색상 |
|------|------|
| 자산배분 | emerald |
| 자산운용 | blue |
| 리스크관리 | amber |
| 성과평가 | violet |

### 4.3 초록 팝업
- 최대 너비 360px, 최대 높이 280px, 스크롤 가능
- 그림자 + border, z-index 50
- 마우스 커서 위치 기준 offset (+16px)

---

## 5. MVP 범위

### 5.1 포함 (v1.0)
- [x] 4대 주제 분류 + 자산운용 하위 3분류
- [x] 좌측 논문 목록 + hover 초록 팝업
- [x] 우측 원문 뷰어 (PDF iframe 또는 외부 링크)
- [x] 한국어 요약 표시
- [x] 정적 샘플 데이터 16건 (fallback)

### 5.2 포함 (v2.0) — 자동 수집 & AI 요약
- [x] OpenAlex API 기반 최신 논문 자동 수집 (2022년 이후, 8개 검색 쿼리)
- [x] 키워드 기반 4대 주제 자동 분류
- [x] 24시간 로컬 캐시 (`.cache/papers.json`)
- [x] OpenAI API 한국어 제목·초록 번역 + 핵심 요약 (3~5문장)
- [x] 요약 결과 캐시 (`.cache/summaries/{id}.json`)
- [x] 헤더「최신 논문 수집」버튼 (강제 refresh)
- [x] OPENAI_API_KEY 미설정 시 초록 기반 fallback 요약

### 5.3 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/papers` | 캐시 또는 OpenAlex에서 논문 목록 반환 |
| GET | `/api/papers?refresh=true` | 캐시 무시, OpenAlex 재수집 |
| POST | `/api/papers/summarize` | AI 요약 생성 `{ paperId, paper?, force? }` |

### 5.4 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `OPENAI_API_KEY` | AI 요약 시 | OpenAI API 키 |
| `OPENAI_MODEL` | 선택 | 기본 `gpt-4o-mini` |
| `OPENALEX_EMAIL` | 선택 | OpenAlex polite pool 등록 이메일 |

### 5.5 제외 (향후)
- 사용자 로그인 / 북마크
- Semantic Scholar / CrossRef 추가 연동
- PDF 업로드
- 배치 자동 요약 (전체 논문 일괄 처리)

---

## 6. 성공 지표
- 주제 필터 전환 시 200ms 이내 목록 갱신
- 초록 팝업 표시 지연 < 100ms
- 모바일·데스크톱 레이아웃 정상 렌더링

---

## 7. 일정 (MVP)

| 단계 | 작업 | 상태 |
|------|------|------|
| 1 | PRD 작성 | ✅ |
| 2 | Next.js 프로젝트 셋업 | ✅ |
| 3 | 데이터 모델 + 샘플 논문 | ✅ |
| 4 | Dashboard UI 구현 | ✅ |
| 5 | OpenAlex 자동 수집 + AI 요약 | ✅ |
| 6 | 로컬 dev 서버 검증 | ✅ |
