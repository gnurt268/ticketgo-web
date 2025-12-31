import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Collapse,
  Chip,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Category as CategoryIcon,
  ShoppingCart as OrderIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as CancelledIcon,
  Home as HomeIcon,
  AdminPanelSettings as AdminIcon,
  Notifications as NotificationIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  ConfirmationNumber as TicketIcon,
  HowToReg as OrganizerIcon,
} from "@mui/icons-material";
import { logout } from "@/features/auth/authSlice";
import { Logo } from "@/assets/brand";

const drawerWidth = 280;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/admin",
  },
  {
    text: "Quản lý Users",
    icon: <PeopleIcon />,
    path: "/admin/users",
  },
  {
    text: "Đăng ký Organizer",
    icon: <OrganizerIcon />,
    path: "/admin/organizer-requests",
  },
  {
    text: "Quản lý Events",
    icon: <EventIcon />,
    path: "/admin/events",
    children: [
      { text: "Tất cả Events", path: "/admin/events" },
      { text: "Chờ duyệt", path: "/admin/events/pending", badge: true },
      { text: "Đã duyệt", path: "/admin/events/approved" },
      { text: "Đã hủy", path: "/admin/events/cancelled" },
    ],
  },
  {
    text: "Quản lý Orders",
    icon: <OrderIcon />,
    path: "/admin/orders",
  },
  {
    text: "Quản lý Categories",
    icon: <CategoryIcon />,
    path: "/admin/categories",
  },
];

const AdminLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { user } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (item) => {
    if (item.children) {
      setExpandedMenu(expandedMenu === item.text ? "" : item.text);
    } else {
      navigate(item.path);
      if (isMobile) setMobileOpen(false);
    }
  };

  const handleChildClick = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ width: 40, height: 40 }}>
          <Logo />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="primary">
            TicketGo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin Panel
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {menuItems.map((item) => (
          <Box key={item.text}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? "inherit" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                    fontSize: "0.95rem",
                  }}
                />
                {item.children &&
                  (expandedMenu === item.text ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  ))}
              </ListItemButton>
            </ListItem>

            {/* Submenu */}
            {item.children && (
              <Collapse
                in={expandedMenu === item.text}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      onClick={() => handleChildClick(child.path)}
                      selected={location.pathname === child.path}
                      sx={{
                        pl: 6,
                        py: 0.75,
                        borderRadius: 2,
                        mx: 1,
                        mb: 0.5,
                        "&.Mui-selected": {
                          backgroundColor: "primary.lighter",
                          color: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.lighter",
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={child.text}
                        primaryTypographyProps={{
                          fontSize: "0.875rem",
                        }}
                      />
                      {child.badge && pendingCount > 0 && (
                        <Chip
                          label={pendingCount}
                          size="small"
                          color="error"
                          sx={{ height: 20, fontSize: "0.75rem" }}
                        />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      <Divider />

      {/* Back to Main Site */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/")}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Về trang chủ" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" }, color: "text.primary" }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error">
                <NotificationIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              p: 0.5,
              borderRadius: 2,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                fontSize: "0.9rem",
              }}
            >
              {user?.fullName?.charAt(0) || "A"}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {user?.fullName || "Admin"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role || "ADMIN"}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: { mt: 1, minWidth: 180 },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/profile");
                handleProfileMenuClose();
              }}
            >
              <ListItemIcon>
                <AdminIcon fontSize="small" />
              </ListItemIcon>
              Hồ sơ
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/admin/settings");
                handleProfileMenuClose();
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Cài đặt
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
