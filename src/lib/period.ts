export const DEFAULT_YEAR_FROM = 2022;

export function getDefaultYearTo(): number {
  return new Date().getFullYear();
}

export function buildYearFilter(from: number, to: number): string {
  const years: string[] = [];
  for (let year = from; year <= to; year++) {
    years.push(String(year));
  }
  return years.join("|");
}

export function clampYearRange(
  from: number,
  to: number
): { yearFrom: number; yearTo: number } {
  const minYear = 2000;
  const maxYear = getDefaultYearTo() + 1;
  let yearFrom = Math.min(Math.max(from, minYear), maxYear);
  let yearTo = Math.min(Math.max(to, minYear), maxYear);
  if (yearFrom > yearTo) [yearFrom, yearTo] = [yearTo, yearFrom];
  return { yearFrom, yearTo };
}

export function filterPapersByYear<T extends { year: number }>(
  papers: T[],
  yearFrom: number,
  yearTo: number
): T[] {
  return papers.filter((p) => p.year >= yearFrom && p.year <= yearTo);
}

export interface FetchPeriod {
  yearFrom: number;
  yearTo: number;
}
