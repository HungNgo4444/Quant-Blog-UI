'use client';

import React, { useState, useEffect } from 'react';
import {
  Dashboard,
  Article,
  People,
  Category,
  Comment,
  Settings,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import {
  MenuIcon,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Home,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { clientCookies } from '../../services/TokenService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

interface AdminMenuItem {
  text: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const adminMenuItems: AdminMenuItem[] = [
  {
    text: 'Dashboard',
    href: '/admin',
    icon: <Dashboard className="w-5 h-5" />,
    description: 'Tổng quan hệ thống'
  },
  {
    text: 'Bài viết',
    href: '/admin/posts',
    icon: <Article className="w-5 h-5" />,
    description: 'Quản lý bài viết'
  },
    {
      text: 'Danh mục',
      href: '/admin/categories',
      icon: <Category className="w-5 h-5" />,
      description: 'Quản lý danh mục'
    },
  {
    text: 'Người dùng',
    href: '/admin/users',
    icon: <People className="w-5 h-5" />,
    description: 'Quản lý tài khoản'
  },
  {
    text: 'Thẻ',
    href: '/admin/tags',
    icon: <Tag className="w-5 h-5" />,
    description: 'Quản lý thẻ'
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { mode } = useAppSelector((state) => state.theme);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router, pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    router.push('/');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="py-3 px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-900 dark:bg-gray-900 text-white">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <p className="text-sm opacity-90">Quản trị blog</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-0">
        {adminMenuItems.map((item) => (
          <Link
            key={item.text}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`
              flex items-center px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
              ${isActive(item.href) 
                ? 'bg-primary/10 dark:bg-primary/20 border-r-4 border-gray-900 text-gray-900 dark:text-primary dark:border-primary font-semibold' 
                : 'text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <span className={`mr-3 ${isActive(item.href) ? 'text-gray-900 dark:text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
              {item.icon}
            </span>
            <div className="flex-1">
              <div className={isActive(item.href) ? 'font-semibold' : ''}>{item.text}</div>
              {item.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
              )}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="bg-transparent border-none shadow-none border-r border-gray-200 dark:border-gray-700 shadow-sm">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-gray-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className={`sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${scrolled ? 'shadow-lg' : ''}`}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDrawerToggle}
                  className="md:hidden"
                >
                  <MenuIcon className="w-5 h-5" />
                </Button>
                
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {adminMenuItems.find(item => isActive(item.href))?.text || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    {adminMenuItems.find(item => isActive(item.href))?.description || 'Tổng quan hệ thống'}
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleThemeToggle}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* Home button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hidden sm:flex"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Trang chủ
                </Button>

                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center h-9 px-2"
                  >
                    <Avatar className="h-7 w-7">
                      {user?.avatar ? (
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                      ) : (
                        <AvatarFallback className="text-xs bg-gray-300 dark:text-black">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </Button>

                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute z-50 right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            {user?.avatar ? (
                              <AvatarImage src={user?.avatar} alt={user?.name} />
                            ) : (
                              <AvatarFallback className="text-sm bg-gray-300 dark:text-black">
                                {user?.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Hồ sơ
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Click outside to close menus */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
} 