'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  Alert,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import { RegisterCredentials } from '../../types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const registerSchema = z.object({
  name: z.string()
    .min(1, 'Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được quá 50 ký tự'),
  email: z.string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z.string()
    .min(1, 'Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
    .regex(/[^a-zA-Z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string()
    .min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, redirectTo = '/' }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'Rất yếu';
      case 2:
        return 'Yếu';
      case 3:
        return 'Trung bình';
      case 4:
        return 'Mạnh';
      case 5:
        return 'Rất mạnh';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = (strength: number): 'error' | 'warning' | 'info' | 'success' => {
    if (strength <= 1) return 'error';
    if (strength === 2) return 'warning';
    if (strength === 3) return 'info';
    return 'success';
  };

  const onSubmit = async (data: RegisterCredentials) => {
    if (!acceptTerms) {
      dispatch(showNotification({
        type: 'error',
        message: 'Vui lòng đồng ý với điều khoản sử dụng',
        duration: 5000,
      }));
      return;
    }

    try {
      const result = await dispatch(registerUser(data)).unwrap();
      
      dispatch(showNotification({
        type: 'success',
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        duration: 8000,
      }));

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/auth/login');
      }
    } catch (error: any) {
      dispatch(showNotification({
        type: 'error',
        message: error || 'Đăng ký thất bại',
        duration: 5000,
      }));
    }
  };

  const passwordStrength = getPasswordStrength(password || '');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      <Box className="text-center mb-4">
        <Typography variant="h4" component="h1" gutterBottom>
          Đăng ký
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tạo tài khoản mới để trải nghiệm đầy đủ tính năng của AdvancedBlog
        </Typography>
      </Box>

      {/* Name Field */}
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Họ tên là bắt buộc',
          minLength: {
            value: 2,
            message: 'Họ tên phải có ít nhất 2 ký tự',
          },
          maxLength: {
            value: 50,
            message: 'Họ tên không được quá 50 ký tự',
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Họ và tên"
            error={!!errors.name}
            helperText={errors.name?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="bg-white dark:bg-gray-800"
          />
        )}
      />

      {/* Email Field */}
      <Controller
        name="email"
        control={control}
        rules={{
          required: 'Email là bắt buộc',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Email không hợp lệ',
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="bg-white dark:bg-gray-800"
          />
        )}
      />

      {/* Password Field */}
      <Controller
        name="password"
        control={control}
        rules={{
          required: 'Mật khẩu là bắt buộc',
          minLength: {
            value: 8,
            message: 'Mật khẩu phải có ít nhất 8 ký tự',
          },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số',
          },
        }}
        render={({ field }) => (
          <Box>
            <TextField
              {...field}
              fullWidth
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      className="text-gray-400"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              className="bg-white dark:bg-gray-800"
            />
            
            {/* Password Strength Indicator */}
            {password && (
              <Box className="mt-2">
                <Box className="flex items-center justify-between mb-1">
                  <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                    Độ mạnh mật khẩu
                  </Typography>
                  <Typography
                    variant="caption"
                    className={`font-medium ${
                      passwordStrength <= 1 ? 'text-red-500' :
                      passwordStrength === 2 ? 'text-orange-500' :
                      passwordStrength === 3 ? 'text-blue-500' :
                      'text-green-500'
                    }`}
                  >
                    {getPasswordStrengthLabel(passwordStrength)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength / 5) * 100}
                  color={getPasswordStrengthColor(passwordStrength)}
                  className="h-2 rounded"
                />
                
                {/* Password Requirements */}
                <Box className="mt-2 space-y-1">
                  {[
                    { test: password.length >= 8, label: 'Ít nhất 8 ký tự' },
                    { test: /[a-z]/.test(password), label: 'Chứa chữ thường' },
                    { test: /[A-Z]/.test(password), label: 'Chứa chữ hoa' },
                    { test: /[0-9]/.test(password), label: 'Chứa số' },
                    { test: /[^a-zA-Z0-9]/.test(password), label: 'Chứa ký tự đặc biệt' },
                  ].map((requirement, index) => (
                    <Box key={index} className="flex items-center space-x-1">
                      {requirement.test ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <Cancel className="w-3 h-3 text-gray-400" />
                      )}
                      <Typography
                        variant="caption"
                        className={requirement.test ? 'text-green-600' : 'text-gray-500'}
                      >
                        {requirement.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      />

      {/* Confirm Password Field */}
      <Controller
        name="confirmPassword"
        control={control}
        rules={{
          required: 'Xác nhận mật khẩu là bắt buộc',
          validate: (value) => value === password || 'Mật khẩu xác nhận không khớp',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock className="text-gray-400" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    className="text-gray-400"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            className="bg-white dark:bg-gray-800"
          />
        )}
      />

      {/* Terms Agreement */}
      <FormControlLabel
        control={
          <Checkbox
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
            Tôi đồng ý với{' '}
            <MuiLink
              component={Link}
              href="/terms"
              className="text-primary-600 hover:text-primary-800 dark:text-primary-400"
            >
              Điều khoản sử dụng
            </MuiLink>
            {' '}và{' '}
            <MuiLink
              component={Link}
              href="/privacy"
              className="text-primary-600 hover:text-primary-800 dark:text-primary-400"
            >
              Chính sách bảo mật
            </MuiLink>
          </Typography>
        }
      />

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading || !acceptTerms}
        className="py-3 bg-primary-600 hover:bg-primary-700"
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>

      {/* Login Link */}
      <Box className="text-center">
        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
          Đã có tài khoản?{' '}
          <MuiLink
            component={Link}
            href="/auth/login"
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Đăng nhập ngay
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm; 