'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Article,
  Category,
  Tag,
  People,
  Analytics,
  Settings,
  Menu as MenuIcon,
  Logout,
  AccountCircle,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

const drawerWidth = 280;

const adminMenuItems = [
  { 
    text: 'Dashboard', 
    icon: <Dashboard />, 
    href: '/admin',
    description: 'Tổng quan và thống kê' 
  },
  { 
    text: 'Bài viết', 
    icon: <Article />, 
    href: '/admin/posts',
    description: 'Quản lý bài viết' 
  },
  { 
    text: 'Danh mục', 
    icon: <Category />, 
    href: '/admin/categories',
    description: 'Quản lý danh mục' 
  },
  { 
    text: 'Thẻ', 
    icon: <Tag />, 
    href: '/admin/tags',
    description: 'Quản lý thẻ' 
  },
  { 
    text: 'Người dùng', 
    icon: <People />, 
    href: '/admin/users',
    description: 'Quản lý người dùng' 
  },
  { 
    text: 'Thống kê', 
    icon: <Analytics />, 
    href: '/admin/analytics',
    description: 'Phân tích & báo cáo' 
  },
  { 
    text: 'Cài đặt', 
    icon: <Settings />, 
    href: '/admin/settings',
    description: 'Cấu hình blog' 
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const drawer = (
    <Box>
      {/* Header */}
      <Box 
        className="p-6 border-b border-gray-200 dark:border-gray-700"
        sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
      >
        <Typography variant="h6" className="font-bold">
          Admin Panel
        </Typography>
        <Typography variant="body2" className="opacity-90">
          Quản trị blog
        </Typography>
      </Box>

      {/* Navigation */}
      <List className="p-0">
        {adminMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              selected={isActive(item.href)}
              sx={{
                py: 2,
                px: 3,
                '&.Mui-selected': {
                  bgcolor: 'primary.50',
                  borderRight: 3,
                  borderColor: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: isActive(item.href) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // or loading spinner
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" className="flex-1">
            {adminMenuItems.find(item => isActive(item.href))?.text || 'Dashboard'}
          </Typography>

          {/* User Menu */}
          <Box className="flex items-center">
            <IconButton onClick={handleUserMenuOpen} className="ml-2">
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                sx={{ width: 32, height: 32 }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              onClick={handleUserMenuClose}
            >
              <MenuItem component={Link} href="/profile">
                <AccountCircle className="mr-2" />
                Hồ sơ
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout className="mr-2" />
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // AppBar height
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 