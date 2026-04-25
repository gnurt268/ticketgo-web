import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { toast } from 'react-toastify';
import organizerAPI from '../organizerAPI';
import { formatCurrency, getErrorMessage } from '@/utils/helpers';

const SEAT_STATUS_STYLES = {
  AVAILABLE: { bg: '#E8F5E9', border: '#66BB6A', color: '#2E7D32' },
  RESERVED: { bg: '#FFF3E0', border: '#FFB74D', color: '#E65100' },
  SOLD: { bg: '#FFEBEE', border: '#E57373', color: '#C62828' },
  BLOCKED: { bg: '#ECEFF1', border: '#90A4AE', color: '#455A64' },
};

const SEAT_TYPE_LABEL = {
  STANDARD: 'Tiêu chuẩn',
  VIP: 'VIP',
  WHEELCHAIR: 'Xe lăn',
  BLOCKED: 'Chặn',
};

const SeatMapPreviewDialog = ({ open, onClose, zone, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [seatMap, setSeatMap] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || !zone) return;
    (async () => {
      try {
        setLoading(true);
        const res = await organizerAPI.getZoneSeats(zone.id);
        setSeatMap(res.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        setSeatMap(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, zone]);

  const handleDeleteAll = async () => {
    if (!window.confirm('Xóa toàn bộ sơ đồ ghế của khu vực này?')) return;
    try {
      setDeleting(true);
      await organizerAPI.deleteAllSeats(zone.id);
      toast.success('Đã xóa sơ đồ ghế');
      onDeleted?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const seatsByRow = seatMap?.seatsByRow || {};
  const rowLabels = Object.keys(seatsByRow).sort();
  const totalSeats = seatMap?.totalSeats ?? 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Sơ đồ ghế — {zone?.zoneName}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : totalSeats === 0 ? (
          <Alert severity="info">
            Khu vực này chưa có sơ đồ ghế. Hãy dùng chức năng "Tạo sơ đồ ghế".
          </Alert>
        ) : (
          <>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 2 }}
            >
              <Chip label={`Tổng: ${totalSeats}`} />
              <Chip
                label={`Còn trống: ${seatMap?.availableSeats ?? 0}`}
                color="success"
                variant="outlined"
              />
              <Chip
                label={`Đã bán: ${seatMap?.soldSeats ?? 0}`}
                color="error"
                variant="outlined"
              />
              <Chip
                label={`Đang giữ: ${seatMap?.reservedSeats ?? 0}`}
                color="warning"
                variant="outlined"
              />
              <Chip
                label={`Chặn: ${seatMap?.blockedSeats ?? 0}`}
                variant="outlined"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: '80%',
                  maxWidth: 600,
                  height: 28,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px 4px 20px 20px',
                  fontSize: 12,
                  letterSpacing: 2,
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                SÂN KHẤU
              </Box>

              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Stack spacing={0.5} alignItems="center" sx={{ minWidth: 'fit-content' }}>
                  {rowLabels.map((row) => {
                    const seats = [...(seatsByRow[row] || [])].sort(
                      (a, b) => (a.seatNumber || 0) - (b.seatNumber || 0),
                    );
                    return (
                      <Stack
                        key={row}
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          sx={{ width: 28, fontWeight: 700, textAlign: 'center' }}
                        >
                          {row}
                        </Typography>
                        {seats.map((s) => {
                          const style =
                            SEAT_STATUS_STYLES[s.status] ||
                            SEAT_STATUS_STYLES.AVAILABLE;
                          const typeLabel =
                            SEAT_TYPE_LABEL[s.seatType] || s.seatType;
                          return (
                            <Box
                              key={s.id}
                              title={`${s.seatCode} · ${typeLabel} · ${formatCurrency(s.price)}`}
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '4px',
                                fontSize: 10,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: style.bg,
                                color: style.color,
                                border: `1px solid ${style.border}`,
                                cursor: 'help',
                                outline:
                                  s.seatType === 'VIP'
                                    ? '1.5px solid #F59E0B'
                                    : 'none',
                                outlineOffset: -2,
                              }}
                            >
                              {s.seatNumber}
                            </Box>
                          );
                        })}
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {(seatMap?.legend || []).map((l) => {
                const style =
                  SEAT_STATUS_STYLES[l.status] || SEAT_STATUS_STYLES.AVAILABLE;
                return (
                  <Stack
                    key={l.status}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '3px',
                        bgcolor: style.bg,
                        border: `1px solid ${style.border}`,
                      }}
                    />
                    <Typography variant="caption">{l.label}</Typography>
                  </Stack>
                );
              })}
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '3px',
                    bgcolor: '#E8F5E9',
                    border: '1px solid #66BB6A',
                    outline: '1.5px solid #F59E0B',
                    outlineOffset: -2,
                  }}
                />
                <Typography variant="caption">Ghế VIP</Typography>
              </Stack>
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        {totalSeats > 0 ? (
          <Button
            color="error"
            startIcon={<DeleteOutline />}
            onClick={handleDeleteAll}
            disabled={deleting}
          >
            {deleting ? 'Đang xóa...' : 'Xóa sơ đồ'}
          </Button>
        ) : (
          <Box />
        )}
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeatMapPreviewDialog;
