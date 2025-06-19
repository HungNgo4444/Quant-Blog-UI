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
    <div className="max-w-4xl mx-auto p-6">
      {isSubmitting && <LoadingComponent/>}
      <h1 className="text-3xl font-bold mb-6">Quản lý tài khoản</h1>

      {successMessage && (
        <Alert className="mb-4">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Person className="h-4 w-4" />
                Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Security className="h-4 w-4" />
                Bảo mật
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="pt-6">
              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <div className="text-center relative">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarImage src={avatarPreview} alt={user?.name} />
                        <AvatarFallback className="text-2xl">
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
                        <span className="cursor-pointer absolute bottom-[-10px] right-[74px]">
                          <PhotoCamera className="h-8 w-8 bg-gray-500 text-white rounded-full p-2" />
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label htmlFor="name">Họ và tên</Label>
                        <Controller
                          name="name"
                          control={profileControl}
                          rules={{ required: 'Tên là bắt buộc' }}
                          render={({ field }) => (
                            <div>
                              <Input
                                {...field}
                                id="name"
                                className={profileErrors.name ? 'border-red-500' : ''}
                              />
                              {profileErrors.name && (
                                <p className="text-sm text-red-500 mt-1">{profileErrors.name.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
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
                                className={profileErrors.email ? 'border-red-500' : ''}
                                disabled
                              />
                              {profileErrors.email && (
                                <p className="text-sm text-red-500 mt-1">{profileErrors.email.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="bio">Giới thiệu</Label>
                      <Controller
                        name="bio"
                        control={profileControl}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="bio"
                            placeholder="Viết một vài dòng về bản thân..."
                            rows={4}
                          />
                        )}
                      />
                    </div>

                    {/* Social Links */}
                    {/* <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Liên kết mạng xã hội</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Controller
                            name="socialLinks.website"
                            control={profileControl}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="website"
                                placeholder="https://yourwebsite.com"
                              />
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor="twitter">Twitter</Label>
                          <Controller
                            name="socialLinks.twitter"
                            control={profileControl}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="twitter"
                                placeholder="@username"
                              />
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Controller
                            name="socialLinks.linkedin"
                            control={profileControl}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="linkedin"
                                placeholder="https://linkedin.com/in/username"
                              />
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor="github">GitHub</Label>
                          <Controller
                            name="socialLinks.github"
                            control={profileControl}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="github"
                                placeholder="https://github.com/username"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div> */}

                    <Button
                      type="submit"
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900"
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
                <div className="space-y-6">
                  {/* Password Change */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Đổi mật khẩu</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                        <Controller
                          name="currentPassword"
                          control={securityControl}
                          rules={{ required: 'Vui lòng nhập mật khẩu hiện tại' }}
                          render={({ field }) => (
                            <div>
                              <div className="relative">
                                <Input
                                  {...field}
                                  id="currentPassword"
                                  type={showPasswords.current ? 'text' : 'password'}
                                  className={securityErrors.currentPassword ? 'border-red-500' : ''}
                                  tabIndex={1}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                  onClick={() => 
                                    setShowPasswords(prev => ({ ...prev, current: !prev.current }))
                                  }
                                >
                                  {showPasswords.current ? <VisibilityOff className="h-4 w-4" /> : <Visibility className="h-4 w-4" />}
                                </Button>
                              </div>
                              {securityErrors.currentPassword && (
                                <p className="text-sm text-red-500 mt-1">{securityErrors.currentPassword.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newPassword">Mật khẩu mới</Label>
                          <Controller
                            name="newPassword"
                            control={securityControl}
                            rules={{
                              required: 'Vui lòng nhập mật khẩu mới',
                              validate: validatePassword,
                            }}
                            render={({ field }) => (
                              <div>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    id="newPassword"
                                    type={showPasswords.new ? 'text' : 'password'}
                                    className={securityErrors.newPassword ? 'border-red-500' : ''}
                                    tabIndex={2}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                    onClick={() => 
                                      setShowPasswords(prev => ({ ...prev, new: !prev.new }))
                                    }
                                  >
                                    {showPasswords.new ? <VisibilityOff className="h-4 w-4" /> : <Visibility className="h-4 w-4" />}
                                  </Button>
                                </div>
                                {securityErrors.newPassword && (
                                  <p className="text-sm text-red-500 mt-1">{securityErrors.newPassword.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                          <Controller
                            name="confirmPassword"
                            control={securityControl}
                            rules={{
                              required: 'Vui lòng xác nhận mật khẩu',
                              validate: value => value === newPassword || 'Mật khẩu xác nhận không khớp',
                            }}
                            render={({ field }) => (
                              <div>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    id="confirmPassword"
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    className={`${securityErrors.confirmPassword ? 'border-red-500' : ''}`}
                                    tabIndex={3}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                    onClick={() => 
                                      setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))
                                    }
                                  >
                                    {showPasswords.confirm ? <VisibilityOff className="h-4 w-4" /> : <Visibility className="h-4 w-4" />}
                                  </Button>
                                </div>
                                {securityErrors.confirmPassword && (
                                  <p className="text-sm text-red-500 mt-1">{securityErrors.confirmPassword.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900"
                  >
                    <Lock className="h-4 w-4" />
                    Đổi mật khẩu
                  </Button>
                  {/* Two Factor Authentication */}
                  {/* <div>
                    <h3 className="text-lg font-medium mb-4">Xác thực hai yếu tố (2FA)</h3>
                    
                    <Controller
                      name="twoFactorEnabled"
                      control={securityControl}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <div>
                            <Label>Bật xác thực hai yếu tố</Label>
                            <p className="text-sm text-gray-600">
                              Tăng cường bảo mật cho tài khoản của bạn
                            </p>
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Security className="h-4 w-4" />
                    Cập nhật bảo mật
                  </Button>

                  <hr className="border-gray-200" /> */}

                  {/* Danger Zone */}
                  {/* <div>
                    <h3 className="text-lg font-medium text-red-600 mb-4">Vùng nguy hiểm</h3>
                    
                    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                      <AlertDescription>
                        Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                      </AlertDescription>
                    </Alert>
                    
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteAccountDialog(true)}
                    >
                      Xóa tài khoản
                    </Button>
                  </div> */}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Delete Account Dialog */}
      {/* <Dialog open={deleteAccountDialog} onOpenChange={setDeleteAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  Hành động này không thể hoàn tác!
                </AlertDescription>
              </Alert>
              Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Xóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
} 