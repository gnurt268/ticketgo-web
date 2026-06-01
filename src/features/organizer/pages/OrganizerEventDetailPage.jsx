import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Tabs,
  Tab,
  Chip,
  Skeleton,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Publish,
  Send,
  Cancel,
  Add,
  EventSeat,
  GridOn,
  DeleteOutline,
  ToggleOn,
  ToggleOff,
  ConfirmationNumber,
  CheckCircle,
  HighlightOff,
  QrCodeScanner,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import organizerAPI from '../organizerAPI';
import TicketZoneDialog from '../components/TicketZoneDialog';
import GenerateSeatsDialog from '../components/GenerateSeatsDialog';
import SeatMapPreviewDialog from '../components/SeatMapPreviewDialog';
import {
  formatCurrency,
  formatDateTime,
  getErrorMessage,
} from '@/utils/helpers';

const STATUS_META = {
  DRAFT: { label: 'Bản nháp', color: 'default' },
  PENDING: { label: 'Chờ duyệt', color: 'warning' },
  APPROVED: { label: 'Đã duyệt', color: 'success' },
  PUBLISHED: { label: 'Đang mở bán', color: 'primary' },
  CANCELLED: { label: 'Đã hủy', color: 'error' },
  COMPLETED: { label: 'Hoàn tất', color: 'info' },
};

const TICKET_STATUS_META = {
  VALID: { label: 'Hợp lệ', color: 'success' },
  CHECKED_IN: { label: 'Đã check-in', color: 'primary' },
  CANCELLED: { label: 'Đã hủy', color: 'error' },
  EXPIRED: { label: 'Hết hạn', color: 'default' },
  TRANSFERRED: { label: 'Đã chuyển', color: 'info' },
};

const InfoRow = ({ label, value }) => (
  <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500, flex: 1, wordBreak: 'break-word' }}>
      {value ?? '—'}
    </Typography>
  </Stack>
);

const OrganizerEventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Zones
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zoneDialog, setZoneDialog] = useState({ open: false, zone: null });
  const [seatsDialog, setSeatsDialog] = useState({ open: false, zone: null });
  const [seatMapDialog, setSeatMapDialog] = useState({ open: false, zone: null });

  // Cancel
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Tickets
  const [tickets, setTickets] = useState({ content: [], totalElements: 0 });
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketPage, setTicketPage] = useState(0);
  const [ticketSize, setTicketSize] = useState(20);
  const [ticketStatus, setTicketStatus] = useState('');

  // Staff (nhân viên check-in)
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [assigningStaff, setAssigningStaff] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await organizerAPI.getEventDetail(id);
      setEvent(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadZones = useCallback(async () => {
    try {
      setZonesLoading(true);
      const res = await organizerAPI.getEventZones(id);
      setZones(res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setZonesLoading(false);
    }
  }, [id]);

  const loadTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);
      const params = { page: ticketPage, size: ticketSize };
      if (ticketStatus) params.status = ticketStatus;
      const res = await organizerAPI.getEventTickets(id, params);
      setTickets(res.data || { content: [], totalElements: 0 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTicketsLoading(false);
    }
  }, [id, ticketPage, ticketSize, ticketStatus]);

  const loadStaff = useCallback(async () => {
    try {
      setStaffLoading(true);
      const res = await organizerAPI.getEventStaff(id);
      setStaff(res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStaffLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    if (tab === 1) loadZones();
  }, [tab, loadZones]);

  useEffect(() => {
    if (tab === 2) loadTickets();
  }, [tab, loadTickets]);

  useEffect(() => {
    if (tab === 3) loadStaff();
  }, [tab, loadStaff]);

  const handleSubmitForApproval = async () => {
    try {
      await organizerAPI.submitForApproval(id);
      toast.success('Đã gửi yêu cầu duyệt');
      loadEvent();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handlePublish = async () => {
    try {
      await organizerAPI.publishEvent(id);
      toast.success('Đã xuất bản sự kiện');
      loadEvent();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await organizerAPI.cancelEvent(id, cancelReason);
      toast.success('Đã hủy sự kiện');
      setCancelOpen(false);
      setCancelReason('');
      loadEvent();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!staffEmail.trim()) return;
    try {
      setAssigningStaff(true);
      await organizerAPI.assignEventStaff(id, staffEmail.trim());
      toast.success('Đã giao nhân viên check-in');
      setStaffEmail('');
      loadStaff();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAssigningStaff(false);
    }
  };

  const handleRemoveStaff = async (userId) => {
    if (!window.confirm('Gỡ nhân viên này khỏi sự kiện?')) return;
    try {
      await organizerAPI.removeEventStaff(id, userId);
      toast.success('Đã gỡ nhân viên');
      loadStaff();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteZone = async (zone) => {
    if (!window.confirm(`Xóa khu vực "${zone.zoneName}"?`)) return;
    try {
      await organizerAPI.deleteZone(zone.id);
      toast.success('Đã xóa khu vực');
      loadZones();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleZone = async (zone) => {
    try {
      await organizerAPI.toggleZoneActive(zone.id);
      loadZones();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const statusMeta = event && STATUS_META[event.status];

  const canEdit = useMemo(
    () => event && ['DRAFT', 'PENDING'].includes(event.status),
    [event],
  );
  const canSubmit = event?.status === 'DRAFT';
  const canPublish = event?.status === 'APPROVED';
  const canCancel =
    event && !['CANCELLED', 'COMPLETED'].includes(event.status);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={140} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  if (!event) return null;

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ mb: 2, flexWrap: 'wrap', gap: 2 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => navigate('/organizer/events')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {event.title}
              </Typography>
              {statusMeta && (
                <Chip
                  label={statusMeta.label}
                  color={statusMeta.color}
                  size="small"
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              ID: {event.id} · {event.slug}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {event.status === 'PUBLISHED' && (
            <Button
              variant="contained"
              startIcon={<QrCodeScanner />}
              onClick={() => navigate(`/checkin/${id}`)}
            >
              Check-in
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/organizer/events/${id}/edit`)}
            >
              Chỉnh sửa
            </Button>
          )}
          {canSubmit && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<Send />}
              onClick={handleSubmitForApproval}
            >
              Gửi duyệt
            </Button>
          )}
          {canPublish && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Publish />}
              onClick={handlePublish}
            >
              Xuất bản
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setCancelOpen(true)}
            >
              Hủy sự kiện
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Vé đã bán
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {(event.totalTicketsSold ?? 0).toLocaleString('vi-VN')}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Doanh thu
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatCurrency(event.totalRevenue || 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Lượt xem
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {(event.viewCount ?? 0).toLocaleString('vi-VN')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Thông tin" />
          <Tab label="Khu vực vé" />
          <Tab label="Vé đã bán" />
          <Tab label="Nhân viên check-in" />
        </Tabs>
        <Divider />

        {/* Tab 0: Info */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }}>
                {event.posterUrl ? (
                  <Box
                    component="img"
                    src={event.posterUrl}
                    alt={event.title}
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '3/4',
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    Chưa có poster
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <InfoRow label="Danh mục" value={event.categoryName} />
                <InfoRow label="Loại" value={event.eventType} />
                <InfoRow label="Địa điểm" value={event.venue} />
                <InfoRow label="Địa chỉ" value={event.address} />
                <InfoRow label="Thành phố" value={event.city} />
                <InfoRow
                  label="Bắt đầu"
                  value={formatDateTime(event.startDate)}
                />
                <InfoRow
                  label="Kết thúc"
                  value={formatDateTime(event.endDate)}
                />
                <InfoRow
                  label="Vé tối đa / đơn"
                  value={event.maxTicketsPerOrder}
                />
                <InfoRow
                  label="Chọn ghế"
                  value={event.enableSeatSelection ? 'Có' : 'Không'}
                />
                <InfoRow
                  label="Nhận diện khuôn mặt"
                  value={
                    event.enableFaceRecognition
                      ? `Bật (ngưỡng ${event.faceRecognitionThreshold})`
                      : 'Tắt'
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Mô tả
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {event.description || '—'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Zones */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Khu vực vé ({zones.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setZoneDialog({ open: true, zone: null })}
              >
                Tạo khu vực
              </Button>
            </Stack>

            {zonesLoading ? (
              <Skeleton variant="rounded" height={200} />
            ) : zones.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
              >
                <Typography color="text.secondary">
                  Chưa có khu vực nào. Hãy tạo khu vực đầu tiên.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {zones.map((z) => (
                  <Grid key={z.id} size={{ xs: 12, md: 6 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderLeft: `4px solid ${z.colorCode || '#999'}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1" fontWeight={700}>
                              {z.zoneName}
                            </Typography>
                            <Chip
                              label={z.zoneCode}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={z.zoneType}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                            {!z.isActive && (
                              <Chip
                                label="Đã tắt"
                                size="small"
                                color="default"
                              />
                            )}
                          </Stack>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {z.description || '—'}
                          </Typography>
                        </Box>
                        <Stack direction="row">
                          <Tooltip title={z.isActive ? 'Tắt' : 'Bật'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleZone(z)}
                            >
                              {z.isActive ? <ToggleOn /> : <ToggleOff />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xem sơ đồ ghế">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setSeatMapDialog({ open: true, zone: z })
                              }
                            >
                              <GridOn fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Tạo sơ đồ ghế">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setSeatsDialog({ open: true, zone: z })
                              }
                            >
                              <EventSeat fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setZoneDialog({ open: true, zone: z })
                              }
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteZone(z)}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={1}>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">
                            Giá
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(z.price)}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">
                            Đã bán / Tổng
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {(z.soldCapacity ?? 0).toLocaleString('vi-VN')} /{' '}
                            {(z.totalCapacity ?? 0).toLocaleString('vi-VN')}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">
                            Còn lại
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {(z.availableCapacity ?? 0).toLocaleString('vi-VN')}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">
                            Tỉ lệ bán
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {(z.soldPercentage ?? 0).toFixed(1)}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 2: Tickets */}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2, flexWrap: 'wrap' }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                Vé đã bán
              </Typography>
              <TextField
                select
                size="small"
                label="Trạng thái"
                value={ticketStatus}
                onChange={(e) => {
                  setTicketStatus(e.target.value);
                  setTicketPage(0);
                }}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {Object.entries(TICKET_STATUS_META).map(([key, meta]) => (
                  <MenuItem key={key} value={key}>
                    {meta.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {ticketsLoading ? (
              <Skeleton variant="rounded" height={300} />
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã vé</TableCell>
                      <TableCell>Chủ sở hữu</TableCell>
                      <TableCell>Khu vực</TableCell>
                      <TableCell>Ghế</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Check-in</TableCell>
                      <TableCell>Ngày mua</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(tickets.content || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            Chưa có vé nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (tickets.content || []).map((t) => {
                        const meta =
                          TICKET_STATUS_META[t.status] || {
                            label: t.status,
                            color: 'default',
                          };
                        return (
                          <TableRow key={t.id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <ConfirmationNumber
                                  fontSize="small"
                                  color="primary"
                                />
                                <Typography variant="body2" fontFamily="monospace">
                                  {t.ticketCode}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                  {t.holderName?.charAt(0) || '?'}
                                </Avatar>
                                <Typography variant="body2">
                                  {t.holderName || '—'}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={t.zoneName}
                                size="small"
                                sx={{
                                  bgcolor: `${t.zoneColorCode || '#999'}20`,
                                  color: t.zoneColorCode || 'text.primary',
                                }}
                              />
                            </TableCell>
                            <TableCell>{t.seatCode || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={meta.label}
                                color={meta.color}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {t.isCheckedIn ? (
                                <CheckCircle color="success" fontSize="small" />
                              ) : (
                                <HighlightOff color="disabled" fontSize="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {formatDateTime(t.createdAt)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={tickets.totalElements || 0}
                  page={ticketPage}
                  onPageChange={(_, p) => setTicketPage(p)}
                  rowsPerPage={ticketSize}
                  onRowsPerPageChange={(e) => {
                    setTicketSize(Number(e.target.value));
                    setTicketPage(0);
                  }}
                  rowsPerPageOptions={[10, 20, 50]}
                />
              </Paper>
            )}
          </Box>
        )}

        {/* Tab 3: Nhân viên check-in */}
        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Nhân viên check-in ({staff.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Giao nhân viên (tài khoản vai trò STAFF) để họ soát vé cho sự kiện này.
            </Typography>

            <Stack
              component="form"
              direction="row"
              spacing={1}
              onSubmit={handleAssignStaff}
              sx={{ mb: 3, maxWidth: 480 }}
            >
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="Email nhân viên (STAFF)"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                disabled={assigningStaff || !staffEmail.trim()}
              >
                Giao
              </Button>
            </Stack>

            {staffLoading ? (
              <Skeleton variant="rounded" height={120} />
            ) : staff.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Chưa có nhân viên nào được giao.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nhân viên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Ngày giao</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staff.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 28, height: 28 }}>
                            {(s.fullName || s.email || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">{s.fullName || '—'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{formatDateTime(s.assignedAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Gỡ">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveStaff(s.userId)}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      <TicketZoneDialog
        open={zoneDialog.open}
        onClose={() => setZoneDialog({ open: false, zone: null })}
        eventId={id}
        zone={zoneDialog.zone}
        onSaved={loadZones}
      />

      {seatsDialog.zone && (
        <GenerateSeatsDialog
          open={seatsDialog.open}
          onClose={() => setSeatsDialog({ open: false, zone: null })}
          zone={seatsDialog.zone}
          onGenerated={loadZones}
        />
      )}

      {seatMapDialog.zone && (
        <SeatMapPreviewDialog
          open={seatMapDialog.open}
          onClose={() => setSeatMapDialog({ open: false, zone: null })}
          zone={seatMapDialog.zone}
          onDeleted={loadZones}
        />
      )}

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hủy sự kiện</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Hành động này không thể hoàn tác. Khách đã mua vé sẽ được thông báo.
          </Typography>
          <TextField
            label="Lý do hủy"
            fullWidth
            multiline
            minRows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCancelOpen(false)} disabled={cancelling}>
            Đóng
          </Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            color="error"
            disabled={cancelling}
            startIcon={cancelling && <CircularProgress size={16} color="inherit" />}
          >
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizerEventDetailPage;
