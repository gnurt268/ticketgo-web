import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  Divider,
  InputBase,
  Typography,
} from '@mui/material';
import {
  Search,
  AccountCircle,
  ConfirmationNumber,
  Dashboard,
  Logout,
  Add,
  Event,
} from '@mui/icons-material';
import { logout, selectUser, selectIsAuthenticated } from '@/features/auth';
import { ROUTES, ROLES } from '@/utils/constants';
import { getInitials } from '@/utils/helpers';
import { AuthModal } from '@/components/common';
import { Logo } from '@/assets/brand';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [anchorEl, setAnchorEl] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, tab: 0 });
  const [searchQuery, setSearchQuery] = useState('');

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

  const openLoginModal = () => setAuthModal({ open: true, tab: 0 });
  const openRegisterModal = () => setAuthModal({ open: true, tab: 1 });
  const closeAuthModal = () => setAuthModal({ open: false, tab: 0 });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, py: 1 }}>
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center">
              <Logo size="md" />
            </Link>

            {/* Search Bar */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#F3F4F6',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                maxWidth: 480,
                '&:focus-within': {
                  bgcolor: '#EDE9FE',
                  boxShadow: '0 0 0 2px #7C3AED',
                },
                transition: 'all 0.2s',
              }}
            >
              <Search sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                placeholder="Bạn tìm gì hôm nay?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.95rem' }}
              />
              <Button
                type="submit"
                variant="text"
                size="small"
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 600,
                  minWidth: 'auto',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
              >
                Tìm kiếm
              </Button>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Tạo sự kiện - chỉ hiện khi là Organizer hoặc Admin */}
              {isAuthenticated && (user?.role === ROLES.ORGANIZER || user?.role === ROLES.ADMIN) && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/organizer/events/create')}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'primary.lighter',
                    },
                  }}
                >
                  Tạo sự kiện
                </Button>
              )}

              {/* Vé của tôi */}
              {isAuthenticated && (
                <Button
                  variant="text"
                  startIcon={<ConfirmationNumber />}
                  onClick={() => navigate(ROUTES.MY_TICKETS)}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                    },
                  }}
                >
                  Vé của tôi
                </Button>
              )}

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                  >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                      {user?.fullName ? getInitials(user.fullName) : <AccountCircle />}
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: { minWidth: 220, mt: 1, borderRadius: 2 }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {user?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                    <Divider />

                    <MenuItem onClick={() => handleNavigate(ROUTES.MY_TICKETS)}>
                      <ConfirmationNumber sx={{ mr: 1.5, fontSize: 20 }} color="primary" />
                      Vé của tôi
                    </MenuItem>

                    <MenuItem onClick={() => handleNavigate(ROUTES.PROFILE)}>
                      <AccountCircle sx={{ mr: 1.5, fontSize: 20 }} color="primary" />
                      Tài khoản
                    </MenuItem>

                    {(user?.role === ROLES.ORGANIZER || user?.role === ROLES.ADMIN) && (
                      <MenuItem onClick={() => handleNavigate(ROUTES.ORGANIZER_DASHBOARD)}>
                        <Event sx={{ mr: 1.5, fontSize: 20 }} color="primary" />
                        Quản lý sự kiện
                      </MenuItem>
                    )}

                    {user?.role === ROLES.ADMIN && (
                      <MenuItem onClick={() => handleNavigate(ROUTES.ADMIN_DASHBOARD)}>
                        <Dashboard sx={{ mr: 1.5, fontSize: 20 }} color="primary" />
                        Admin Dashboard
                      </MenuItem>
                    )}

                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                      Đăng xuất
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button 
                    variant="text" 
                    onClick={openLoginModal}
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 600,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Typography color="text.secondary">|</Typography>
                  <Button 
                    variant="text" 
                    onClick={openRegisterModal}
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 600,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Đăng ký
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>

        {/* Category Navigation */}
        <Box sx={{ bgcolor: 'primary.main' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
              {[
                { label: 'Nhạc sống', path: '/events?category=music' },
                { label: 'Sân khấu & Nghệ thuật', path: '/events?category=stage' },
                { label: 'Thể Thao', path: '/events?category=sport' },
                { label: 'Khác', path: '/events?category=other' },
              ].map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Container>
        </Box>
      </AppBar>

      {/* Auth Modal */}
      <AuthModal
        open={authModal.open}
        onClose={closeAuthModal}
        defaultTab={authModal.tab}
      />
    </>
  );
};

export default Header;