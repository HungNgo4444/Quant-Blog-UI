'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  useScrollTrigger,
  Slide,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close,
  LightMode,
  DarkMode,
  Person,
  Logout,
  Dashboard,
  Article,
  Search,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';
import { logoutUser } from '../../store/slices/authSlice';

function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { mode } = useAppSelector((state) => state.theme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    handleUserMenuClose();
  };

  const navigationItems = [
    { label: 'Trang chủ', href: '/', active: pathname === '/' },
    { label: 'Bài viết', href: '/posts', active: pathname.startsWith('/posts') },
    { label: 'Thể loại', href: '/categories', active: pathname.startsWith('/categories') },
    { label: 'Về chúng tôi', href: '/about', active: pathname === '/about' },
  ];

  return (
    <HideOnScroll>
      <AppBar position="fixed" className="bg-white dark:bg-gray-900 shadow-lg">
        <Container maxWidth="xl">
          <Toolbar className="px-0">
            {/* Logo */}
            <Typography
              variant="h6"
              component={Link}
              href="/"
              className="text-primary-600 dark:text-primary-400 font-bold text-xl mr-8 no-underline"
            >
              AdvancedBlog
            </Typography>

            {/* Desktop Navigation */}
            <Box className="hidden md:flex flex-1 space-x-6">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  className={`text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 ${
                    item.active ? 'text-primary-600 dark:text-primary-400 font-medium' : ''
                  }`}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Right side buttons */}
            <Box className="flex items-center space-x-2">
              {/* Search button */}
              <IconButton
                component={Link}
                href="/search"
                className="text-gray-700 dark:text-gray-300"
              >
                <Search />
              </IconButton>

              {/* Theme toggle */}
              <IconButton
                onClick={handleThemeToggle}
                className="text-gray-700 dark:text-gray-300"
              >
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>

              {/* User menu or auth buttons */}
              {isAuthenticated && user ? (
                <>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    className="ml-2"
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    className="mt-2 flex flex-col gap-2"
                  >
                    <MenuItem component={Link} href="/profile" onClick={handleUserMenuClose}>
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 mr-2"
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <span className="font-bold">{user.name}</span>
                    </MenuItem>
                    {user.role === 'admin' && (
                      <>
                        <MenuItem component={Link} href="/admin" onClick={handleUserMenuClose}>
                          <Dashboard className="mr-2" />
                          Quản trị
                        </MenuItem>
                      </>
                    )}
                    <MenuItem component={Link} href="/my-posts" onClick={handleUserMenuClose}>
                      <Article className="mr-2" />
                      Bài viết của tôi
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Logout className="mr-2" />
                      Đăng xuất
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box className="hidden md:flex space-x-2">
                  <Button
                    component={Link}
                    href="/auth/login"
                    variant="outlined"
                    size="small"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    component={Link}
                    href="/auth/register"
                    variant="contained"
                    size="small"
                  >
                    Đăng ký
                  </Button>
                </Box>
              )}

              {/* Mobile menu button */}
              <IconButton
                className="md:hidden text-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <Close /> : <MenuIcon />}
              </IconButton>
            </Box>
          </Toolbar>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <Box className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <Box className="flex flex-col space-y-2 p-4">
                {navigationItems.map((item) => (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    className={`justify-start text-gray-700 dark:text-gray-300 ${
                      item.active ? 'text-primary-600 dark:text-primary-400 font-medium' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Button>
                ))}
                
                {!isAuthenticated && (
                  <Box className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      component={Link}
                      href="/auth/login"
                      variant="outlined"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      component={Link}
                      href="/auth/register"
                      variant="contained"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng ký
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header; 