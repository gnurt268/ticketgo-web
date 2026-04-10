import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCart, clearCart } from '@/features/cart';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  IconButton,
} from '@mui/material';
import {
  CalendarMonth,
  LocationOn,
  ConfirmationNumber,
  Person,
  Email,
  Phone,
  Payment,
  ArrowBack,
  ExpandMore,
  Timer,
  Security,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import orderAPI from '../orderAPI';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useAuth } from '@/hooks';

// Validation schema
const checkoutSchema = yup.object({
  buyerName: yup
    .string()
    .required('Vui lòng nhập họ tên')
    .max(255, 'Họ tên không quá 255 ký tự'),
  buyerEmail: yup
    .string()
    .required('Vui lòng nhập email')
    .email('Email không hợp lệ'),
  buyerPhone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
  notes: yup.string().max(500, 'Ghi chú không quá 500 ký tự'),
  agreeTerms: yup
    .boolean()
    .oneOf([true], 'Bạn cần đồng ý với điều khoản sử dụng'),
});

const STEPS = ['Thông tin đặt vé', 'Thanh toán'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const {
    eventId,
    eventTitle,
    eventDate,
    eventVenue,
    eventPosterUrl,
    selectedTickets,
    ticketZones,
  } = useSelector(selectCart);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      buyerName: user?.fullName || '',
      buyerEmail: user?.email || '',
      buyerPhone: user?.phone || '',
      notes: '',
      agreeTerms: false,
    },
  });

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/events', {
        state: { message: 'Phiên đặt vé đã hết hạn. Vui lòng thử lại.' },
      });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  // Redirect if no data
  useEffect(() => {
    if (!eventId || !selectedTickets || Object.keys(selectedTickets).length === 0) {
      navigate('/events');
    }
  }, [eventId, selectedTickets, navigate]);

  // Calculate totals
  const calculateOrderItems = () => {
    if (!selectedTickets || !ticketZones) return [];

    return Object.entries(selectedTickets).map(([zoneId, quantity]) => {
      const zone = ticketZones.find((z) => z.id === parseInt(zoneId, 10));
      return {
        zoneId: parseInt(zoneId, 10),
        zoneName: zone?.zoneName || '',
        price: zone?.price || 0,
        quantity,
        subtotal: (zone?.price || 0) * quantity,
      };
    });
  };

  const orderItems = calculateOrderItems();
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Format countdown
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle form submit
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Create order for each ticket zone
      // For simplicity, we'll create one order for the first zone
      // In production, you might want to handle multiple zones differently
      const firstItem = orderItems[0];

      const orderData = {
        eventId,
        ticketZoneId: firstItem.zoneId,
        quantity: firstItem.quantity,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        notes: data.notes,
      };

      const response = await orderAPI.createOrder(orderData);
      const order = response.data;
      console.log('Order response:', order); 
    console.log('Payment URL:', order.paymentUrl);
      dispatch(clearCart());
      // If payment URL exists, redirect to VNPay
      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        // Redirect to order confirmation
        navigate(`/orders/${order.orderCode}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.message ||
          'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.'
      );
      setLoading(false);
    }
  };

  if (!eventId) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to={`/events/${eventId}`}
            startIcon={<ArrowBack />}
            sx={{ mb: 2 }}
          >
            Quay lại
          </Button>

          <Typography variant="h4" fontWeight={700} gutterBottom>
            Thanh toán
          </Typography>

          {/* Countdown Timer */}
          <Alert
            severity={countdown < 60 ? 'error' : 'warning'}
            icon={<Timer />}
            sx={{ mb: 3 }}
          >
            <Typography variant="body2">
              Vé sẽ được giữ trong{' '}
              <strong>{formatCountdown(countdown)}</strong>. Vui lòng hoàn tất
              thanh toán trước khi hết thời gian.
            </Typography>
          </Alert>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ borderRadius: 3, overflow: 'hidden' }}
            >
              {/* Event Summary */}
              <Box sx={{ p: 3, bgcolor: 'primary.lighter' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {eventPosterUrl && (
                    <Box
                      component="img"
                      src={eventPosterUrl}
                      alt={eventTitle}
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {eventTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CalendarMonth fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(eventDate, 'dddd, DD/MM/YYYY • HH:mm')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="secondary" />
                      <Typography variant="body2" color="text.secondary">
                        {eventVenue}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Buyer Information */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Thông tin người đặt
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="buyerName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Họ và tên *"
                          error={!!errors.buyerName}
                          helperText={errors.buyerName?.message}
                          InputProps={{
                            startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="buyerEmail"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Email *"
                          type="email"
                          error={!!errors.buyerEmail}
                          helperText={errors.buyerEmail?.message || 'Vé sẽ được gửi qua email này'}
                          InputProps={{
                            startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="buyerPhone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Số điện thoại *"
                          error={!!errors.buyerPhone}
                          helperText={errors.buyerPhone?.message}
                          InputProps={{
                            startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Ghi chú (tùy chọn)"
                          multiline
                          rows={2}
                          error={!!errors.notes}
                          helperText={errors.notes?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Payment Method */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Phương thức thanh toán
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 2,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png"
                      alt="VNPay"
                      sx={{ height: 40 }}
                    />
                    <Box>
                      <Typography fontWeight={600}>VNPay</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Thanh toán qua VNPay QR, ATM, Visa, MasterCard
                      </Typography>
                    </Box>
                    <Chip label="Mặc định" color="primary" size="small" sx={{ ml: 'auto' }} />
                  </Box>
                </Paper>
              </Box>

              <Divider />

              {/* Terms & Submit */}
              <Box sx={{ p: 3 }}>
                <Controller
                  name="agreeTerms"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label={
                        <Typography variant="body2">
                          Tôi đồng ý với{' '}
                          <Link to="/terms" style={{ color: 'inherit' }}>
                            Điều khoản sử dụng
                          </Link>{' '}
                          và{' '}
                          <Link to="/privacy" style={{ color: 'inherit' }}>
                            Chính sách bảo mật
                          </Link>
                        </Typography>
                      }
                    />
                  )}
                />
                {errors.agreeTerms && (
                  <Typography variant="caption" color="error">
                    {errors.agreeTerms.message}
                  </Typography>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `Thanh toán ${formatCurrency(totalAmount)}`
                  )}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                  <Security sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Giao dịch được bảo mật bởi VNPay
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ borderRadius: 3, p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                <ConfirmationNumber sx={{ mr: 1, verticalAlign: 'middle' }} />
                Chi tiết đơn hàng
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Ticket Items */}
              {orderItems.map((item) => (
                <Box
                  key={item.zoneId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    py: 1.5,
                    borderBottom: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography fontWeight={500}>{item.zoneName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} x {formatCurrency(item.price)}
                    </Typography>
                  </Box>
                  <Typography fontWeight={500}>
                    {formatCurrency(item.subtotal)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Totals */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Tạm tính</Typography>
                <Typography>{formatCurrency(totalAmount)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Phí dịch vụ</Typography>
                <Typography color="success.main">Miễn phí</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={600}>
                  Tổng cộng
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {formatCurrency(totalAmount)}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ({totalQuantity} vé)
              </Typography>

              {/* FAQ */}
              <Accordion sx={{ mt: 3, boxShadow: 'none', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight={500}>
                    Câu hỏi thường gặp
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Vé có thể hoàn/đổi không?</strong>
                    <br />
                    Vé đã mua không thể hoàn hoặc đổi. Vui lòng kiểm tra kỹ thông tin trước khi thanh toán.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Tôi nhận vé như thế nào?</strong>
                    <br />
                    Vé điện tử sẽ được gửi qua email sau khi thanh toán thành công.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CheckoutPage;