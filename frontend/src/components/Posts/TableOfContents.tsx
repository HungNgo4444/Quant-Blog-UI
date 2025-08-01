'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { List, ChevronRight } from 'lucide-react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface NestedHeading extends HeadingItem {
  children: NestedHeading[];
}

interface TableOfContentsProps {
  headings: HeadingItem[];
  nestedHeadings: NestedHeading[];
  activeId?: string;
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  nestedHeadings,
  activeId,
  className = '',
}) => {
  // Don't render if there are no headings
  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const renderNestedHeading = (heading: NestedHeading, depth: number = 0) => {
    const isActive = activeId === heading.id;
    const paddingLeft = depth * 8; // 16px per level

    return (
      <div key={heading.id}>
        <button
          onClick={() => scrollToHeading(heading.id)}
          className={`
            w-full text-left py-2 px-3 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group
            ${isActive 
              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-l-3 border-blue-500' 
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }
          `}
          style={{ paddingLeft: `${12 + paddingLeft}px` }}
        >
          <div className="flex items-center gap-2">
            {depth > 0 && (
              <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50" />
            )}
            <span className={`
              text-sm leading-relaxed line-clamp-1
              ${heading.level === 1 ? 'font-semibold' : ''}
              ${heading.level === 2 ? 'font-medium' : ''}
              ${heading.level >= 3 ? 'font-normal' : ''}
            `}>
              {heading.text}
            </span>
          </div>
        </button>
        
        {heading.children.length > 0 && (
          <div className="ml-2">
            {heading.children.map((child) => 
              renderNestedHeading(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`lg:sticky lg:top-24 lg:max-h-[calc(100vh-160px)] overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <List className="h-5 w-5" />
          Mục lục
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="lg:max-h-[calc(100vh-280px)] max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="space-y-1">
            {nestedHeadings.map((heading) => 
              renderNestedHeading(heading)
            )}
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default TableOfContents; 