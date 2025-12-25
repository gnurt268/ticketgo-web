import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/hooks';
import { toast } from 'react-toastify';
import { FoxIcon } from '@/assets/brand';

// Validation schemas
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: yup
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
});

const registerSchema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .required('Vui lòng nhập họ tên'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  phone: yup
    .string()
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .required('Vui lòng nhập số điện thoại'),
  password: yup
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
});

const AuthModal = ({ open, onClose, defaultTab = 0 }) => {
  const [tab, setTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register: registerUser, isLoading, error, resetError } = useAuth();

  // Sync tab with defaultTab when modal opens
  useEffect(() => {
    if (open) {
      setTab(defaultTab);
    }
  }, [open, defaultTab]);

  // Login form
  const loginForm = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Register form
  const registerForm = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    resetError();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    onClose();
    resetError();
    loginForm.reset();
    registerForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const onLogin = async (data) => {
    try {
      const result = await login(data);
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Đăng nhập thành công!');
        handleClose();
      }
    } catch (err) {
      // Error handled by redux
    }
  };

  const onRegister = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data;
      const result = await registerUser(registerData);
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setTab(0);
        registerForm.reset();
      }
    } catch (err) {
      // Error handled by redux
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Logo with gradient background */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)',
          pt: 3,
          pb: 3,
          position: 'relative',
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            color: 'rgba(255,255,255,0.8)',
            '&:hover': {
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <Close />
        </IconButton>

        <Box className="text-center">
          {/* Fox Mascot */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
            <FoxIcon size={64} />
          </Box>
          
          <Box className="flex items-center justify-center gap-1">
            <Typography 
              variant="h4" 
              component="span"
              sx={{ fontWeight: 700, color: 'white' }}
            >
              Ticket
            </Typography>
            <Typography 
              variant="h4" 
              component="span"
              sx={{ fontWeight: 700, color: '#F59E0B' }}
            >
              GO
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            {tab === 0 ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: 3 }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              py: 2,
            }
          }}
        >
          <Tab label="Đăng nhập" />
          <Tab label="Đăng ký" />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        {tab === 0 && (
          <Box
            component="form"
            onSubmit={loginForm.handleSubmit(onLogin)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="example@email.com"
              {...loginForm.register('email')}
              error={!!loginForm.formState.errors.email}
              helperText={loginForm.formState.errors.email?.message}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              {...loginForm.register('password')}
              error={!!loginForm.formState.errors.password}
              helperText={loginForm.formState.errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="body2"
              sx={{ 
                textAlign: 'right', 
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Quên mật khẩu?
            </Typography>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{ py: 1.5, mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đăng nhập'
              )}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
              Chưa có tài khoản?{' '}
              <Box
                component="span"
                sx={{ 
                  color: 'primary.main', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => setTab(1)}
              >
                Đăng ký ngay
              </Box>
            </Typography>
          </Box>
        )}

        {/* Register Form */}
        {tab === 1 && (
          <Box
            component="form"
            onSubmit={registerForm.handleSubmit(onRegister)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              fullWidth
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              {...registerForm.register('fullName')}
              error={!!registerForm.formState.errors.fullName}
              helperText={registerForm.formState.errors.fullName?.message}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="example@email.com"
              {...registerForm.register('email')}
              error={!!registerForm.formState.errors.email}
              helperText={registerForm.formState.errors.email?.message}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              placeholder="0912345678"
              {...registerForm.register('phone')}
              error={!!registerForm.formState.errors.phone}
              helperText={registerForm.formState.errors.phone?.message}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              {...registerForm.register('password')}
              error={!!registerForm.formState.errors.password}
              helperText={registerForm.formState.errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              {...registerForm.register('confirmPassword')}
              error={!!registerForm.formState.errors.confirmPassword}
              helperText={registerForm.formState.errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{ py: 1.5, mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đăng ký'
              )}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
              Đã có tài khoản?{' '}
              <Box
                component="span"
                sx={{ 
                  color: 'primary.main', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => setTab(0)}
              >
                Đăng nhập
              </Box>
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;