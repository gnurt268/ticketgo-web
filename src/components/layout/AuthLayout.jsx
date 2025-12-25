import { Outlet, Link } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import { ROUTES } from '@/utils/constants';

const AuthLayout = () => {
  return (
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Container maxWidth="sm">
        {/* Logo */}
        <Box className="text-center mb-8">
          <Link to={ROUTES.HOME}>
            <Typography
              variant="h4"
              className="font-bold text-blue-600 cursor-pointer"
            >
              TicketGo
            </Typography>
          </Link>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            Nền tảng đặt vé sự kiện hàng đầu
          </Typography>
        </Box>

        {/* Auth Form Container */}
        <Paper elevation={3} className="p-8 rounded-xl">
          <Outlet />
        </Paper>

        {/* Footer */}
        <Box className="text-center mt-6">
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} TicketGo. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
