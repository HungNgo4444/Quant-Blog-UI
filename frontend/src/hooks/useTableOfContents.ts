import React, { useMemo } from 'react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  element?: HTMLElement;
}

interface TableOfContentsData {
  headings: HeadingItem[];
  nestedHeadings: NestedHeading[];
}

interface NestedHeading extends HeadingItem {
  children: NestedHeading[];
}

// Helper function to generate heading ID consistently
export const generateHeadingId = (text: string, level: number, index: number): string => {
  return `heading-${level}-${index}-${text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)}`;
};

export const useTableOfContents = (content: string): TableOfContentsData => {
  return useMemo(() => {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find all heading elements
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const headings: HeadingItem[] = Array.from(headingElements).map((element, index) => {
      const level = parseInt(element.tagName.charAt(1));
      let text = element.textContent || '';
      
      // Clean up text by removing extra whitespace
      text = text.trim();
      
      // Generate unique ID using the same function
      const id = generateHeadingId(text, level, index);
      
      return {
        id,
        text,
        level,
      };
    });

    // Create nested structure
    const nestedHeadings: NestedHeading[] = [];
    const stack: NestedHeading[] = [];

    headings.forEach((heading) => {
      const nestedHeading: NestedHeading = {
        ...heading,
        children: [],
      };

      // Remove items from stack that are at the same level or deeper
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      // If stack is empty, this is a top-level heading
      if (stack.length === 0) {
        nestedHeadings.push(nestedHeading);
      } else {
        // Add as child to the last item in stack
        stack[stack.length - 1].children.push(nestedHeading);
      }

      // Add current heading to stack
      stack.push(nestedHeading);
    });

    return {
      headings,
      nestedHeadings,
    };
  }, [content]);
};

// Hook to handle active heading based on scroll position
export const useActiveHeading = (headings: HeadingItem[]) => {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    // Observe all headings in the actual DOM
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return activeId;
}; 