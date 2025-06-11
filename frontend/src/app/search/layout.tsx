import { Metadata } from 'next';
import MainLayout from '../../components/Layout/MainLayout';

export const metadata: Metadata = {
  title: 'Tìm kiếm',
  description: 'Tìm kiếm bài viết',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 