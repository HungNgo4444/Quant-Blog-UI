import { Metadata } from 'next';
import Providers from '../components/Providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: "Quant Blog",
  description: "Quant Blog - Blog",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Quant Blog",
    description: "Quant Blog - Blog",
    images: ['/logo.png'],
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