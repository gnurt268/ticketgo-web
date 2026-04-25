import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Alert,
  alpha,
  TextField,
  InputAdornment,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Close,
  CalendarMonth,
  LocationOn,
  ConfirmationNumber,
  EventSeat,
  Person,
  Email,
  Phone,
  Download,
  Share,
  QrCode2,
  CheckCircle,
  SwapHoriz,
  Badge as BadgeIcon,
  Info,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { formatDate, formatCurrency, getErrorMessage } from '@/utils/helpers';
import ticketAPI from '../ticketAPI';

const statusConfig = {
  ACTIVE: { label: 'Hợp lệ', color: 'success' },
  USED: { label: 'Đã sử dụng', color: 'default' },
  PENDING: { label: 'Chờ thanh toán', color: 'warning' },
  CANCELLED: { label: 'Đã hủy', color: 'error' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'info' },
  TRANSFERRED: { label: 'Đã chuyển nhượng', color: 'info' },
};

const transferSchema = yup.object({
  recipientName: yup
    .string()
    .required('Vui lòng nhập họ tên người nhận')
    .max(255, 'Họ tên tối đa 255 ký tự'),
  recipientEmail: yup
    .string()
    .required('Vui lòng nhập email người nhận')
    .email('Email không hợp lệ'),
  recipientPhone: yup
    .string()
    .required('Vui lòng nhập số điện thoại người nhận')
    .max(20, 'Số điện thoại tối đa 20 ký tự')
    .matches(/^(\+?84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  recipientIdNumber: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .max(50, 'CCCD/CMND tối đa 50 ký tự'),
});

const TicketDetailModal = ({ open, onClose, ticketId, initialData, onTransferred }) => {
  const [ticket, setTicket] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  const {
    control: transferControl,
    handleSubmit: handleTransferSubmit,
    reset: resetTransferForm,
    formState: { errors: transferErrors },
  } = useForm({
    resolver: yupResolver(transferSchema),
    defaultValues: {
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      recipientIdNumber: '',
    },
  });

  useEffect(() => {
    if (open && ticketId && !initialData) {
      fetchTicketDetail();
    } else if (initialData) {
      setTicket(initialData);
      setLoading(false);
    }
  }, [open, ticketId, initialData]);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketAPI.getTicketById(ticketId);
      setTicket(response.data);
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Không thể tải thông tin vé');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!ticket?.id) return;

    try {
      setQrLoading(true);
      const response = await ticketAPI.downloadQRCode(ticket.id);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticket.ticketCode}-qr.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR:', err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleOpenTransfer = () => {
    resetTransferForm({
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      recipientIdNumber: '',
    });
    setTransferOpen(true);
  };

  const handleCloseTransfer = () => {
    if (transferLoading) return;
    setTransferOpen(false);
  };

  const onTransferSubmit = async (data) => {
    if (!ticket?.id) return;
    try {
      setTransferLoading(true);
      const payload = {
        recipientName: data.recipientName.trim(),
        recipientEmail: data.recipientEmail.trim(),
        recipientPhone: data.recipientPhone.trim(),
        recipientIdNumber: data.recipientIdNumber?.trim() || null,
      };
      const response = await ticketAPI.transferTicket(ticket.id, payload);
      setTicket(response.data);
      setTransferOpen(false);
      resetTransferForm();
      toast.success('Chuyển nhượng vé thành công!');
      onTransferred?.(response.data);
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Chuyển nhượng vé thất bại');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleShare = async () => {
    if (!ticket) return;

    const shareData = {
      title: `Vé ${ticket.eventTitle}`,
      text: `Vé xem sự kiện ${ticket.eventTitle} - ${formatDate(ticket.eventStartDate, 'DD/MM/YYYY HH:mm')}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\nMã vé: ${ticket.ticketCode}`
        );
        alert('Đã sao chép thông tin vé!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const statusInfo = statusConfig[ticket?.status] || statusConfig.ACTIVE;
  const isValidTicket = ticket?.status === 'ACTIVE' && !ticket?.isCheckedIn;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ConfirmationNumber color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Chi tiết vé
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : ticket ? (
          <Box>
            {/* QR Code Section */}
            {isValidTicket && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 3,
                  px: 2,
                  mb: 3,
                  bgcolor: alpha('#5E35B1', 0.04),
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'primary.light',
                }}
              >
                {ticket.qrCodeUrl ? (
                  <Box
                    component="img"
                    src={ticket.qrCodeUrl}
                    alt="QR Code"
                    sx={{
                      width: 180,
                      height: 180,
                      mx: 'auto',
                      display: 'block',
                      borderRadius: 2,
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 180,
                      height: 180,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                    }}
                  >
                    <QrCode2 sx={{ fontSize: 80, color: 'grey.400' }} />
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Quét mã QR này để check-in tại sự kiện
                </Typography>
              </Box>
            )}

            {/* Checked In Notice */}
            {ticket.isCheckedIn && (
              <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{ mb: 3, borderRadius: 2 }}
              >
                <Typography variant="body2">
                  Vé đã được check-in lúc {formatDate(ticket.checkedInAt, 'DD/MM/YYYY HH:mm')}
                </Typography>
              </Alert>
            )}

            {/* Transferred Notice */}
            {ticket.status === 'TRANSFERRED' && (
              <Alert
                severity="info"
                icon={<SwapHoriz />}
                sx={{ mb: 3, borderRadius: 2 }}
              >
                <Typography variant="body2">
                  Vé đã được chuyển nhượng
                  {ticket.transferredAt && ` lúc ${formatDate(ticket.transferredAt, 'DD/MM/YYYY HH:mm')}`}
                </Typography>
              </Alert>
            )}

            {/* Ticket Code */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Mã vé
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: 'primary.main',
                    letterSpacing: 1,
                  }}
                >
                  {ticket.ticketCode}
                </Typography>
              </Box>
              <Chip
                label={ticket.isCheckedIn ? 'Đã check-in' : statusInfo.label}
                color={ticket.isCheckedIn ? 'default' : statusInfo.color}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Event Info */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin sự kiện
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {ticket.eventTitle}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth fontSize="small" color="primary" />
                  <Typography variant="body2">
                    {formatDate(ticket.eventStartDate, 'dddd, DD/MM/YYYY • HH:mm')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" color="secondary" />
                  <Typography variant="body2">
                    {ticket.eventVenue}
                    {ticket.eventAddress && `, ${ticket.eventAddress}`}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Ticket Zone & Seat */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Khu vực
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: ticket.zoneColorCode || 'primary.main',
                    }}
                  />
                  <Typography fontWeight={500}>{ticket.zoneName}</Typography>
                </Box>
              </Grid>
              {ticket.seatCode && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Chỗ ngồi
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <EventSeat fontSize="small" color="primary" />
                    <Typography fontWeight={500}>
                      {ticket.rowNumber && `Hàng ${ticket.rowNumber} - `}
                      Ghế {ticket.seatNumber || ticket.seatCode}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Giá vé
                </Typography>
                <Typography fontWeight={600} color="primary.main">
                  {formatCurrency(ticket.zonePrice)}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Holder Info */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin người tham dự
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2">{ticket.holderName || 'Chưa cập nhật'}</Typography>
              </Box>
              {ticket.holderEmail && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">{ticket.holderEmail}</Typography>
                </Box>
              )}
              {ticket.holderPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{ticket.holderPhone}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={handleShare} startIcon={<Share />} variant="text">
          Chia sẻ
        </Button>
        <Box sx={{ flex: 1 }} />
        {isValidTicket && (
          <>
            <Button
              onClick={handleOpenTransfer}
              startIcon={<SwapHoriz />}
              variant="outlined"
              color="secondary"
            >
              Chuyển nhượng
            </Button>
            <Button
              onClick={handleDownloadQR}
              startIcon={<Download />}
              variant="contained"
              disabled={qrLoading}
            >
              {qrLoading ? 'Đang tải...' : 'Tải mã QR'}
            </Button>
          </>
        )}
      </DialogActions>

      {/* Transfer Confirmation Dialog */}
      <Dialog
        open={transferOpen}
        onClose={handleCloseTransfer}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <SwapHoriz color="secondary" />
          <Typography variant="h6" fontWeight={600}>
            Chuyển nhượng vé
          </Typography>
        </DialogTitle>
        <Box
          component="form"
          onSubmit={handleTransferSubmit(onTransferSubmit)}
          noValidate
        >
          <DialogContent dividers>
            <Alert severity="warning" icon={<Info />} sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                Sau khi chuyển nhượng, vé sẽ thuộc về người nhận và bạn không
                thể sử dụng vé này nữa. Hành động này không thể hoàn tác.
              </Typography>
            </Alert>

            {ticket && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: alpha('#5E35B1', 0.04),
                  border: '1px dashed',
                  borderColor: 'primary.light',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Vé chuyển nhượng
                </Typography>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 0.5 }}>
                  {ticket.eventTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mã vé: <strong>{ticket.ticketCode}</strong> • {ticket.zoneName}
                </Typography>
              </Box>
            )}

            <Stack spacing={2}>
              <Controller
                name="recipientName"
                control={transferControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Họ tên người nhận"
                    fullWidth
                    autoFocus
                    disabled={transferLoading}
                    error={!!transferErrors.recipientName}
                    helperText={transferErrors.recipientName?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="recipientEmail"
                control={transferControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email người nhận"
                    type="email"
                    fullWidth
                    disabled={transferLoading}
                    error={!!transferErrors.recipientEmail}
                    helperText={transferErrors.recipientEmail?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="recipientPhone"
                control={transferControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số điện thoại người nhận"
                    fullWidth
                    disabled={transferLoading}
                    error={!!transferErrors.recipientPhone}
                    helperText={transferErrors.recipientPhone?.message}
                    placeholder="0xxxxxxxxx"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="recipientIdNumber"
                control={transferControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CCCD / CMND (không bắt buộc)"
                    fullWidth
                    disabled={transferLoading}
                    error={!!transferErrors.recipientIdNumber}
                    helperText={transferErrors.recipientIdNumber?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseTransfer} disabled={transferLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={transferLoading}
              startIcon={
                transferLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SwapHoriz />
                )
              }
            >
              {transferLoading ? 'Đang xử lý...' : 'Xác nhận chuyển nhượng'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Dialog>
  );
};

export default TicketDetailModal;