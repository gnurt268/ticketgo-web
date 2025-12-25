import { Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Divider } from '@mui/material';
import { ROUTES } from '@/utils/constants';

const LoginPage = () => {
  return (
    <Box>
      <Typography variant="h5" className="font-bold text-center mb-6">
        Đăng nhập
      </Typography>

      <Box component="form" className="space-y-4">
        <TextField
          fullWidth
          label="Email"
          type="email"
          placeholder="Nhập email của bạn"
        />
        <TextField
          fullWidth
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
        />

        <Box className="flex justify-end">
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Typography variant="body2" color="primary" className="hover:underline">
              Quên mật khẩu?
            </Typography>
          </Link>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          type="submit"
        >
          Đăng nhập
        </Button>
      </Box>

      <Divider className="my-6">hoặc</Divider>

      <Box className="text-center">
        <Typography variant="body2">
          Chưa có tài khoản?{' '}
          <Link to={ROUTES.REGISTER}>
            <Typography component="span" color="primary" className="font-medium hover:underline">
              Đăng ký ngay
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
