'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Star,
  Users,
  Tag,
  Trophy,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface QASidebarProps {
  
}

const QASidebar: React.FC<QASidebarProps> = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: 'Trang chủ',
      href: '/community',
      icon: Home,
      exact: true,
    },
    {
      title: 'Câu hỏi của tôi',
      href: '/community/my-questions',
      icon: MessageCircle,
    },
    {
      title: 'Câu trả lời của tôi',
      href: '/community/my-answers',
      icon: BookOpen,
    },
    {
      title: 'Người dùng',
      href: '/community/users',
      icon: Users,
    },
    {
      title: 'Giới thiệu',
      href: '/community/about',
      icon: HelpCircle,
    },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getNavItemClass = (href: string, exact: boolean = false) => {
    const baseClass = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";

    if (isActive(href, exact)) {
      return `${baseClass} bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 border-l-4 border-gray-600`;
    }
    
    return `${baseClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`;
  };

  return (
    <div className="w-[250px] ">
      <div className="p-4 space-y-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-y-auto pb-20">
        {/* Header */}
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Cộng đồng</h2>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Chính
          </div>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={getNavItemClass(item.href, item.exact)}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Mẹo hay
            </h3>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-200 mb-3">
            Viết câu hỏi rõ ràng và cung cấp ví dụ để nhận được câu trả lời tốt nhất!
          </p>
          <Link 
            href="/community"
            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Tìm hiểu thêm →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QASidebar; 