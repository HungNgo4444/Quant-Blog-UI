import { Metadata } from 'next';
import MainLayout from '../../components/Layout/MainLayout';

export const metadata: Metadata = {
  title: 'About',
  description: 'About',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 