import { Metadata } from 'next';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {children}

          <div className="mt-8 text-center text-sm text-gray-600">
            <Link 
              href="/"
              className="font-medium hover:text-gray-800 transition-colors"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 