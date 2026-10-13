import React, { useEffect, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { GENRES, QUALITIES, RATING_OPTIONS, SORT_OPTIONS, YEAR_OPTIONS, LANGUAGE_OPTIONS } from '../../lib/constants';
import {
  FilterState,
  defaultOrderFor,
  isFiltered as hasActiveFilters,
  sameFilters,
} from '../../lib/movie-filters';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export type { FilterState };

interface MovieFiltersProps {
  /** The filters currently applied (from the URL). Edits here stay local until Search is pressed. */
  filters: FilterState;
  onApply: (next: FilterState) => void;
  onReset: () => void;
  totalCount?: number;
  /** True when totalCount only covers a capped scan of the catalog. */
  totalIsApproximate?: boolean;
}

export function MovieFilters({ filters, onApply, onReset, totalCount, totalIsApproximate }: MovieFiltersProps) {
  const isFiltered = hasActiveFilters(filters);

  // Draft copy of the form. Nothing is requested until the user presses Search (or Enter).
  const [draft, setDraft] = useState<FilterState>(filters);
  const appliedKey = JSON.stringify(filters);

  useEffect(() => {
    // Adopt external changes: Reset, back/forward, a shared link, or clicking a cast member.
    setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedKey]);

  const update = (patch: Partial<FilterState>) => setDraft((d) => ({ ...d, ...patch }));
  const isDirty = !sameFilters(draft, filters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ ...draft, query_term: draft.query_term.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 sm:p-5 rounded-lg bg-[#181818] border border-[#262626] space-y-4 shadow-sm"
    >
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            icon={<Search className="w-4 h-4 text-[#888888]" />}
            placeholder="Search by movie title, actor, director, or IMDb ID..."
            value={draft.query_term}
            onChange={(e) => update({ query_term: e.target.value })}
            className="bg-[#202020] border-[#333333] focus:border-[#E50914] focus:ring-[#E50914]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button type="submit" variant="primary" size="md" className="relative">
            <Search className="w-4 h-4" />
            Search
            {isDirty && (
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FFB020] border border-[#181818]"
                aria-label="Filters changed, press Search to apply"
              />
            )}
          </Button>

          {(isFiltered || isDirty) && (
            <Button type="button" variant="ghost" size="sm" onClick={onReset} className="text-xs hover:text-[#E50914]">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          )}

          {typeof totalCount === 'number' && (
            <div className="px-3 py-1.5  text-xs font-mono text-[#AAAAAA] whitespace-nowrap">
              <span className="text-[#E50914] font-bold">{totalCount.toLocaleString()}</span> movies{totalIsApproximate ? '+' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Specified Filter Sequence: Quality | Genre | Rating | Year | Language | Order By */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-1">
        {/* 1. Quality */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block">
            Quality:
          </label>
          <select
            value={draft.quality}
            onChange={(e) => update({ quality: e.target.value })}
            className="w-full bg-[#202020] border border-[#333333] text-white text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#E50914]"
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q} className="bg-[#202020] text-white">
                {q === 'all' ? 'All' : q === '2160p' ? '2160p (4K)' : q}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Genre */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block">
            Genre:
          </label>
          <select
            value={draft.genre}
            onChange={(e) => update({ genre: e.target.value })}
            className="w-full bg-[#202020] border border-[#333333] text-white text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#E50914]"
          >
            {GENRES.map((g) => (
              <option key={g} value={g} className="bg-[#202020] text-white">
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Rating */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block">
            Rating:
          </label>
          <select
            value={draft.minimum_rating}
            onChange={(e) => update({ minimum_rating: Number(e.target.value) })}
            className="w-full bg-[#202020] border border-[#333333] text-white text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#E50914]"
          >
            {RATING_OPTIONS.map((r) => (
              <option key={r.value} value={r.value} className="bg-[#202020] text-white">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Year */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block">
            Year:
          </label>
          <select
            value={draft.year}
            onChange={(e) => update({ year: e.target.value })}
            className="w-full bg-[#202020] border border-[#333333] text-white text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#E50914]"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y.value} value={y.value} className="bg-[#202020] text-white">
                {y.label}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Language */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block">
            Language:
          </label>
          <select
            value={draft.language}
            onChange={(e) => update({ language: e.target.value })}
            className="w-full bg-[#202020] border border-[#333333] text-white text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#E50914]"
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.value} value={l.value} className="bg-[#202020] text-white">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Order By */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block">
            Order By:
          </label>
          <select
            value={draft.sort_by}
            onChange={(e) => update({ sort_by: e.target.value as FilterState['sort_by'], order_by: defaultOrderFor(e.target.value as FilterState['sort_by']) })}
            className="w-full bg-[#202020] border border-[#333333] text-white text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-[#E50914]"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#202020] text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}