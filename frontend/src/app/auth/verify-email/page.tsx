'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import Link from 'next/link';
import verifyEmail from 'frontend/src/services/AuthService';

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
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Box className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        {status === 'loading' && (
          <Box className="text-center">
            <CircularProgress size={64} className="mb-4" />
            <Typography variant="h5" component="h1">
              Đang xác thực email...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box className="text-center">
            <CheckCircle 
              color="success" 
              sx={{ fontSize: 64 }} 
              className="mb-4"
            />
            <Typography variant="h5" component="h1" className="mb-4">
              Xác thực email thành công!
            </Typography>
            <Typography color="text.secondary" className="mb-6">
              {message}
            </Typography>
            <Button
              component={Link}
              href="/auth/login"
              variant="contained"
              fullWidth
              size="large"
            >
              Đăng nhập ngay
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box className="text-center">
            <ErrorIcon 
              color="error" 
              sx={{ fontSize: 64 }} 
              className="mb-4"
            />
            <Typography variant="h5" component="h1" className="mb-4">
              Xác thực thất bại
            </Typography>
            <Typography color="error" className="mb-6">
              {message}
            </Typography>
            <Box className="space-y-3">
              <Button
                component={Link}
                href="/auth/login"
                variant="contained"
                fullWidth
                size="large"
              >
                Quay lại đăng nhập
              </Button>
              <Button
                component={Link}
                href="/auth/register"
                variant="outlined"
                fullWidth
                size="large"
              >
                Đăng ký tài khoản mới
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
} 