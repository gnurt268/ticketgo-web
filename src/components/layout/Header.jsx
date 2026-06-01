import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Fade,
  Grow,
  ListItemIcon,
  ListItemText,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Search,
  AccountCircle,
  ConfirmationNumber,
  Dashboard,
  Logout,
  Add,
  Event,
  Close,
  KeyboardArrowDown,
  QrCodeScanner,
} from '@mui/icons-material';
import {
  logout,
  selectUser,
  selectIsAuthenticated,
  openAuthModal,
  closeAuthModal,
  selectIsAuthModalOpen,
  selectAuthModalTab,
} from '@/features/auth';
import { ROUTES, ROLES } from '@/utils/constants';
import { getInitials } from '@/utils/helpers';
import { AuthModal } from '@/components/common';
import { Logo } from '@/assets/brand';
import useCategories, { categoryIconSrc } from '@/features/events/useCategories';

// Animations
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthModalOpen = useSelector(selectIsAuthModalOpen);
  const authModalTab = useSelector(selectAuthModalTab);

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get active category from URL
  const getActiveCategory = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category');
  };

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

  const openLoginModal = () => dispatch(openAuthModal({ tab: 0 }));
  const openRegisterModal = () => dispatch(openAuthModal({ tab: 1 }));
  const handleCloseAuthModal = () => dispatch(closeAuthModal());

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Danh mục lấy động từ BE (GET /api/categories) thay vì hardcode
  const { categories } = useCategories();

  const menuItems = [
    {
      label: 'Vé của tôi',
      icon: <ConfirmationNumber />,
      path: ROUTES.MY_TICKETS,
      show: user?.role === ROLES.USER,
    },
    {
      label: 'Tài khoản',
      icon: <AccountCircle />,
      path: ROUTES.PROFILE,
      show: true,
    },
    {
      label: 'Check-in Scanner',
      icon: <QrCodeScanner />,
      path: ROUTES.CHECK_IN,
      show: user?.role === ROLES.STAFF || user?.role === ROLES.ORGANIZER || user?.role === ROLES.ADMIN,
    },
    {
      label: 'Quản lý sự kiện',
      icon: <Event />,
      path: ROUTES.ORGANIZER_DASHBOARD,
      show: user?.role === ROLES.ORGANIZER,
    },
    {
      label: 'Admin Dashboard',
      icon: <Dashboard />,
      path: ROUTES.ADMIN_DASHBOARD,
      show: user?.role === ROLES.ADMIN,
    },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: isScrolled ? 'transparent' : 'divider',
          boxShadow: isScrolled ? '0 4px 20px rgba(94, 53, 177, 0.1)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              gap: 2,
              py: isScrolled ? 0.5 : 1,
              transition: 'padding 0.3s ease',
            }}
          >
            {/* Logo with hover effect */}
            <Link to={ROUTES.HOME} className="flex items-center">
              <Box
                sx={{
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Logo size="md" />
              </Box>
            </Link>

            {/* Search Bar */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: isSearchFocused ? 'white' : '#F3F4F6',
                borderRadius: 3,
                px: 2,
                py: 0.75,
                maxWidth: 520,
                border: '2px solid',
                borderColor: isSearchFocused ? 'primary.main' : 'transparent',
                boxShadow: isSearchFocused
                  ? '0 4px 20px rgba(94, 53, 177, 0.15)'
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: isSearchFocused ? 'white' : '#EDEEF0',
                },
              }}
            >
              <Search
                sx={{
                  color: isSearchFocused ? 'primary.main' : 'text.secondary',
                  mr: 1.5,
                  fontSize: 22,
                  transition: 'color 0.2s ease',
                }}
              />
              <InputBase
                placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                sx={{
                  flex: 1,
                  fontSize: '0.95rem',
                  '& input::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.8,
                  },
                }}
              />
              {searchQuery && (
                <Fade in>
                  <IconButton
                    size="small"
                    onClick={clearSearch}
                    sx={{
                      mr: 0.5,
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Fade>
              )}
              <Button
                type="submit"
                variant="text"
                size="small"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  minWidth: 'auto',
                  px: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'primary.lighter',
                  },
                }}
              >
                Tìm
              </Button>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Tạo sự kiện button */}
              {isAuthenticated && user?.role === ROLES.ORGANIZER && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate('/organizer/events/create')}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.lighter',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(94, 53, 177, 0.2)',
                      },
                    }}
                  >
                    Tạo sự kiện
                  </Button>
                )}

              {/* Vé của tôi - quick access */}
              {isAuthenticated && (
                <Button
                  variant="text"
                  startIcon={<ConfirmationNumber />}
                  onClick={() => navigate(ROUTES.MY_TICKETS)}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                    },
                  }}
                >
                  Vé của tôi
                </Button>
              )}

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

              {/* Auth Section */}
              {isAuthenticated ? (
                <>
                  {/* User Avatar Button */}
                  <Box
                    onClick={handleMenuOpen}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      py: 0.5,
                      px: 1,
                      borderRadius: 3,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha('#5E35B1', 0.08),
                      },
                    }}
                  >
                    {/* Avatar with ring effect */}
                    <Box
                      sx={{
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: -3,
                          borderRadius: '50%',
                          border: '2px solid transparent',
                          background:
                            'linear-gradient(135deg, #5E35B1, #F59E0B) border-box',
                          WebkitMask:
                            'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                          opacity: Boolean(anchorEl) ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover::before': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: 'primary.main',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        {user?.fullName ? getInitials(user.fullName) : <AccountCircle />}
                      </Avatar>
                    </Box>

                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          lineHeight: 1.2,
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user?.fullName?.split(' ').slice(-1)[0]}
                      </Typography>
                    </Box>

                    <KeyboardArrowDown
                      sx={{
                        fontSize: 20,
                        color: 'text.secondary',
                        transition: 'transform 0.2s ease',
                        transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  </Box>

                  {/* User Dropdown Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    TransitionComponent={Grow}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        minWidth: 240,
                        mt: 1.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 10px 40px rgba(94, 53, 177, 0.15)',
                        overflow: 'visible',
                        animation: `${slideDown} 0.2s ease`,
                        '&::before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 20,
                          width: 12,
                          height: 12,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderBottom: 'none',
                          borderRight: 'none',
                        },
                      },
                    }}
                  >
                    {/* User Info Header */}
                    <Box
                      sx={{
                        px: 2.5,
                        py: 2,
                        background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE7F6 100%)',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: 'primary.main' }}
                      >
                        {user?.fullName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block' }}
                      >
                        {user?.email}
                      </Typography>
                    </Box>

                    {/* Menu Items */}
                    <Box sx={{ py: 1 }}>
                      {menuItems
                        .filter((item) => item.show)
                        .map((item, index) => (
                          <MenuItem
                            key={index}
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                              py: 1.5,
                              px: 2.5,
                              mx: 1,
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'primary.lighter',
                                '& .MuiListItemIcon-root': {
                                  color: 'primary.main',
                                  transform: 'scale(1.1)',
                                },
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 40,
                                color: 'text.secondary',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontSize: '0.9rem',
                                fontWeight: 500,
                              }}
                            />
                          </MenuItem>
                        ))}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Logout */}
                    <Box sx={{ py: 1 }}>
                      <MenuItem
                        onClick={handleLogout}
                        sx={{
                          py: 1.5,
                          px: 2.5,
                          mx: 1,
                          borderRadius: 2,
                          color: 'error.main',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'error.lighter',
                            '& .MuiListItemIcon-root': {
                              transform: 'translateX(3px)',
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: 'error.main',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          <Logout />
                        </ListItemIcon>
                        <ListItemText
                          primary="Đăng xuất"
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                          }}
                        />
                      </MenuItem>
                    </Box>
                  </Menu>
                </>
              ) : (
                /* Login/Register Buttons */
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="text"
                    onClick={openLoginModal}
                    sx={{
                      color: 'text.primary',
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'primary.lighter',
                      },
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="contained"
                    onClick={openRegisterModal}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2.5,
                      background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)',
                      boxShadow: '0 4px 15px rgba(94, 53, 177, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4527A0 0%, #5E35B1 100%)',
                        boxShadow: '0 6px 20px rgba(94, 53, 177, 0.4)',
                        transform: 'translateY(-1px)',
                      },
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
        {categories.length > 0 && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              backgroundSize: '200% 100%',
              animation: `${shimmer} 3s infinite`,
              pointerEvents: 'none',
            },
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                py: 0.75,
              }}
            >
              {categories.map((item) => {
                const isActive = getActiveCategory() === String(item.id);
                return (
                  <Button
                    key={item.id}
                    component={Link}
                    to={`/events?category=${item.id}`}
                    sx={{
                      color: 'white',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.9rem',
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-1px)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: isActive ? '60%' : '0%',
                        height: 2,
                        bgcolor: '#F59E0B',
                        borderRadius: 1,
                        transition: 'width 0.3s ease',
                      },
                      '&:hover::after': {
                        width: '60%',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={categoryIconSrc(item)}
                      alt=""
                      sx={{
                        width: 18,
                        height: 18,
                        mr: 0.75,
                        filter: 'brightness(0) invert(1)',
                      }}
                    />
                    {item.name}
                  </Button>
                );
              })}
            </Box>
          </Container>
        </Box>
        )}
      </AppBar>

      {/* Auth Modal */}
      <AuthModal
        open={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Header;