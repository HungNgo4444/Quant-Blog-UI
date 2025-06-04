'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Facebook />, href: '#', label: 'Facebook' },
    { icon: <Twitter />, href: '#', label: 'Twitter' },
    { icon: <Instagram />, href: '#', label: 'Instagram' },
    { icon: <LinkedIn />, href: '#', label: 'LinkedIn' },
    { icon: <YouTube />, href: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Bài viết', href: '/posts' },
    { label: 'Thể loại', href: '/categories' },
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Liên hệ', href: '/contact' },
  ];

  const legalLinks = [
    { label: 'Chính sách bảo mật', href: '/privacy' },
    { label: 'Điều khoản sử dụng', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'DMCA', href: '/dmca' },
  ];

  return (
    <Box
      component="footer"
      className="bg-gray-900 dark:bg-gray-950 text-white mt-auto"
    >
      <Container maxWidth="xl" className="py-12">
        <Grid container spacing={4}>
          {/* Brand section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              component="h3"
              className="font-bold text-primary-400 mb-4"
            >
              AdvancedBlog
            </Typography>
            <Typography variant="body2" className="text-gray-300 mb-4 leading-relaxed">
              Nền tảng blog hiện đại với các tính năng tiên tiến, giúp bạn chia sẻ 
              kiến thức và kết nối với cộng đồng một cách dễ dàng.
            </Typography>
            
            {/* Contact info */}
            <Box className="space-y-2">
              <Box className="flex items-center space-x-2">
                <Email className="text-primary-400 w-4 h-4" />
                <Typography variant="body2" className="text-gray-300">
                  contact@advancedblog.com
                </Typography>
              </Box>
              <Box className="flex items-center space-x-2">
                <Phone className="text-primary-400 w-4 h-4" />
                <Typography variant="body2" className="text-gray-300">
                  +84 123 456 789
                </Typography>
              </Box>
              <Box className="flex items-center space-x-2">
                <LocationOn className="text-primary-400 w-4 h-4" />
                <Typography variant="body2" className="text-gray-300">
                  Hà Nội, Việt Nam
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" className="font-semibold mb-4">
              Liên kết nhanh
            </Typography>
            <Box className="space-y-2">
              {quickLinks.map((link) => (
                <Box key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200 block"
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Legal links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" className="font-semibold mb-4">
              Pháp lý
            </Typography>
            <Box className="space-y-2">
              {legalLinks.map((link) => (
                <Box key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200 block"
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Social media & newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" className="font-semibold mb-4">
              Kết nối với chúng tôi
            </Typography>
            
            {/* Social links */}
            <Box className="flex space-x-2 mb-6">
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary-400 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                  size="small"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>

            {/* Newsletter signup */}
            <Typography variant="body2" className="text-gray-300 mb-3">
              Đăng ký nhận thông báo về bài viết mới
            </Typography>
            <Box className="flex space-x-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors duration-200">
                Đăng ký
              </button>
            </Box>
          </Grid>
        </Grid>

        <Divider className="my-8 border-gray-700" />

        {/* Bottom section */}
        <Box className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <Typography variant="body2" className="text-gray-400">
            © {currentYear} AdvancedBlog. Tất cả quyền được bảo lưu.
          </Typography>
          
          <Box className="flex items-center space-x-6">
            <Typography variant="body2" className="text-gray-400">
              Được xây dựng với ❤️ bằng Next.js
            </Typography>
            <Link
              href="/sitemap.xml"
              className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
            >
              Sitemap
            </Link>
            <Link
              href="/rss.xml"
              className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
            >
              RSS
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 