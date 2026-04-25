import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Chip,
  IconButton,
  InputAdornment,
  Tooltip,
  Skeleton,
  Stack,
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
  CalendarToday,
  ShoppingBag,
  ConfirmationNumber,
  Paid,
  RateReview,
  Event as EventIcon,
  ErrorOutline,
  Link as LinkIcon,
  Business,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { selectUser, getCurrentUser } from '@/features/auth';
import profileAPI from '../profileAPI';
import OrdersTab from '../components/OrdersTab';
import OrganizerRequestTab from '../components/OrganizerRequestTab';
import { getInitials, formatCurrency, formatDate, getErrorMessage } from '@/utils/helpers';
import { ROLES, STORAGE_KEYS } from '@/utils/constants';

const profileSchema = yup.object({
  fullName: yup
    .string()
    .required('Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(255, 'Họ tên tối đa 255 ký tự'),
  phone: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .matches(/^(\+?84|0)\d{9,10}$/, {
      message: 'Số điện thoại không hợp lệ',
      excludeEmptyString: true,
    }),
  avatarUrl: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .max(500, 'Đường dẫn ảnh tối đa 500 ký tự')
    .url('Đường dẫn ảnh không hợp lệ'),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự'),
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

const StatCard = ({ icon, label, value, color = 'primary.main', onClick }) => (
  <Paper
    variant="outlined"
    onClick={onClick}
    sx={{
      p: 2.5,
      height: '100%',
      borderRadius: 3,
      transition: 'all 0.2s ease',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick
        ? { borderColor: color, transform: 'translateY(-2px)', boxShadow: 2 }
        : {},
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          color,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      avatarUrl: '',
    },
  });

  const watchedAvatarUrl = watchProfile('avatarUrl');

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

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      setProfileError(null);
      const res = await profileAPI.getMyProfile();
      setProfile(res.data);
      resetProfile({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        avatarUrl: res.data.avatarUrl || '',
      });
    } catch (error) {
      setProfileError(getErrorMessage(error));
    } finally {
      setLoadingProfile(false);
    }
  }, [resetProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetProfile({
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      avatarUrl: profile?.avatarUrl || '',
    });
  };

  const onProfileSubmit = async (data) => {
    try {
      setProfileLoading(true);
      const payload = {
        fullName: data.fullName,
        phone: data.phone || null,
        avatarUrl: data.avatarUrl || null,
      };
      const res = await profileAPI.updateProfile(payload);
      setProfile(res.data);
      resetProfile({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        avatarUrl: res.data.avatarUrl || '',
      });
      const refreshed = await dispatch(getCurrentUser()).unwrap();
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(refreshed));
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setPasswordLoading(true);
      await profileAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      resetPassword();
      toast.success('Đổi mật khẩu thành công!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const displayName = profile?.fullName || user?.fullName || '';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || user?.role;
  const previewAvatarUrl = isEditing ? watchedAvatarUrl : profile?.avatarUrl;
  const canRegisterOrganizer =
    displayRole && displayRole !== ROLES.ORGANIZER && displayRole !== ROLES.ADMIN;

  const stats = [
    {
      key: 'orders',
      label: 'Đơn hàng',
      value: profile?.totalOrders ?? 0,
      icon: <ShoppingBag />,
      color: 'primary.main',
      onClick: () => setActiveTab(1),
    },
    {
      key: 'tickets',
      label: 'Vé đã mua',
      value: profile?.totalTickets ?? 0,
      icon: <ConfirmationNumber />,
      color: 'info.main',
      onClick: () => navigate('/my-tickets'),
    },
    {
      key: 'spent',
      label: 'Tổng chi tiêu',
      value: formatCurrency(profile?.totalSpent ?? 0),
      icon: <Paid />,
      color: 'success.main',
    },
    {
      key: 'reviews',
      label: 'Đánh giá',
      value: profile?.totalReviews ?? 0,
      icon: <RateReview />,
      color: 'warning.main',
    },
  ];

  if (displayRole === ROLES.ORGANIZER || displayRole === ROLES.ADMIN) {
    stats.push({
      key: 'organized',
      label: 'Sự kiện tổ chức',
      value: profile?.totalEventsOrganized ?? 0,
      icon: <EventIcon />,
      color: 'secondary.main',
    });
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Tài khoản của tôi
        </Typography>

        {profileError && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'error.lighter',
              color: 'error.dark',
            }}
          >
            <ErrorOutline />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Không tải được thông tin
              </Typography>
              <Typography variant="caption">{profileError}</Typography>
            </Box>
            <Button size="small" color="error" variant="outlined" onClick={loadProfile}>
              Thử lại
            </Button>
          </Paper>
        )}

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
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 3,
              position: 'relative',
              zIndex: 1,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Avatar
              src={previewAvatarUrl || undefined}
              sx={{
                width: 88,
                height: 88,
                fontSize: '2rem',
                fontWeight: 700,
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.4)',
              }}
            >
              {displayName ? getInitials(displayName) : <Person />}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {loadingProfile && !profile ? (
                <>
                  <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Skeleton variant="text" width={240} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                </>
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }} noWrap>
                    {displayName}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1, opacity: 0.95, flexWrap: 'wrap' }}
                  >
                    <Typography variant="body2" sx={{ opacity: 0.95 }}>
                      {displayEmail}
                    </Typography>
                    {profile?.emailVerified && (
                      <Tooltip title="Email đã xác thực">
                        <CheckCircle sx={{ fontSize: 18, color: '#A5F3FC' }} />
                      </Tooltip>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={ROLE_LABELS[displayRole] || displayRole || 'Người dùng'}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                    />
                    {profile?.createdAt && (
                      <Chip
                        icon={<CalendarToday sx={{ fontSize: 14, color: 'white !important' }} />}
                        label={`Tham gia ${formatDate(profile.createdAt)}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.25)',
                          '& .MuiChip-icon': { color: 'white' },
                        }}
                      />
                    )}
                  </Stack>
                </>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {loadingProfile && !profile
            ? Array.from({ length: 4 }).map((_, idx) => (
                <Grid key={idx} size={{ xs: 6, md: 3 }}>
                  <Skeleton variant="rounded" height={88} />
                </Grid>
              ))
            : stats.map((s) => (
                <Grid key={s.key} size={{ xs: 6, md: 3 }}>
                  <StatCard
                    icon={s.icon}
                    label={s.label}
                    value={s.value}
                    color={s.color}
                    onClick={s.onClick}
                  />
                </Grid>
              ))}
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab icon={<Person />} iconPosition="start" label="Thông tin cá nhân" sx={{ minHeight: 56 }} />
            <Tab icon={<ShoppingBag />} iconPosition="start" label="Đơn hàng của tôi" sx={{ minHeight: 56 }} />
            <Tab icon={<Lock />} iconPosition="start" label="Đổi mật khẩu" sx={{ minHeight: 56 }} />
            {canRegisterOrganizer && (
              <Tab
                icon={<Business />}
                iconPosition="start"
                label="Đăng ký Ban tổ chức"
                sx={{ minHeight: 56 }}
              />
            )}
          </Tabs>

          {/* Tab 1: Orders */}
          {activeTab === 1 && <OrdersTab active={activeTab === 1} />}

          {/* Tab 3: Organizer Request */}
          {canRegisterOrganizer && activeTab === 3 && (
            <OrganizerRequestTab
              isAlreadyOrganizer={
                displayRole === ROLES.ORGANIZER || displayRole === ROLES.ADMIN
              }
            />
          )}

          {/* Tab 0: Profile Info */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)} sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 1,
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
                    disabled={loadingProfile}
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
                      disabled={profileLoading}
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
                        disabled={!isEditing || loadingProfile}
                        error={!!profileErrors.fullName}
                        helperText={profileErrors.fullName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Badge sx={{ color: isEditing ? 'primary.main' : 'text.secondary' }} />
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
                    value={displayEmail}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: profile?.emailVerified ? (
                        <InputAdornment position="end">
                          <Tooltip title="Email đã xác thực">
                            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
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
                        disabled={!isEditing || loadingProfile}
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone?.message}
                        placeholder="0xxxxxxxxx"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: isEditing ? 'primary.main' : 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="avatarUrl"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Đường dẫn ảnh đại diện"
                        fullWidth
                        disabled={!isEditing || loadingProfile}
                        error={!!profileErrors.avatarUrl}
                        helperText={
                          profileErrors.avatarUrl?.message ||
                          (isEditing ? 'Dán URL ảnh (https://...). Để trống để dùng chữ cái đầu.' : '')
                        }
                        placeholder="https://example.com/avatar.jpg"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon sx={{ color: isEditing ? 'primary.main' : 'text.secondary' }} />
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

          {/* Tab 2: Change Password */}
          {activeTab === 2 && (
            <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Đổi mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Mật khẩu mới phải có ít nhất 6 ký tự. Nên dùng ký tự hoa, thường, số và ký tự đặc biệt.
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
                                {showPasswords.current ? <VisibilityOff /> : <Visibility />}
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
                                {showPasswords.new ? <VisibilityOff /> : <Visibility />}
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
                                {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ mb: 2 }} />
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
