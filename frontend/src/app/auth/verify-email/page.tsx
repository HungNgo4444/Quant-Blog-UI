'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import Link from 'next/link';
import { verifyEmail } from '../../../services/AuthService';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token xác thực không hợp lệ');
        return;
      }

      if (isVerified) {
        setStatus('success');
        return;
      }

      try {
        const response = await verifyEmail(token);
        if (response.message) {
          setStatus('success');
          setMessage(response.message);
          setIsVerified(true);
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Xác thực email thất bại');
        }
      } catch (error: any) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('Token already used')) {
          setStatus('success');
          setMessage('Email đã được xác thực thành công');
          setIsVerified(true);
        } else {
          setStatus('error');
          setMessage('Có lỗi xảy ra khi xác thực email');
        }
      }
    };

    confirmEmail();
  }, [token, isVerified, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">
                Đang xác thực email...
              </CardTitle>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle 
                className="w-16 h-16 text-green-500 mx-auto mb-4"
              />
              <CardTitle className="text-xl mb-4">
                Xác thực email thành công!
              </CardTitle>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <Button
                asChild
                className="w-full"
              >
                <Link href="/auth/login">
                  Đăng nhập ngay
                </Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <ErrorIcon 
                className="w-16 h-16 text-red-500 mx-auto mb-4"
              />
              <CardTitle className="text-xl mb-4">
                Xác thực thất bại
              </CardTitle>
              <p className="text-red-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full"
                >
                  <Link href="/auth/login">
                    Quay lại đăng nhập
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/auth/register">
                    Đăng ký tài khoản mới
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 