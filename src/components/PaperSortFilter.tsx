"use client";

import {
  PAPER_SORT_LABELS,
  PaperSortOption,
} from "@/lib/paper-sort";

interface PaperSortFilterProps {
  sortBy: PaperSortOption;
  onSortChange: (sortBy: PaperSortOption) => void;
}

const SORT_OPTIONS: PaperSortOption[] = ["newest", "citations"];

export function PaperSortFilter({
  sortBy,
  onSortChange,
}: PaperSortFilterProps) {
  return (
    <div className="border-b border-slate-800 px-4 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          정렬
        </span>
        <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
          {SORT_OPTIONS.map((option) => {
            const active = sortBy === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSortChange(option)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {PAPER_SORT_LABELS[option]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
