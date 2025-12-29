import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import {
  Cancel,
  Refresh,
  Home,
  SupportAgent,
} from '@mui/icons-material';
import { keyframes } from '@mui/material';
import orderAPI from '../orderAPI';
import { formatCurrency } from '@/utils/helpers';

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const errorMessage = searchParams.get('message');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setLoading(false);
        return;
      }

      try {
        const response = await orderAPI.getOrderByCode(orderCode);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode]);

  const handleRetryPayment = async () => {
    if (!orderCode) return;

    setRetrying(true);
    setError(null);

    try {
      const response = await orderAPI.retryPayment(orderCode);
      const payment = response.data;

      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      }
    } catch (err) {
      console.error('Retry payment error:', err);
      setError(
        err.response?.data?.message ||
          'Không thể thử lại thanh toán. Vui lòng tạo đơn hàng mới.'
      );
      setRetrying(false);
    }
  };

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

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              py: 5,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                animation: `${shake} 0.5s ease`,
              }}
            >
              <Cancel sx={{ fontSize: 80, color: 'white' }} />
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
              Thanh toán thất bại
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.9)',
                mt: 1,
                animation: `${fadeInUp} 0.5s ease 0.3s forwards`,
                opacity: 0,
              }}
            >
              Đã có lỗi xảy ra trong quá trình thanh toán
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4, animation: `${fadeInUp} 0.5s ease 0.4s forwards`, opacity: 0 }}>
            {/* Error Message */}
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {errorMessage || 'Giao dịch không thành công. Vui lòng thử lại hoặc sử dụng phương thức thanh toán khác.'}
              </Typography>
            </Alert>

            {/* Order Info */}
            {order && (
              <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Thông tin đơn hàng
                </Typography>
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  {order.eventTitle}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography color="text.secondary">Mã đơn hàng</Typography>
                  <Typography fontWeight={500}>{order.orderCode}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography color="text.secondary">Số lượng vé</Typography>
                  <Typography fontWeight={500}>{order.quantity}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography color="text.secondary">Tổng tiền</Typography>
                  <Typography fontWeight={700} color="primary.main">
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </Box>

                {order.remainingSeconds > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Đơn hàng còn hiệu lực trong{' '}
                      <strong>
                        {Math.floor(order.remainingSeconds / 60)} phút{' '}
                        {order.remainingSeconds % 60} giây
                      </strong>
                    </Typography>
                  </Alert>
                )}
              </Paper>
            )}

            {/* Retry Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Common Reasons */}
            <Typography variant="subtitle2" gutterBottom>
              Nguyên nhân có thể:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 3, color: 'text.secondary' }}>
              <li>Số dư tài khoản không đủ</li>
              <li>Thẻ/Tài khoản bị khóa hoặc hết hạn</li>
              <li>Kết nối mạng không ổn định</li>
              <li>Hủy giao dịch trước khi hoàn tất</li>
              <li>Vượt quá hạn mức giao dịch trong ngày</li>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {order && order.remainingSeconds > 0 && (
                <Button
                  variant="contained"
                  startIcon={retrying ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                  onClick={handleRetryPayment}
                  disabled={retrying}
                >
                  {retrying ? 'Đang xử lý...' : 'Thử lại thanh toán'}
                </Button>
              )}
              <Button
                component={Link}
                to="/events"
                variant={order?.remainingSeconds > 0 ? 'outlined' : 'contained'}
                startIcon={<Home />}
              >
                Quay lại tìm vé
              </Button>
              <Button
                variant="text"
                startIcon={<SupportAgent />}
                onClick={() => window.open('mailto:support@ticketgo.vn', '_blank')}
              >
                Liên hệ hỗ trợ
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentFailedPage;