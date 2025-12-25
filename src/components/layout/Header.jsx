import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  ConfirmationNumber,
  Dashboard,
  Logout,
} from '@mui/icons-material';
import { logout, selectUser, selectIsAuthenticated } from '@/features/auth';
import { ROUTES, ROLES } from '@/utils/constants';
import { getInitials } from '@/utils/helpers';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate(ROUTES.HOME);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters className="flex justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME}>
            <Typography
              variant="h5"
              component="div"
              className="font-bold text-blue-600 cursor-pointer"
            >
              TicketGo
            </Typography>
          </Link>

          {/* Navigation */}
          <Box className="flex items-center gap-2">
            <Button
              color="inherit"
              component={Link}
              to={ROUTES.EVENTS}
            >
              Sự kiện
            </Button>

            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  className="ml-2"
                >
                  <Avatar className="w-8 h-8 bg-blue-600">
                    {user?.fullName ? getInitials(user.fullName) : <AccountCircle />}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box className="px-4 py-2">
                    <Typography variant="subtitle2" className="font-semibold">
                      {user?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />

                  <MenuItem onClick={() => handleNavigate(ROUTES.MY_TICKETS)}>
                    <ConfirmationNumber className="mr-2" fontSize="small" />
                    Vé của tôi
                  </MenuItem>

                  <MenuItem onClick={() => handleNavigate(ROUTES.PROFILE)}>
                    <AccountCircle className="mr-2" fontSize="small" />
                    Tài khoản
                  </MenuItem>

                  {user?.role === ROLES.ORGANIZER && (
                    <MenuItem onClick={() => handleNavigate(ROUTES.ORGANIZER_DASHBOARD)}>
                      <Dashboard className="mr-2" fontSize="small" />
                      Quản lý sự kiện
                    </MenuItem>
                  )}

                  {user?.role === ROLES.ADMIN && (
                    <MenuItem onClick={() => handleNavigate(ROUTES.ADMIN_DASHBOARD)}>
                      <Dashboard className="mr-2" fontSize="small" />
                      Admin Dashboard
                    </MenuItem>
                  )}

                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <Logout className="mr-2" fontSize="small" />
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  component={Link}
                  to={ROUTES.LOGIN}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to={ROUTES.REGISTER}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
