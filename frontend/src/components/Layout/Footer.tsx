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
    { label: 'Về chúng tôi', href: '/about' },
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
      className="bg-transparent dark:bg-gray-950 text-gray-900 dark:text-white mt-auto border-t border-gray-200 dark:border-gray-800"
    >
      <Container maxWidth="xl" className="py-12">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              component="h3"
              className="font-bold text-black dark:text-white mb-4"
            >
              QuantBlog
            </Typography>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Nền tảng blog tiên tiến, giúp bạn chia sẻ 
              kiến thức và kết nối với cộng đồng một cách dễ dàng.
            </Typography>
            
            <Box className="space-y-2">
              <Box className="flex items-center space-x-2">
                <Email className="text-black dark:text-white w-4 h-4" />
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  hoanyttv@gmail.com
                </Typography>
              </Box>
              <Box className="flex items-center space-x-2">
                <Phone className="text-black dark:text-white w-4 h-4" />
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  +84 123 456 789
                </Typography>
              </Box>
              <Box className="flex items-center space-x-2">
                <LocationOn className="text-black dark:text-white w-4 h-4" />
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  Hà Nội, Việt Nam
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-900 dark:text-white">
              Liên kết nhanh
            </Typography>
            <Box className="space-y-2">
              {quickLinks.map((link) => (
                <Box key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors duration-200 block"
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-900 dark:text-white">
              Pháp lý
            </Typography>
            <Box className="space-y-2">
              {legalLinks.map((link) => (
                <Box key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors duration-200 block"
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-900 dark:text-white">
              Kết nối với chúng tôi
            </Typography>
            
            <Box className="flex space-x-2 mb-6">
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-primary-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-primary-400 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
                  size="small"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>

            <Typography variant="body2" className="text-gray-600 dark:text-gray-300 mb-3">
              Đăng ký nhận thông báo về bài viết mới
            </Typography>
            <Box className="flex space-x-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              <button className="px-4 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-md font-medium transition-colors duration-200">
                Đăng ký
              </button>
            </Box>
          </Grid>
        </Grid>

        <Divider className="my-8 border-gray-300 dark:border-gray-700" />

        <Box className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
            © {currentYear} QuantBlog.
          </Typography>
          
          <Box className="flex items-center space-x-6">
            <Link
              href="/sitemap.xml"
              className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm transition-colors duration-200"
            >
              Sitemap
            </Link>
            <Link
              href="/rss.xml"
              className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 text-sm transition-colors duration-200"
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