import { Metadata } from 'next';
import ForgotPasswordForm from '../../../components/Auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Quên mật khẩu',
  description: 'Khôi phục mật khẩu tài khoản của bạn',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
} 