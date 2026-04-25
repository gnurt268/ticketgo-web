import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  IconButton,
  Skeleton,
  Pagination,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Payment,
  Cancel as CancelIcon,
  ConfirmationNumber,
  Refresh,
  ErrorOutline,
  Receipt,
  CalendarMonth,
  Place,
  ShoppingBag,
  HourglassTop,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { orderAPI } from '@/features/orders';
import { formatCurrency, formatDateTime, getErrorMessage } from '@/utils/helpers';
import { ORDER_STATUS } from '@/utils/constants';

const STATUS_META = {
  [ORDER_STATUS.PENDING]: { label: 'Chờ thanh toán', color: 'warning' },
  [ORDER_STATUS.PROCESSING]: { label: 'Đang xử lý', color: 'info' },
  [ORDER_STATUS.COMPLETED]: { label: 'Đã thanh toán', color: 'success' },
  [ORDER_STATUS.FAILED]: { label: 'Thanh toán thất bại', color: 'error' },
  [ORDER_STATUS.EXPIRED]: { label: 'Đã hết hạn', color: 'default' },
  [ORDER_STATUS.CANCELLED]: { label: 'Đã hủy', color: 'default' },
  [ORDER_STATUS.REFUNDED]: { label: 'Đã hoàn tiền', color: 'secondary' },
};

const PAGE_SIZE = 5;

const OrderCard = ({ order, onCancel, onRetry, onViewTickets }) => {
  const navigate = useNavigate();
  const status = STATUS_META[order.paymentStatus] || {
    label: order.paymentStatus,
    color: 'default',
  };
  const isPending = order.paymentStatus === ORDER_STATUS.PENDING;
  const isPaid = order.paymentStatus === ORDER_STATUS.COMPLETED;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 2, borderColor: 'primary.light' },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        {/* Poster */}
        <Box
          onClick={() => order.eventId && navigate(`/events/${order.eventId}`)}
          sx={{
            width: { xs: '100%', sm: 120 },
            height: { xs: 140, sm: 120 },
            flexShrink: 0,
            borderRadius: 1.5,
            overflow: 'hidden',
            bgcolor: 'action.hover',
            cursor: order.eventId ? 'pointer' : 'default',
            backgroundImage: order.eventPosterUrl
              ? `url(${order.eventPosterUrl})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, lineHeight: 1.3 }}
                noWrap
                title={order.eventTitle}
              >
                {order.eventTitle || 'Sự kiện'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mã đơn: <b>{order.orderCode}</b>
              </Typography>
            </Box>
            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}
          >
            {order.eventStartDate && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(order.eventStartDate)}
                </Typography>
              </Stack>
            )}
            {order.eventVenue && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Place sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  title={order.eventVenue}
                >
                  {order.eventVenue}
                </Typography>
              </Stack>
            )}
            {isPending && order.paymentExpiredAt && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <HourglassTop sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="caption" color="warning.main" fontWeight={600}>
                  Hạn thanh toán: {formatDateTime(order.paymentExpiredAt)}
                </Typography>
              </Stack>
            )}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                {order.zoneName || 'Vé'} × <b>{order.quantity}</b>
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatCurrency(order.totalAmount)}
              </Typography>
              {order.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Đặt lúc {formatDateTime(order.createdAt)}
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              {isPending && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={() =>
                      order.paymentUrl
                        ? (window.location.href = order.paymentUrl)
                        : onRetry(order)
                    }
                  >
                    Thanh toán
                  </Button>
                  <Tooltip title="Hủy đơn hàng">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onCancel(order)}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {isPaid && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ConfirmationNumber />}
                  onClick={() => onViewTickets(order)}
                >
                  Xem vé
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

const OrdersTab = ({ active }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = useCallback(async (pageIndex) => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderAPI.getMyOrders({ page: pageIndex, size: PAGE_SIZE });
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      loadOrders(page);
    }
  }, [active, page, loadOrders]);

  const handleCancel = async (order) => {
    if (!window.confirm(`Hủy đơn hàng ${order.orderCode}? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      setCancellingId(order.id);
      await orderAPI.cancelOrder(order.id);
      toast.success('Đã hủy đơn hàng');
      loadOrders(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  const handleRetry = async (order) => {
    try {
      const res = await orderAPI.retryPayment(order.orderCode);
      const paymentUrl = res.data?.paymentUrl || res.data?.url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.info('Không nhận được liên kết thanh toán');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleViewTickets = () => {
    navigate('/my-tickets');
  };

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Đơn hàng của tôi
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalElements > 0 ? `${totalElements} đơn hàng` : 'Danh sách giao dịch'}
          </Typography>
        </Box>
        <Tooltip title="Làm mới">
          <IconButton onClick={() => loadOrders(page)} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Stack>

      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'error.lighter',
            color: 'error.dark',
          }}
        >
          <ErrorOutline />
          <Typography variant="body2" sx={{ flex: 1 }}>
            {error}
          </Typography>
          <Button size="small" color="error" variant="outlined" onClick={() => loadOrders(page)}>
            Thử lại
          </Button>
        </Paper>
      )}

      <Stack spacing={2}>
        {loading && !data ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} variant="rounded" height={140} />
          ))
        ) : orders.length === 0 && !error ? (
          <Paper
            variant="outlined"
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 2,
              borderStyle: 'dashed',
            }}
          >
            <ShoppingBag sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Chưa có đơn hàng nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Khám phá các sự kiện hấp dẫn và đặt vé ngay.
            </Typography>
            <Button variant="contained" startIcon={<Receipt />} onClick={() => navigate('/events')}>
              Khám phá sự kiện
            </Button>
          </Paper>
        ) : (
          orders.map((order) => (
            <Box key={order.id} sx={{ opacity: cancellingId === order.id ? 0.6 : 1 }}>
              <OrderCard
                order={order}
                onCancel={handleCancel}
                onRetry={handleRetry}
                onViewTickets={handleViewTickets}
              />
            </Box>
          ))
        )}
      </Stack>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, newPage) => setPage(newPage - 1)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};

export default OrdersTab;
