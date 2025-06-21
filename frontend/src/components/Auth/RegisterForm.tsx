'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
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
import { RegisterCredentials } from '../../types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../../lib/utils';
import { toast } from 'react-toastify';

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

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const onSubmit = async (data: RegisterCredentials) => {
    if (!acceptTerms) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    try {
      const result = await dispatch(registerUser(data)).unwrap();
      
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/auth/login');
      }
    } catch (error: any) {
      toast.error(error || 'Đăng ký thất bại');
    }
  };

  const passwordStrength = getPasswordStrength(password || '');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Đăng ký</CardTitle>
        <CardDescription>
          Tạo tài khoản mới để trải nghiệm đầy đủ tính năng của QuantBlog
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Person className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    {...field}
                    id="name"
                    placeholder="Nhập họ và tên của bạn"
                    className={cn(
                      "pl-10 py-6",
                      errors.name && "border-red-500 focus:border-red-500"
                    )}
                    tabIndex={1}
                  />
                </div>
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1 !mt-4">
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    className={cn(
                      "pl-10 py-6",
                      errors.email && "border-red-500 focus:border-red-500"
                    )}
                    tabIndex={2}
                  />
                </div>
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1 !mt-4">
            <Label htmlFor="password">Mật khẩu</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu của bạn"
                      className={cn(
                        "pl-10 pr-10 py-6",
                        errors.password && "border-red-500 focus:border-red-500"
                      )}
                      tabIndex={3}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <VisibilityOff className="w-4 h-4" /> : <Visibility className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">
                          Độ mạnh mật khẩu
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            passwordStrength <= 1 ? 'text-red-500' :
                            passwordStrength === 2 ? 'text-orange-500' :
                            passwordStrength === 3 ? 'text-blue-500' :
                            'text-green-500'
                          )}
                        >
                          {getPasswordStrengthLabel(passwordStrength)}
                        </span>
                      </div>
                      <Progress 
                        value={(passwordStrength / 5) * 100} 
                        className="h-2"
                      />
                      
                      {/* Password Requirements */}
                      <div className="mt-2 space-y-1">
                        {[
                          { test: password.length >= 8, label: 'Ít nhất 8 ký tự' },
                          { test: /[a-z]/.test(password), label: 'Chứa chữ thường' },
                          { test: /[A-Z]/.test(password), label: 'Chứa chữ hoa' },
                          { test: /[0-9]/.test(password), label: 'Chứa số' },
                          { test: /[^a-zA-Z0-9]/.test(password), label: 'Chứa ký tự đặc biệt' },
                        ].map((requirement, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            {requirement.test ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Cancel className="w-3 h-3 text-gray-400" />
                            )}
                            <span
                              className={cn(
                                "text-xs",
                                requirement.test ? 'text-green-600' : 'text-gray-500'
                              )}
                            >
                              {requirement.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1 !mt-4">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    {...field}
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu của bạn"
                    className={cn(
                      "pl-10 pr-10 py-6",
                      errors.confirmPassword && "border-red-500 focus:border-red-500"
                    )}
                    tabIndex={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <VisibilityOff className="w-4 h-4" /> : <Visibility className="w-4 h-4" />}
                  </button>
                </div>
              )}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === 'indeterminate' ? false : checked)}
            />
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tôi đồng ý với{' '}
              <Link
                href="/terms"
                className="text-primary hover:underline"
              >
                Điều khoản sử dụng
              </Link>
              {' '}và{' '}
              <Link
                href="/privacy"
                className="text-primary hover:underline"
              >
                Chính sách bảo mật
              </Link>
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            disabled={loading || !acceptTerms}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm; 