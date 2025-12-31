import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Skeleton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  ConfirmationNumber as TicketIcon,
  ArrowForward as ArrowForwardIcon,
  ShoppingCart as OrderIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { getDashboardStatistics } from '../api/adminAPI';
import { formatCurrency } from '@/utils/helpers';

const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4'];

const StatCard = ({ title, value, subtitle, icon, color, trend, trendValue, loading }) => {
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
          <Skeleton variant="text" width="40%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${color}20`,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
              boxShadow: `0 4px 14px ${color}40`,
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Chip
              size="small"
              icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${trendValue}%`}
              sx={{
                bgcolor: trend === 'up' ? '#10B98120' : '#EF444420',
                color: trend === 'up' ? '#10B981' : '#EF4444',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ mt: 2, color: color }}>
          {value}
        </Typography>
        <Typography variant="body1" fontWeight={500} color="text.primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStatistics();
      setStats(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#F59E0B',
      COMPLETED: '#10B981',
      PAID: '#10B981',
      FAILED: '#EF4444',
      CANCELLED: '#6B7280',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ xử lý',
      COMPLETED: 'Hoàn thành',
      PAID: 'Đã thanh toán',
      FAILED: 'Thất bại',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  // Prepare chart data
  const revenueChartData = stats?.trendData?.revenueTrend?.map(item => ({
    date: item.date?.split('-').slice(1).join('/') || '',
    revenue: item.amount || 0,
  })) || [];

  const categoryPieData = stats?.trendData?.eventsByCategory
    ? Object.entries(stats.trendData.eventsByCategory).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const cityBarData = stats?.trendData?.eventsByCity
    ? Object.entries(stats.trendData.eventsByCity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chào mừng trở lại! Đây là tổng quan về hệ thống của bạn.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Tổng Users"
            value={loading ? '...' : stats?.userStats?.totalUsers?.toLocaleString() || '0'}
            subtitle={`+${stats?.userStats?.newUsersThisMonth || 0} tháng này`}
            icon={<PeopleIcon />}
            color="#7C3AED"
            trend="up"
            trendValue={12}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Tổng Events"
            value={loading ? '...' : stats?.eventStats?.totalEvents?.toLocaleString() || '0'}
            subtitle={`${stats?.eventStats?.pendingEvents || 0} chờ duyệt`}
            icon={<EventIcon />}
            color="#10B981"
            trend="up"
            trendValue={8}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Doanh thu"
            value={loading ? '...' : formatCurrency(stats?.revenueStats?.totalRevenue || 0)}
            subtitle={`${formatCurrency(stats?.revenueStats?.revenueThisMonth || 0)} tháng này`}
            icon={<RevenueIcon />}
            color="#F59E0B"
            trend="up"
            trendValue={23}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Vé đã bán"
            value={loading ? '...' : stats?.ticketStats?.totalTicketsSold?.toLocaleString() || '0'}
            subtitle={`${stats?.ticketStats?.ticketsSoldThisMonth || 0} tháng này`}
            icon={<TicketIcon />}
            color="#3B82F6"
            trend="up"
            trendValue={15}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts Row - Fixed equal height */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Doanh thu 7 ngày qua
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng: {formatCurrency(revenueChartData.reduce((sum, item) => sum + (item.revenue || 0), 0))}
              </Typography>
            </Box>
            {loading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val.toLocaleString()} 
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Events by Category Pie */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Events theo danh mục
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                <Skeleton variant="circular" width={180} height={180} />
              </Box>
            ) : categoryPieData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                <Typography color="text.secondary">Chưa có dữ liệu</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={50}
                    wrapperStyle={{ paddingTop: 10 }}
                    formatter={(value) => <span style={{ fontSize: 11, color: '#666' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Stats Detail Row - Fixed equal height */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* User Stats */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ p: 3, height: 280 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PeopleIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>User Stats</Typography>
            </Box>
            <List dense disablePadding>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Admin" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600}>{stats?.userStats?.adminCount || 0}</Typography>
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Organizer" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600}>{stats?.userStats?.organizerCount || 0}</Typography>
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="User" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600}>{stats?.userStats?.userCount || 0}</Typography>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Active" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip label={stats?.userStats?.activeUsers || 0} size="small" color="success" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Locked" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip label={stats?.userStats?.lockedUsers || 0} size="small" color="error" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Event Stats */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ p: 3, height: 280 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EventIcon color="success" />
              <Typography variant="h6" fontWeight={600}>Event Stats</Typography>
            </Box>
            <List dense disablePadding>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Đã xuất bản" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip label={stats?.eventStats?.publishedEvents || 0} size="small" color="primary" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Chờ duyệt" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip label={stats?.eventStats?.pendingEvents || 0} size="small" color="warning" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Đã hủy" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip label={stats?.eventStats?.cancelledEvents || 0} size="small" color="error" />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Sắp diễn ra" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600}>{stats?.eventStats?.upcomingEvents || 0}</Typography>
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Đang diễn ra" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600} color="success.main">{stats?.eventStats?.ongoingEvents || 0}</Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Order Stats */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ p: 3, height: 280 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <OrderIcon color="warning" />
              <Typography variant="h6" fontWeight={600}>Order Stats</Typography>
            </Box>
            <List dense disablePadding>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Tổng đơn" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600}>{stats?.revenueStats?.totalOrders || 0}</Typography>
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Đã thanh toán" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip label={stats?.revenueStats?.completedOrders || 0} size="small" color="success" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Chờ TT" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip label={stats?.revenueStats?.pendingOrders || 0} size="small" color="warning" />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Thất bại" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip label={stats?.revenueStats?.failedOrders || 0} size="small" color="error" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Giá trị TB" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600} fontSize={12}>{formatCurrency(stats?.revenueStats?.averageOrderValue || 0)}</Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Ticket Stats */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper sx={{ p: 3, height: 280 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TicketIcon color="info" />
              <Typography variant="h6" fontWeight={600}>Ticket Stats</Typography>
            </Box>
            <List dense disablePadding>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Đã bán" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600}>{stats?.ticketStats?.totalTicketsSold || 0}</Typography>
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Đã check-in" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600}>{stats?.ticketStats?.totalTicketsCheckedIn || 0}</Typography>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Tỷ lệ check-in" primaryTypographyProps={{ variant: 'body2' }} />
                <Chip 
                  label={`${(stats?.ticketStats?.checkInRate || 0).toFixed(1)}%`} 
                  size="small" 
                  color="primary" 
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText primary="Hôm nay" primaryTypographyProps={{ variant: 'body2' }} />
                <Typography fontWeight={600} color="success.main">
                  +{stats?.ticketStats?.ticketsSoldToday || 0}
                </Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity Tables */}
      <Grid container spacing={3}>
        {/* Pending Approvals */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Events chờ duyệt</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/admin/events?status=pending')}>
                Xem tất cả
              </Button>
            </Box>
            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <TableContainer sx={{ maxHeight: 260 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Organizer</TableCell>
                      <TableCell>Ngày gửi</TableCell>
                      <TableCell align="right">Xem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.recentActivities?.pendingApprovals?.length > 0 ? (
                      stats.recentActivities.pendingApprovals.slice(0, 5).map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 150 }}>
                              {item.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>{item.organizerName}</Typography>
                          </TableCell>
                          <TableCell>{item.submittedAt}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="primary">
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">Không có event nào chờ duyệt</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Đơn hàng gần đây</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/admin/orders')}>
                Xem tất cả
              </Button>
            </Box>
            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <TableContainer sx={{ maxHeight: 260 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã đơn</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell>Tổng tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.recentActivities?.recentOrders?.slice(0, 5).map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{order.orderCode}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>{order.buyerName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatCurrency(order.totalAmount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(order.paymentStatus)}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(order.paymentStatus)}20`,
                              color: getStatusColor(order.paymentStatus),
                              fontWeight: 500,
                              fontSize: 11,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Users mới đăng ký</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/admin/users')}>
                Xem tất cả
              </Button>
            </Box>
            <List disablePadding sx={{ maxHeight: 260, overflow: 'auto' }}>
              {stats?.recentActivities?.recentUsers?.slice(0, 5).map((user) => (
                <ListItem
                  key={user.id}
                  sx={{ px: 0, py: 1 }}
                  secondaryAction={<Chip label={user.role} size="small" variant="outlined" />}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                      {user.fullName?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.fullName}
                    secondary={user.email}
                    primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Events by City Bar Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Events theo thành phố
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={280} />
            ) : cityBarData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                <Typography color="text.secondary">Chưa có dữ liệu</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cityBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;