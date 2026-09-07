import React from 'react';
import { Search, X } from 'lucide-react';

export interface FilterCategory<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  badgeVariant?: 'violet' | 'cyan' | 'slate' | 'danger';
}

export interface SortOption<T extends string = string> {
  id: T;
  label: string;
}

export interface FilterBarProps<C extends string = string, S extends string = string> {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  categories?: FilterCategory<C>[];
  selectedCategory?: C;
  onCategoryChange?: (category: C) => void;
  sortOptions?: SortOption<S>[];
  selectedSort?: S;
  onSortChange?: (sort: S) => void;
  rightActions?: React.ReactNode;
  className?: string;
}

export function FilterBar<C extends string = string, S extends string = string>({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  categories = [],
  selectedCategory,
  onCategoryChange,
  sortOptions = [],
  selectedSort,
  onSortChange,
  rightActions,
  className = '',
}: FilterBarProps<C, S>) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl ${className}`}
    >
      {/* Categories & Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange?.(cat.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#7C3AED]/25 to-[#22D3EE]/25 text-white border border-[#7C3AED]/50 shadow-[0_0_16px_rgba(124,58,237,0.25)]'
                  : 'bg-white/5 text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/10 border border-white/10'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-[#22D3EE]' : 'text-[#8A8A93]'
                  }`}
                />
              )}
              <span>{cat.label}</span>
              {typeof cat.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-[#8A8A93]'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-64 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8A8A93]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#F5F5F7] placeholder-[#8A8A93] focus:outline-none focus:border-[#7C3AED]/60 focus:ring-1 focus:ring-[#7C3AED]/40 transition-all font-sans"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-[#8A8A93] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Pill Buttons */}
        {sortOptions.length > 0 && (
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-mono">
            <span className="text-[10px] text-[#8A8A93] px-2 font-sans">Sort:</span>
            {sortOptions.map((opt) => {
              const isSelected = selectedSort === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSortChange?.(opt.id)}
                  className={`px-2.5 py-0.5 rounded-xl uppercase font-medium transition-all text-[11px] cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] text-white shadow-sm'
                      : 'text-[#8A8A93] hover:text-[#F5F5F7]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Optional Right Action Buttons (Refresh, Clear, etc.) */}
        {rightActions}
      </div>
    </div>
  );
}
