'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Filter, RotateCcw } from 'lucide-react';

export type SortOption = 'newest' | 'oldest' | 'most_voted' | 'most_answered' | 'most_viewed';

interface SortingControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
  onClearFilters?: () => void;
  placeholder?: string;
  showSearch?: boolean;
  customSortOptions?: Array<{
    value: SortOption;
    label: string;
  }>;
}

const defaultSortOptions = [
  { value: 'newest' as SortOption, label: 'Mới nhất' },
  { value: 'oldest' as SortOption, label: 'Cũ nhất' },
  { value: 'most_voted' as SortOption, label: 'Nhiều lượt vote nhất' },
  { value: 'most_answered' as SortOption, label: 'Nhiều câu trả lời nhất' },
  { value: 'most_viewed' as SortOption, label: 'Nhiều lượt xem nhất' },
];

export default function SortingControls({
  sortBy,
  onSortChange,
  searchTerm = '',
  onSearchChange,
  onClearFilters,
  placeholder = 'Tìm kiếm...',
  showSearch = true,
  customSortOptions,
}: SortingControlsProps) {
  const sortOptions = customSortOptions || defaultSortOptions;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  const handleClearFilters = () => {
    onSearchChange?.('');
    onSortChange('newest');
    onClearFilters?.();
  };

  const hasActiveFilters = searchTerm || sortBy !== 'newest';

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border shadow-sm">
      {showSearch && (
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}