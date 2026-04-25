import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Skeleton,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import {
  Event as EventIcon,
  Paid,
  ConfirmationNumber,
  Add,
  Drafts,
  HourglassTop,
  CheckCircle,
  Public,
  Cancel,
  TaskAlt,
  TrendingUp,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import dayjs from 'dayjs';
import organizerAPI from '../organizerAPI';
import { formatCurrency, getErrorMessage } from '@/utils/helpers';

const STATUS_CARDS = [
  { key: 'DRAFT', label: 'Bản nháp', icon: <Drafts />, color: '#6B7280' },
  { key: 'PENDING', label: 'Chờ duyệt', icon: <HourglassTop />, color: '#F59E0B' },
  { key: 'APPROVED', label: 'Đã duyệt', icon: <CheckCircle />, color: '#10B981' },
  { key: 'PUBLISHED', label: 'Đang mở bán', icon: <Public />, color: '#5E35B1' },
  { key: 'CANCELLED', label: 'Đã hủy', icon: <Cancel />, color: '#EF4444' },
  { key: 'COMPLETED', label: 'Hoàn tất', icon: <TaskAlt />, color: '#0EA5E9' },
];

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
];

const StatBox = ({ icon, label, value, color, onClick }) => (
  <Paper
    variant="outlined"
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: 2.5,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick
        ? { borderColor: color, transform: 'translateY(-2px)', boxShadow: 2 }
        : {},
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}20`,
          color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const formatYAxisValue = (val) => {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toLocaleString('vi-VN');
};

const OrganizerDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState('7d');
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await organizerAPI.getStatistics();
        setStats(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadRevenue = useCallback(async (selectedPeriod) => {
    try {
      setRevenueLoading(true);
      setRevenueError(null);
      const res = await organizerAPI.getRevenueStatistics(selectedPeriod);
      setRevenueData(res.data);
    } catch (err) {
      setRevenueError(getErrorMessage(err));
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRevenue(period);
  }, [period, loadRevenue]);

  const handlePeriodChange = (_, newPeriod) => {
    if (newPeriod) setPeriod(newPeriod);
  };

  const byStatus = useMemo(() => stats?.byStatus || {}, [stats]);
  const totalEvents = stats?.totalEvents ?? 0;
  const totalTicketsSold = stats?.totalTicketsSold ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;

  const revenueChartData = useMemo(() => {
    if (!revenueData?.series) return [];
    return revenueData.series.map((point) => ({
      date: dayjs(point.date).format('DD/MM'),
      revenue: Number(point.revenue) || 0,
      ticketsSold: Number(point.ticketsSold) || 0,
    }));
  }, [revenueData]);

  const statusBarData = useMemo(
    () =>
      STATUS_CARDS.map((s) => ({
        name: s.label,
        value: byStatus[s.key] ?? 0,
        color: s.color,
      })),
    [byStatus]
  );

  const periodRevenueTotal = Number(revenueData?.totalRevenue) || 0;
  const periodTicketsTotal = Number(revenueData?.totalTicketsSold) || 0;

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Tổng quan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý sự kiện và theo dõi doanh thu
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/organizer/events/create')}
        >
          Tạo sự kiện mới
        </Button>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.lighter', color: 'error.dark' }}>
          {error}
        </Paper>
      )}

      {/* Top stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {loading ? (
            <Skeleton variant="rounded" height={96} />
          ) : (
            <StatBox
              icon={<EventIcon />}
              label="Tổng sự kiện"
              value={totalEvents}
              color="#5E35B1"
              onClick={() => navigate('/organizer/events')}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {loading ? (
            <Skeleton variant="rounded" height={96} />
          ) : (
            <StatBox
              icon={<ConfirmationNumber />}
              label="Vé đã bán"
              value={totalTicketsSold.toLocaleString('vi-VN')}
              color="#0EA5E9"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {loading ? (
            <Skeleton variant="rounded" height={96} />
          ) : (
            <StatBox
              icon={<Paid />}
              label="Tổng doanh thu"
              value={formatCurrency(totalRevenue)}
              color="#10B981"
            />
          )}
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingUp sx={{ color: '#5E35B1' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Doanh thu theo thời gian
              </Typography>
            </Stack>
            {!revenueLoading && !revenueError && revenueData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Tổng {formatCurrency(periodRevenueTotal)} •{' '}
                {periodTicketsTotal.toLocaleString('vi-VN')} vé
              </Typography>
            )}
          </Box>
          <ToggleButtonGroup
            size="small"
            value={period}
            exclusive
            onChange={handlePeriodChange}
            disabled={revenueLoading}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <ToggleButton key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {revenueError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => loadRevenue(period)}
              >
                Thử lại
              </Button>
            }
          >
            {revenueError}
          </Alert>
        ) : revenueLoading ? (
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
        ) : revenueChartData.length === 0 ? (
          <Box
            sx={{
              height: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'text.secondary',
            }}
          >
            <TrendingUp sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography variant="body2">
              Chưa có dữ liệu doanh thu trong khoảng thời gian này
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={revenueChartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="organizerRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5E35B1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#5E35B1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxisValue}
                width={60}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === 'revenue'
                    ? [formatCurrency(value), 'Doanh thu']
                    : [value.toLocaleString('vi-VN'), 'Vé bán']
                }
                contentStyle={{
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#5E35B1"
                strokeWidth={3}
                fill="url(#organizerRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* By status — Bar chart + cards */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Sự kiện theo trạng thái
        </Typography>

        {loading ? (
          <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2, mb: 3 }} />
        ) : totalEvents === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Bạn chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên để xem thống kê!
          </Alert>
        ) : (
          <Box sx={{ mb: 3 }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={statusBarData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value) => [value, 'Số sự kiện']}
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        <Grid container spacing={2}>
          {STATUS_CARDS.map((s) => (
            <Grid key={s.key} size={{ xs: 6, sm: 4, md: 2 }}>
              {loading ? (
                <Skeleton variant="rounded" height={120} />
              ) : (
                <Paper
                  variant="outlined"
                  onClick={() =>
                    navigate(`/organizer/events?status=${s.key}`)
                  }
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    '&:hover': {
                      borderColor: s.color,
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                    },
                  }}
                >
                  <Box sx={{ color: s.color, mb: 0.5 }}>{s.icon}</Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: s.color }}
                  >
                    {byStatus[s.key] ?? 0}
                  </Typography>
                  <Chip
                    label={s.label}
                    size="small"
                    sx={{ mt: 0.5, fontSize: '0.7rem' }}
                  />
                </Paper>
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default OrganizerDashboardPage;
