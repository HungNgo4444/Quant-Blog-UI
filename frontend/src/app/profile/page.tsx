'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Save,
  Security,
  Person,
  Link as LinkIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

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
  
  const [tabValue, setTabValue] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
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
    formState: { errors: profileErrors },
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
      
      // Set social links if available
      if (user.socialLinks) {
        setProfileValue('socialLinks.website', user.socialLinks.website || '');
        setProfileValue('socialLinks.twitter', user.socialLinks.twitter || '');
        setProfileValue('socialLinks.linkedin', user.socialLinks.linkedin || '');
        setProfileValue('socialLinks.github', user.socialLinks.github || '');
      }
    }
  }, [user, setProfileValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      // API call to update profile
      console.log('Updating profile:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(updateProfile(data));
      setSuccessMessage('Cập nhật thông tin thành công!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const onSecuritySubmit = async (data: SecurityFormData) => {
    try {
      // API call to update security settings
      console.log('Updating security:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      resetSecurity();
      setSuccessMessage('Cập nhật bảo mật thành công!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating security:', error);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setProfileValue('avatar', result);
      };
      reader.readAsDataURL(file);
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
    <Box className="max-w-4xl mx-auto p-6">
      <Typography variant="h4" component="h1" className="mb-6 font-bold">
        Quản lý tài khoản
      </Typography>

      {successMessage && (
        <Alert severity="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      <Card>
        <CardHeader
          title={
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<Person />} label="Thông tin cá nhân" />
              <Tab icon={<Security />} label="Bảo mật" />
            </Tabs>
          }
        />
        
        <CardContent>
          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box className="text-center">
                    <Avatar
                      src={avatarPreview}
                      alt={user?.name}
                      sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                        size="large"
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                    
                    <Typography variant="body2" color="text.secondary">
                      Nhấp để thay đổi ảnh đại diện
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="name"
                        control={profileControl}
                        rules={{ required: 'Tên là bắt buộc' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Họ và tên"
                            fullWidth
                            error={!!profileErrors.name}
                            helperText={profileErrors.name?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
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
                          <TextField
                            {...field}
                            label="Email"
                            fullWidth
                            error={!!profileErrors.email}
                            helperText={profileErrors.email?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="bio"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Giới thiệu"
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Viết một vài dòng về bản thân..."
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Social Links */}
                <Grid item xs={12}>
                  <Typography variant="h6" className="mb-3">
                    Liên kết mạng xã hội
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="socialLinks.website"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Website"
                            fullWidth
                            placeholder="https://yourwebsite.com"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="socialLinks.twitter"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Twitter"
                            fullWidth
                            placeholder="@username"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="socialLinks.linkedin"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="LinkedIn"
                            fullWidth
                            placeholder="https://linkedin.com/in/username"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="socialLinks.github"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="GitHub"
                            fullWidth
                            placeholder="https://github.com/username"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    size="large"
                  >
                    Lưu thay đổi
                  </Button>
                </Grid>
              </Grid>
            </form>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSecuritySubmit(onSecuritySubmit)}>
              <Grid container spacing={3}>
                {/* Password Change */}
                <Grid item xs={12}>
                  <Typography variant="h6" className="mb-3">
                    Đổi mật khẩu
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Controller
                        name="currentPassword"
                        control={securityControl}
                        rules={{ required: 'Vui lòng nhập mật khẩu hiện tại' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Mật khẩu hiện tại"
                            type={showPasswords.current ? 'text' : 'password'}
                            fullWidth
                            error={!!securityErrors.currentPassword}
                            helperText={securityErrors.currentPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => 
                                    setShowPasswords(prev => ({ ...prev, current: !prev.current }))
                                  }
                                >
                                  {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="newPassword"
                        control={securityControl}
                        rules={{
                          required: 'Vui lòng nhập mật khẩu mới',
                          validate: validatePassword,
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Mật khẩu mới"
                            type={showPasswords.new ? 'text' : 'password'}
                            fullWidth
                            error={!!securityErrors.newPassword}
                            helperText={securityErrors.newPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => 
                                    setShowPasswords(prev => ({ ...prev, new: !prev.new }))
                                  }
                                >
                                  {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="confirmPassword"
                        control={securityControl}
                        rules={{
                          required: 'Vui lòng xác nhận mật khẩu',
                          validate: value => value === newPassword || 'Mật khẩu xác nhận không khớp',
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Xác nhận mật khẩu"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            fullWidth
                            error={!!securityErrors.confirmPassword}
                            helperText={securityErrors.confirmPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => 
                                    setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))
                                  }
                                >
                                  {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Two Factor Authentication */}
                <Grid item xs={12}>
                  <Typography variant="h6" className="mb-3">
                    Xác thực hai yếu tố (2FA)
                  </Typography>
                  
                  <Controller
                    name="twoFactorEnabled"
                    control={securityControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label={
                          <Box>
                            <Typography>Bật xác thực hai yếu tố</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tăng cường bảo mật cho tài khoản của bạn
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Security />}
                    disabled={loading}
                    size="large"
                  >
                    Cập nhật bảo mật
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Danger Zone */}
                <Grid item xs={12}>
                  <Typography variant="h6" className="mb-3" color="error">
                    Vùng nguy hiểm
                  </Typography>
                  
                  <Alert severity="warning" className="mb-3">
                    Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                  </Alert>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteAccountDialog(true)}
                  >
                    Xóa tài khoản
                  </Button>
                </Grid>
              </Grid>
            </form>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteAccountDialog}
        onClose={() => setDeleteAccountDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">Xác nhận xóa tài khoản</DialogTitle>
        <DialogContent>
          <Alert severity="error" className="mb-4">
            Hành động này không thể hoàn tác!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountDialog(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
          >
            Xóa tài khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 