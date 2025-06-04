'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material';
import Link from 'next/link';

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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Có lỗi xảy ra khi gửi email');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Box className="text-center">
        <CheckCircle 
          color="success" 
          sx={{ fontSize: 64, mb: 3 }} 
        />
        
        <Typography variant="h5" component="h1" className="mb-4">
          Email đã được gửi!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" className="mb-6">
          Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email:{' '}
          <strong>{email}</strong>
        </Typography>
        
        <Alert severity="info" className="mb-6">
          Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục spam).
          Liên kết sẽ hết hạn sau 1 giờ.
        </Alert>

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
            onClick={() => setEmailSent(false)}
            variant="outlined"
            fullWidth
            size="large"
          >
            Gửi lại email
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="text-center mb-6">
        <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h5" component="h1" className="mb-2">
          Quên mật khẩu?
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          disabled={loading}
          error={!!error}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} className="mr-2" />
              Đang gửi...
            </>
          ) : (
            'Gửi liên kết đặt lại'
          )}
        </Button>

        <Box className="flex justify-center mt-4">
          <Button
            component={Link}
            href="/auth/login"
            startIcon={<ArrowBack />}
            color="inherit"
          >
            Quay lại đăng nhập
          </Button>
        </Box>
      </form>

      <Box className="mt-6 text-center">
        <Typography variant="body2" color="text.secondary">
          Chưa có tài khoản?{' '}
          <Link 
            href="/auth/register" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Đăng ký ngay
          </Link>
        </Typography>
      </Box>
    </Box>
  );
} 