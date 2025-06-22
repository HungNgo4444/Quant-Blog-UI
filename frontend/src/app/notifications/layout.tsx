import { Metadata } from 'next';
import MainLayout from '../../components/Layout/MainLayout';

export const metadata: Metadata = {
  title: 'Thông báo',
  description: 'Quản lý thông báo',
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 