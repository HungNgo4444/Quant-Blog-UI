import { Metadata } from 'next';
import MainLayout from '../../components/Layout/MainLayout';

export const metadata: Metadata = {
  title: 'Thể loại',
  description: 'Khám phá các thể loại bài viết chất lượng về công nghệ, lập trình và phát triển phần mềm',
};

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 