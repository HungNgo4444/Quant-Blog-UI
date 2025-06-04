import { Metadata } from 'next';
import MainLayout from '../../components/Layout/MainLayout';

export const metadata: Metadata = {
  title: 'Bài viết',
  description: 'Khám phá các bài viết chất lượng về công nghệ, lập trình và phát triển phần mềm',
};

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 