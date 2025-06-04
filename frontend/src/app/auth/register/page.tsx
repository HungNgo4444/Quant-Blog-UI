import { Metadata } from 'next';
import RegisterForm from '../../../components/Auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản mới để bắt đầu chia sẻ kiến thức và tương tác với cộng đồng',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
} 