import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Alert,
  Snackbar,
  Skeleton,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Business as OrganizerIcon,
  Engineering as StaffIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import { getUsers, toggleUserActive, changeUserRole, deleteUserPermanently, verifyUserEmail } from '../api/adminAPI';
import { formatDate } from '@/utils/helpers';
import { ROLES } from '@/utils/constants';

const roleConfig = {
  ADMIN: { label: 'Admin', color: '#EF4444', icon: <AdminIcon fontSize="small" /> },
  ORGANIZER: { label: 'Organizer', color: '#7C3AED', icon: <OrganizerIcon fontSize="small" /> },
  STAFF: { label: 'Staff', color: '#F59E0B', icon: <StaffIcon fontSize="small" /> },
  USER: { label: 'User', color: '#3B82F6', icon: <UserIcon fontSize="small" /> },
};

const UserManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Menu & Dialog states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    organizers: 0,
    staff: 0,
    users: 0,
    active: 0,
    inactive: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: rowsPerPage,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };

      if (searchKeyword) params.keyword = searchKeyword;
      if (filterRole) params.role = filterRole;
      if (filterStatus !== '') params.isActive = filterStatus === 'active';

      const response = await getUsers(params);
      setUsers(response.content || []);
      setTotalElements(response.totalElements || 0);

      // Calculate stats from current data
      const allUsers = response.content || [];
      setStats({
        total: response.totalElements || 0,
        admins: allUsers.filter(u => u.role === 'ADMIN').length,
        organizers: allUsers.filter(u => u.role === 'ORGANIZER').length,
        staff: allUsers.filter(u => u.role === 'STAFF').length,
        users: allUsers.filter(u => u.role === 'USER').length,
        active: allUsers.filter(u => u.isActive).length,
        inactive: allUsers.filter(u => !u.isActive).length,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Lỗi khi tải danh sách users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchKeyword, filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleActive = async () => {
    try {
      await toggleUserActive(selectedUser.id);
      showSnackbar(
        selectedUser.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản'
      );
      fetchUsers();
    } catch (error) {
      showSnackbar('Lỗi khi cập nhật trạng thái', 'error');
    }
    handleMenuClose();
  };

  const handleVerifyEmail = async () => {
    try {
      await verifyUserEmail(selectedUser.id);
      showSnackbar('Đã xác thực email');
      fetchUsers();
    } catch (error) {
      showSnackbar('Lỗi khi xác thực email', 'error');
    }
    handleMenuClose();
  };

  const handleChangeRole = async () => {
    try {
      await changeUserRole(selectedUser.id, newRole);
      showSnackbar('Đã thay đổi role thành công');
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      showSnackbar('Lỗi khi thay đổi role', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUserPermanently(selectedUser.id);
      showSnackbar('Đã xóa user thành công');
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      showSnackbar('Lỗi khi xóa user', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        setFilterRole('');
        setFilterStatus('');
        break;
      case 1:
        setFilterRole('ADMIN');
        break;
      case 2:
        setFilterRole('ORGANIZER');
        break;
      case 3:
        setFilterRole('USER');
        break;
      case 4:
        setFilterRole('');
        setFilterStatus('inactive');
        break;
      default:
        break;
    }
    setPage(0);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchUsers();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Quản lý Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý tất cả tài khoản người dùng trong hệ thống
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
          >
            Làm mới
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Xuất Excel
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Tổng Users', value: stats.total, color: '#7C3AED', icon: <UserIcon /> },
          { label: 'Admins', value: stats.admins, color: '#EF4444', icon: <AdminIcon /> },
          { label: 'Organizers', value: stats.organizers, color: '#F59E0B', icon: <OrganizerIcon /> },
          { label: 'Đang hoạt động', value: stats.active, color: '#10B981', icon: <ActiveIcon /> },
          { label: 'Đã khóa', value: stats.inactive, color: '#6B7280', icon: <BlockIcon /> },
        ].map((stat, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
            <Card sx={{ bgcolor: `${stat.color}10`, border: `1px solid ${stat.color}30` }}>
              <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: stat.color, width: 36, height: 36 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs & Filters */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Tất cả" />
          <Tab label={<Badge badgeContent={stats.admins} color="error">Admins</Badge>} />
          <Tab label={<Badge badgeContent={stats.organizers} color="warning">Organizers</Badge>} />
          <Tab label="Users" />
          <Tab label={<Badge badgeContent={stats.inactive} color="default">Đã khóa</Badge>} />
        </Tabs>

        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filterRole}
              label="Role"
              onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="ORGANIZER">Organizer</MenuItem>
              <MenuItem value="STAFF">Staff</MenuItem>
              <MenuItem value="USER">User</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filterStatus}
              label="Trạng thái"
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Đã khóa</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" width={40} /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Không tìm thấy user nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.avatarUrl}
                          sx={{ bgcolor: roleConfig[user.role]?.color || '#7C3AED' }}
                        >
                          {user.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {user.fullName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2">{user.email}</Typography>
                        {user.isEmailVerified && (
                          <Tooltip title="Email đã xác thực">
                            <VerifiedIcon fontSize="small" color="primary" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={roleConfig[user.role]?.icon}
                        label={roleConfig[user.role]?.label || user.role}
                        size="small"
                        sx={{
                          bgcolor: `${roleConfig[user.role]?.color}15`,
                          color: roleConfig[user.role]?.color,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.isActive ? <ActiveIcon /> : <BlockIcon />}
                        label={user.isActive ? 'Hoạt động' : 'Đã khóa'}
                        size="small"
                        color={user.isActive ? 'success' : 'default'}
                        variant={user.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số hàng:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { setViewDialogOpen(true); handleMenuClose(); }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={() => { setNewRole(selectedUser?.role); setRoleDialogOpen(true); handleMenuClose(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Đổi Role
        </MenuItem>
        {!selectedUser?.isEmailVerified && (
          <MenuItem onClick={handleVerifyEmail}>
            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
            Xác thực Email
          </MenuItem>
        )}
        <MenuItem onClick={handleToggleActive}>
          {selectedUser?.isActive ? (
            <>
              <BlockIcon fontSize="small" sx={{ mr: 1 }} />
              Khóa tài khoản
            </>
          ) : (
            <>
              <ActiveIcon fontSize="small" sx={{ mr: 1 }} />
              Mở khóa
            </>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => { setDeleteDialogOpen(true); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa vĩnh viễn
        </MenuItem>
      </Menu>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={selectedUser.avatarUrl}
                  sx={{ width: 80, height: 80, bgcolor: roleConfig[selectedUser.role]?.color }}
                >
                  {selectedUser.fullName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedUser.fullName}
                  </Typography>
                  <Typography color="text.secondary">{selectedUser.email}</Typography>
                  <Chip
                    label={roleConfig[selectedUser.role]?.label}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: `${roleConfig[selectedUser.role]?.color}15`,
                      color: roleConfig[selectedUser.role]?.color,
                    }}
                  />
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Typography>{selectedUser.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                  <Typography>{selectedUser.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                  <Typography>{selectedUser.isActive ? 'Đang hoạt động' : 'Đã khóa'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Email xác thực</Typography>
                  <Typography>{selectedUser.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Ngày tạo</Typography>
                  <Typography>{formatDate(selectedUser.createdAt)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Cập nhật lần cuối</Typography>
                  <Typography>{formatDate(selectedUser.updatedAt)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Đổi Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Thay đổi role cho user: <strong>{selectedUser?.fullName}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Role mới</InputLabel>
            <Select
              value={newRole}
              label="Role mới"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="ORGANIZER">Organizer</MenuItem>
              <MenuItem value="STAFF">Staff</MenuItem>
              <MenuItem value="USER">User</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleChangeRole}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Hành động này không thể hoàn tác!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa vĩnh viễn user <strong>{selectedUser?.fullName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementPage;