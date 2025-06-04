import { Metadata } from 'next';
import { Container, Box, Paper } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from 'frontend/src/components/Layout/MainLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | AdvancedBlog',
    default: 'Xác thực',
  },
  description: 'Đăng nhập hoặc đăng ký tài khoản để trải nghiệm đầy đủ tính năng của AdvancedBlog',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <Box
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 py-12 px-4 sm:px-6 lg:px-8"
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            className="p-8 rounded-lg shadow-xl bg-white dark:bg-gray-800"
          >
            {children}
          </Paper>

          <Box className="mt-8 text-center text-sm text-gray-100">
            <Link 
              href="/"
              className="font-medium hover:text-gray-200 transition-colors"
            >
              ← Quay về trang chủ
            </Link>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
} 