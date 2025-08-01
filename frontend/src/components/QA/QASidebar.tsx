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
  User,
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
      href: '/qa',
      icon: Home,
      exact: true,
    },
    {
      title: 'Câu hỏi của tôi',
      href: '/qa/my-questions',
      icon: MessageCircle,
    },
    {
      title: 'Câu trả lời của tôi',
      href: '/qa/my-answers',
      icon: BookOpen,
    },
  ];

  const browseItems = [
    {
      title: 'Phổ biến',
      href: '/qa?sort=most_voted',
      icon: TrendingUp,
    },
    {
      title: 'Mới nhất',
      href: '/qa?sort=newest',
      icon: Clock,
    },
    {
      title: 'Chưa trả lời',
      href: '/qa/unanswered',
      icon: HelpCircle,
    },
    {
      title: 'Tags',
      href: '/qa/tags',
      icon: Tag,
    },
  ];

  const quickStats = [
    {
      label: 'Câu hỏi',
      value: '2,847',
      icon: MessageCircle,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Câu trả lời',
      value: '8,521',
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Người dùng',
      value: '1,234',
      icon: User,
      color: 'text-purple-600 dark:text-purple-400',
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Hỏi & Đáp</h2>
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

        {/* Quick Stats */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Thống kê
          </h3>
          <div className="space-y-3">
            {quickStats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

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
            href="/qa/help" 
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