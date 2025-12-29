import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  ConfirmationNumber,
  CalendarMonth,
  LocationOn,
  Email,
  Download,
  Home,
  Receipt,
} from '@mui/icons-material';
import { keyframes } from '@mui/material';
import orderAPI from '../orderAPI';
import { formatDate, formatCurrency } from '@/utils/helpers';

const scaleIn = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setError('Không tìm thấy mã đơn hàng');
        setLoading(false);
        return;
      }

      try {
        const response = await orderAPI.getOrderByCode(orderCode);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
          </Paper>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button component={Link} to="/" variant="contained">
            Về trang chủ
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        {/* Success Card */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              py: 5,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                animation: `${scaleIn} 0.5s ease forwards`,
              }}
            >
              <CheckCircle sx={{ fontSize: 80, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 700,
                mt: 2,
                animation: `${fadeInUp} 0.5s ease 0.2s forwards`,
                opacity: 0,
              }}
            >
              Thanh toán thành công!
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.9)',
                mt: 1,
                animation: `${fadeInUp} 0.5s ease 0.3s forwards`,
                opacity: 0,
              }}
            >
              Cảm ơn bạn đã mua vé trên TicketGo
            </Typography>
          </Box>

          {/* Order Info */}
          <Box sx={{ p: 4, animation: `${fadeInUp} 0.5s ease 0.4s forwards`, opacity: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Thông tin đơn hàng
              </Typography>
              <Chip
                label={`#${order.orderCode}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Event Info */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {order.eventTitle}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.eventStartDate, 'dddd, DD/MM/YYYY • HH:mm')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" color="secondary" />
                  <Typography variant="body2" color="text.secondary">
                    {order.eventVenue}, {order.eventAddress}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Ticket Info */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Loại vé
                </Typography>
                <Typography fontWeight={500}>{order.zoneName}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Số lượng
                </Typography>
                <Typography fontWeight={500}>{order.quantity} vé</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Đơn giá
                </Typography>
                <Typography fontWeight={500}>{formatCurrency(order.unitPrice)}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Tổng tiền
                </Typography>
                <Typography fontWeight={700} color="primary.main">
                  {formatCurrency(order.totalAmount)}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Buyer Info */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin người mua
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Họ tên
                </Typography>
                <Typography fontWeight={500}>{order.buyerName}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography fontWeight={500}>{order.buyerEmail}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Điện thoại
                </Typography>
                <Typography fontWeight={500}>{order.buyerPhone}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Tickets */}
            {order.tickets && order.tickets.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Vé của bạn
                </Typography>
                {order.tickets.map((ticket) => (
                  <Paper
                    key={ticket.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <ConfirmationNumber color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={500}>{ticket.ticketCode}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.holderName || order.buyerName}
                      </Typography>
                    </Box>
                    <Chip
                      label={ticket.status === 'ACTIVE' ? 'Hợp lệ' : ticket.status}
                      color="success"
                      size="small"
                    />
                  </Paper>
                ))}
              </Box>
            )}

            {/* Email Notice */}
            <Alert severity="info" icon={<Email />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                Vé điện tử đã được gửi đến <strong>{order.buyerEmail}</strong>.
                Vui lòng kiểm tra hộp thư (và thư mục spam) để nhận vé.
              </Typography>
            </Alert>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/my-tickets"
                variant="contained"
                startIcon={<ConfirmationNumber />}
              >
                Xem vé của tôi
              </Button>
              <Button
                component={Link}
                to={`/orders/${order.orderCode}`}
                variant="outlined"
                startIcon={<Receipt />}
              >
                Chi tiết đơn hàng
              </Button>
              <Button
                component={Link}
                to="/"
                variant="text"
                startIcon={<Home />}
              >
                Về trang chủ
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;