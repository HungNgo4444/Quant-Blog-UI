'use client';

import React, { useState, useEffect } from 'react';
import {
  Edit,
  PhotoCamera,
  Save,
  Security,
  Person,
  Link as LinkIcon,
  Visibility,
  VisibilityOff,
  Lock,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { updateProfile } from 'frontend/src/services/UserService';
import { changePassword } from 'frontend/src/services/AuthService';
import { toast } from 'react-toastify';
import { readFile } from 'frontend/src/lib/utils';
import LoadingComponent from 'frontend/src/components/Common/LoadingComponent';

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  socialLinks: {
    website: string;
    twitter: string;
    linkedin: string;
    github: string;
  };
}

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarChanged, setAvatarChanged] = useState<boolean>(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      avatar: '',
      socialLinks: {
        website: '',
        twitter: '',
        linkedin: '',
        github: '',
      },
    },
  });

  const {
    control: securityControl,
    handleSubmit: handleSecuritySubmit,
    watch: securityWatch,
    reset: resetSecurity,
    formState: { errors: securityErrors },
  } = useForm<SecurityFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false,
    },
  });

  const newPassword = securityWatch('newPassword');

  useEffect(() => {
    if (user) {
      setProfileValue('name', user.name || '');
      setProfileValue('email', user.email || '');
      setProfileValue('bio', user.bio || '');
      setProfileValue('avatar', user.avatar || '');
      setAvatarPreview(user.avatar || '');
      setAvatarChanged(false); // Reset when loading user data
      
      // Set social links if available
      if (user.socialLinks) {
        setProfileValue('socialLinks.website', user.socialLinks.website || '');
        setProfileValue('socialLinks.twitter', user.socialLinks.twitter || '');
        setProfileValue('socialLinks.linkedin', user.socialLinks.linkedin || '');
        setProfileValue('socialLinks.github', user.socialLinks.github || '');
      }
    }
  }, [user, setProfileValue]);

  const onProfileSubmit = async (data: ProfileFormData) => {

    try {
      const payload = {
        ...data,
        avatar: avatarChanged ? data.avatar : undefined
      };
      
      const response = await updateProfile(payload);
      if (response) {
        toast.success("Cập nhật thông tin thành công!");
        setAvatarChanged(false);
      } else {
        toast.error("Cập nhật thông tin thất bại!");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Cập nhật thông tin thất bại!');
    }
  };

  const onSecuritySubmit = async (data: SecurityFormData) => {
    try {
      const response= await changePassword(data);
      if (response) {
        toast.success("Cập nhật mật khẩu thành công!");
        resetSecurity();
      } else {
        toast.error("Cập nhật mật khẩu thất bại!");
      }
    } catch (error) {
      console.error('Error updating security:', error);
      toast.error("Cập nhật mật khẩu thất bại!");
    }
  };

  const handleAvatarChange = async (file: File | null) => {
    if (file) {
      readFile(file).then((base64) => {
        setAvatarPreview(base64);
        setProfileValue('avatar', base64);
        setAvatarChanged(true);
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // API call to delete account
      console.log('Deleting account...');
      setDeleteAccountDialog(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSubmitting && <LoadingComponent/>}
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý tài khoản
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cập nhật thông tin cá nhân và cài đặt bảo mật
          </p>
        </div>

        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <Person className="h-4 w-4" />
                  <span className="hidden sm:inline">Thông tin cá nhân</span>
                  <span className="sm:hidden">Hồ sơ</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <Security className="h-4 w-4" />
                  <span className="hidden sm:inline">Bảo mật</span>
                  <span className="sm:hidden">Mật khẩu</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="pt-6">
                <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Avatar Section */}
                    <div className="lg:col-span-1">
                      <div className="text-center">
                        <div className="relative inline-block">
                          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white dark:border-gray-700 shadow-lg">
                            <AvatarImage src={avatarPreview} alt={user?.name} />
                            <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-gray-900">
                              {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="avatar-upload"
                            type="file"
                            onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                          />
                          <label htmlFor="avatar-upload">
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-gray-900 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200">
                              <PhotoCamera className="h-4 w-4" />
                            </div>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Nhấp để thay đổi ảnh đại diện
                        </p>
                      </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-3">
                      {/* Basic Info */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thông tin cơ bản</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</Label>
                            <Controller
                              name="name"
                              control={profileControl}
                              rules={{ required: 'Tên là bắt buộc' }}
                              render={({ field }) => (
                                <div>
                                  <Input
                                    {...field}
                                    id="name"
                                    className={`mt-1 ${profileErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                  />
                                  {profileErrors.name && (
                                    <p className="text-xs text-red-500 mt-1">{profileErrors.name.message}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>

                          <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                            <Controller
                              name="email"
                              control={profileControl}
                              rules={{
                                required: 'Email là bắt buộc',
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: 'Email không hợp lệ',
                                },
                              }}
                              render={({ field }) => (
                                <div>
                                  <Input
                                    {...field}
                                    id="email"
                                    type="email"
                                    className={`mt-1 ${profileErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    disabled
                                  />
                                  {profileErrors.email && (
                                    <p className="text-xs text-red-500 mt-1">{profileErrors.email.message}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">Giới thiệu</Label>
                          <Controller
                            name="bio"
                            control={profileControl}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                id="bio"
                                placeholder="Viết một vài dòng về bản thân..."
                                rows={3}
                                className="mt-1 border-gray-300 dark:border-gray-600"
                              />
                            )}
                          />
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Liên kết mạng xã hội</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</Label>
                            <Controller
                              name="socialLinks.website"
                              control={profileControl}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  id="website"
                                  placeholder="https://facebook.com/yourprofile"
                                  className="mt-1 border-gray-300 dark:border-gray-600"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <Label htmlFor="twitter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter</Label>
                            <Controller
                              name="socialLinks.twitter"
                              control={profileControl}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  id="twitter"
                                  placeholder="@username"
                                  className="mt-1 border-gray-300 dark:border-gray-600"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</Label>
                            <Controller
                              name="socialLinks.linkedin"
                              control={profileControl}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  id="linkedin"
                                  placeholder="https://linkedin.com/in/username"
                                  className="mt-1 border-gray-300 dark:border-gray-600"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <Label htmlFor="github" className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</Label>
                            <Controller
                              name="socialLinks.github"
                              control={profileControl}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  id="github"
                                  placeholder="https://github.com/username"
                                  className="mt-1 border-gray-300 dark:border-gray-600"
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-lg"
                      >
                        <Save className="h-4 w-4" />
                        Lưu thay đổi
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="security" className="pt-6">
                <form onSubmit={handleSecuritySubmit(onSecuritySubmit)}>
                  <div className="max-w-2xl">
                    {/* Password Change */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Đổi mật khẩu</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu hiện tại</Label>
                          <Controller
                            name="currentPassword"
                            control={securityControl}
                            rules={{ required: 'Vui lòng nhập mật khẩu hiện tại' }}
                            render={({ field }) => (
                              <div>
                                <div className="relative mt-1">
                                  <Input
                                    {...field}
                                    id="currentPassword"
                                    type={showPasswords.current ? 'text' : 'password'}
                                    className={`pr-10 ${securityErrors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    tabIndex={1}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                    onClick={() => 
                                      setShowPasswords(prev => ({ ...prev, current: !prev.current }))
                                    }
                                  >
                                    {showPasswords.current ? <VisibilityOff className="h-4 w-4" /> : <Visibility className="h-4 w-4" />}
                                  </Button>
                                </div>
                                {securityErrors.currentPassword && (
                                  <p className="text-xs text-red-500 mt-1">{securityErrors.currentPassword.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu mới</Label>
                            <Controller
                              name="newPassword"
                              control={securityControl}
                              rules={{
                                required: 'Vui lòng nhập mật khẩu mới',
                                validate: validatePassword,
                              }}
                              render={({ field }) => (
                                <div>
                                  <div className="relative mt-1">
                                    <Input
                                      {...field}
                                      id="newPassword"
                                      type={showPasswords.new ? 'text' : 'password'}
                                      className={`pr-10 ${securityErrors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                      tabIndex={2}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                      onClick={() => 
                                        setShowPasswords(prev => ({ ...prev, new: !prev.new }))
                                      }
                                    >
                                      {showPasswords.new ? <VisibilityOff className="h-4 w-4" /> : <Visibility className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                  {securityErrors.newPassword && (
                                    <p className="text-xs text-red-500 mt-1">{securityErrors.newPassword.message}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>

                          <div>
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Xác nhận mật khẩu</Label>
                            <Controller
                              name="confirmPassword"
                              control={securityControl}
                              rules={{
                                required: 'Vui lòng xác nhận mật khẩu',
                                validate: value => value === newPassword || 'Mật khẩu xác nhận không khớp',
                              }}
                              render={({ field }) => (
                                <div>
                                  <div className="relative mt-1">
                                    <Input
                                      {...field}
                                      id="confirmPassword"
                                      type={showPasswords.confirm ? 'text' : 'password'}
                                      className={`pr-10 ${securityErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                      tabIndex={3}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                      onClick={() => 
                                        setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))
                                      }
                                    >
                                      {showPasswords.confirm ? <VisibilityOff className="h-4 w-4" /> : <Visibility className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                  {securityErrors.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">{securityErrors.confirmPassword.message}</p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-lg"
                    >
                      <Lock className="h-4 w-4" />
                      Đổi mật khẩu
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
} 