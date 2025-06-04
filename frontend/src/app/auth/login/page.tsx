import { Metadata } from 'next';
import LoginForm from '../../../components/Auth/LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào tài khoản của bạn để truy cập các tính năng độc quyền',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginForm />;
} 