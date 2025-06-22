'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { resetPassword } from "../../../services/AuthService";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import Link from "next/link";
import { CheckCircle, VpnKey, ContentCopy, Visibility, VisibilityOff } from "@mui/icons-material";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!token) {
      setError('Token không hợp lệ hoặc đã hết hạn');
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword(token);
      if (res && res.newPassword) {
        setNewPassword(res.newPassword);
        setSuccess(true);
        toast.success('Mật khẩu đã được đặt lại thành công');
      } else {
        setError('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      toast.success('Đã sao chép mật khẩu');
    } catch (err) {
      toast.error('Không thể sao chép mật khẩu');
    }
  };

  useEffect(() => {
    handleResetPassword();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xử lý yêu cầu đặt lại mật khẩu...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <VpnKey className="w-8 h-8 text-red-600" />
          </div>
          
          <CardTitle className="text-xl text-red-600">
            Không thể đặt lại mật khẩu
          </CardTitle>
          
          <CardDescription className="text-red-500">
            {error}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Liên kết có thể đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Link href="/auth/forgot-password">
              <Button className="w-full">
                Yêu cầu đặt lại mật khẩu mới
              </Button>
            </Link>
            
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          
          <CardTitle className="text-xl text-green-600">
            Đặt lại mật khẩu thành công!
          </CardTitle>
          
          <CardDescription>
            Mật khẩu mới của bạn đã được tạo. Vui lòng sao chép và lưu lại mật khẩu này.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert variant="info" className="mb-6">
            <AlertDescription>
              <strong>Quan trọng:</strong> Hãy thay đổi mật khẩu ở <span className="text-red-500 font-bold">Hồ sơ</span> ngay sau khi đăng nhập để đảm bảo bảo mật tài khoản của bạn.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Mật khẩu mới của bạn:
              </label>
              
              <div className="relative">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border rounded-lg">
                  <span className="font-mono text-sm flex-1 break-all">
                    {showPassword ? newPassword : '•'.repeat(newPassword.length)}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 h-8 w-8"
                  >
                    {showPassword ? (
                      <VisibilityOff className="w-4 h-4" />
                    ) : (
                      <Visibility className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPassword}
                    className="p-1 h-8 w-8"
                  >
                    <ContentCopy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                  Đăng nhập với mật khẩu mới
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Sau khi đăng nhập, bạn có thể thay đổi mật khẩu trong phần hồ sơ tài khoản.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}