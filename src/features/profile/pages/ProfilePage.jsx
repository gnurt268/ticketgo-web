import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  alpha,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Lock,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Badge,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { selectUser, getCurrentUser } from '@/features/auth';
import { authAPI } from '@/features/auth';
import { getInitials } from '@/utils/helpers';
import { ROLES, STORAGE_KEYS } from '@/utils/constants';

// Validation schemas
const profileSchema = yup.object({
  fullName: yup
    .string()
    .required('Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .matches(/^(0[0-9]{9})?$/, 'Số điện thoại không hợp lệ'),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp'),
});

const ROLE_LABELS = {
  [ROLES.USER]: 'Người dùng',
  [ROLES.STAFF]: 'Nhân viên',
  [ROLES.ORGANIZER]: 'Nhà tổ chức',
  [ROLES.ADMIN]: 'Quản trị viên',
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile form
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
    },
  });

  // Password form
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Sync profile form when user data changes
  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetProfile({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
    });
  };

  const onProfileSubmit = async (data) => {
    try {
      setProfileLoading(true);
      await authAPI.updateProfile(data);
      // Refresh user data in Redux
      const response = await dispatch(getCurrentUser()).unwrap();
      // Update localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setPasswordLoading(true);
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      toast.success('Đổi mật khẩu thành công!');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh', py: 4 }}>
      <Container maxWidth="md">
        {/* Page Header */}
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Tài khoản của tôi
        </Typography>

        {/* User Info Card */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.08)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: '1.8rem',
                fontWeight: 700,
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.4)',
              }}
            >
              {user?.fullName ? getInitials(user.fullName) : <Person />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {user?.fullName}
              </Typography>
              <Typography sx={{ opacity: 0.9, mb: 1 }}>
                {user?.email}
              </Typography>
              <Chip
                label={ROLE_LABELS[user?.role] || user?.role}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab
              icon={<Person />}
              iconPosition="start"
              label="Thông tin cá nhân"
              sx={{ minHeight: 56 }}
            />
            <Tab
              icon={<Lock />}
              iconPosition="start"
              label="Đổi mật khẩu"
              sx={{ minHeight: 56 }}
            />
          </Tabs>

          {/* Tab 0: Profile Info */}
          {activeTab === 0 && (
            <Box
              component="form"
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              sx={{ p: 3 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Thông tin cá nhân
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<Cancel />}
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={
                        profileLoading ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <Save />
                        )
                      }
                      type="submit"
                      disabled={profileLoading}
                    >
                      Lưu thay đổi
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="fullName"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Họ và tên"
                        fullWidth
                        disabled={!isEditing}
                        error={!!profileErrors.fullName}
                        helperText={profileErrors.fullName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Badge
                                sx={{ color: isEditing ? 'primary.main' : 'text.secondary' }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Email"
                    fullWidth
                    disabled
                    value={user?.email || ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Email không thể thay đổi"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="phone"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Số điện thoại"
                        fullWidth
                        disabled={!isEditing}
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone?.message}
                        placeholder="0xxxxxxxxx"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone
                                sx={{ color: isEditing ? 'primary.main' : 'text.secondary' }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 1: Change Password */}
          {activeTab === 1 && (
            <Box
              component="form"
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              sx={{ p: 3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Đổi mật khẩu
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="currentPassword"
                    control={passwordControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Mật khẩu hiện tại"
                        fullWidth
                        type={showPasswords.current ? 'text' : 'password'}
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('current')}
                                edge="end"
                                size="small"
                              >
                                {showPasswords.current ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="newPassword"
                    control={passwordControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Mật khẩu mới"
                        fullWidth
                        type={showPasswords.new ? 'text' : 'password'}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('new')}
                                edge="end"
                                size="small"
                              >
                                {showPasswords.new ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="confirmPassword"
                    control={passwordControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Xác nhận mật khẩu mới"
                        fullWidth
                        type={showPasswords.confirm ? 'text' : 'password'}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('confirm')}
                                edge="end"
                                size="small"
                              >
                                {showPasswords.confirm ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      passwordLoading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <Lock />
                      )
                    }
                    disabled={passwordLoading}
                    sx={{ mt: 1 }}
                  >
                    Đổi mật khẩu
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfilePage;
