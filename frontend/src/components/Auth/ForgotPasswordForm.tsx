'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { forgotPassword } from 'frontend/src/services/AuthService';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await forgotPassword(email);

      if (response) {
        setEmailSent(true);
      } else {
        setError('Có lỗi xảy ra khi gửi email');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle 
              className="w-16 h-16 text-green-500 mx-auto mb-4"
            />
            
            <CardTitle className="text-xl mb-4">
              Email đã được gửi!
            </CardTitle>
            
            <p className="text-sm text-gray-600 mb-6">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email:{' '}
              <strong>{email}</strong>
            </p>
            
            <Alert className="mb-6">
              <AlertDescription>
                Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục spam).
                Liên kết sẽ hết hạn sau 1 giờ.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <Link href="/auth/login">
                  Quay lại đăng nhập
                </Link>
              </Button>
              
              {/* <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Gửi lại email
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Email className="w-12 h-12 text-black mx-auto mb-2" />
        
        <CardTitle className="text-xl">
          Quên mật khẩu?
        </CardTitle>
        
        <CardDescription>
          Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                disabled={loading}
                className={cn(
                  "pl-10",
                  error && "border-red-500 focus:border-red-500"
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
          </Button>

          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              className="text-gray-600"
            >
              <Link href="/auth/login">
                <ArrowBack className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Link>
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link 
              href="/auth/register" 
              className="text-primary hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 