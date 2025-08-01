import { Metadata } from 'next';
import MainLayout from '../../components/Layout/MainLayout';
import QASidebar from '../../components/QA/QASidebar';
import QuestionCompose from '../../components/QA/QuestionCompose';

export const metadata: Metadata = {
  title: 'Hỏi đáp',
  description: 'Hỏi đáp',
};

export default function QALayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <MainLayout>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className="flex flex-row mt-8">
          <QASidebar />
          <div className='flex-1'>{children}</div>
        </div>
      </div>
    </MainLayout>
  );
}