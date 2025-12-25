import { Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Divider } from '@mui/material';
import { ROUTES } from '@/utils/constants';

const RegisterPage = () => {
  return (
    <Box>
      <Typography variant="h5" className="font-bold text-center mb-6">
        Tạo tài khoản
      </Typography>

      <Box component="form" className="space-y-4">
        <TextField
          fullWidth
          label="Họ và tên"
          placeholder="Nhập họ và tên"
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          placeholder="Nhập email của bạn"
        />
        <TextField
          fullWidth
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
        />
        <TextField
          fullWidth
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
        />
        <TextField
          fullWidth
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          type="submit"
        >
          Đăng ký
        </Button>
      </Box>

      <Divider className="my-6">hoặc</Divider>

      <Box className="text-center">
        <Typography variant="body2">
          Đã có tài khoản?{' '}
          <Link to={ROUTES.LOGIN}>
            <Typography component="span" color="primary" className="font-medium hover:underline">
              Đăng nhập
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
