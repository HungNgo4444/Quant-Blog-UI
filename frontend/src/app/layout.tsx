import { Metadata } from 'next';
import Providers from '../components/Providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AdvancedBlog',
    template: '%s | AdvancedBlog'
  },
  description: 'Nền tảng blog hiện đại với editor markdown, SEO tối ưu và nhiều tính năng tiên tiến',
  openGraph: {
    title: 'AdvancedBlog',
    description: 'Nền tảng blog hiện đại với editor markdown, SEO tối ưu và nhiều tính năng tiên tiến',
    url: '/',
    siteName: 'AdvancedBlog',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
} 