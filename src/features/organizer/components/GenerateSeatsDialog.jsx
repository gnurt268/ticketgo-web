import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  Typography,
  Divider,
  Chip,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import organizerAPI from '../organizerAPI';
import { getErrorMessage } from '@/utils/helpers';

const SEAT_TYPES = [
  { value: 'STANDARD', label: 'Tiêu chuẩn' },
  { value: 'VIP', label: 'VIP' },
  { value: 'WHEELCHAIR', label: 'Xe lăn' },
  { value: 'BLOCKED', label: 'Chặn' },
];

const parseList = (str) =>
  (str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const schema = yup.object({
  rows: yup
    .number()
    .min(1)
    .max(52)
    .required('Vui lòng nhập số hàng')
    .typeError('Số hàng không hợp lệ'),
  seatsPerRow: yup
    .number()
    .min(1)
    .max(100)
    .required('Vui lòng nhập số ghế mỗi hàng')
    .typeError('Số ghế không hợp lệ'),
  basePrice: yup
    .number()
    .min(0)
    .required('Vui lòng nhập giá cơ bản')
    .typeError('Giá không hợp lệ'),
  defaultSeatType: yup.string().required(),
  aislePositionsStr: yup.string().nullable(),
  vipRowsStr: yup.string().nullable(),
  vipPriceMultiplier: yup
    .number()
    .nullable()
    .transform((v) => (isNaN(v) ? null : v))
    .min(1, 'Hệ số phải >= 1'),
  blockedSeatsStr: yup.string().nullable(),
});

const GenerateSeatsDialog = ({ open, onClose, zone, onGenerated }) => {
  const [hasSeats, setHasSeats] = useState(false);
  const [checking, setChecking] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      rows: 10,
      seatsPerRow: 10,
      basePrice: 0,
      defaultSeatType: 'STANDARD',
      aislePositionsStr: '',
      vipRowsStr: '',
      vipPriceMultiplier: '',
      blockedSeatsStr: '',
    },
  });

  const rows = watch('rows');
  const seatsPerRow = watch('seatsPerRow');

  useEffect(() => {
    if (!open || !zone) return;
    reset({
      rows: 10,
      seatsPerRow: 10,
      basePrice: Number(zone.price || 0),
      defaultSeatType: 'STANDARD',
      aislePositionsStr: '',
      vipRowsStr: '',
      vipPriceMultiplier: '',
      blockedSeatsStr: '',
    });

    (async () => {
      try {
        setChecking(true);
        const res = await organizerAPI.getZoneSeats(zone.id);
        const count = res.data?.totalSeats ?? res.data?.allSeats?.length ?? 0;
        setHasSeats(count > 0);
      } catch {
        setHasSeats(false);
      } finally {
        setChecking(false);
      }
    })();
  }, [open, zone, reset]);

  const onSubmit = async (data) => {
    const payload = {
      rows: Number(data.rows),
      seatsPerRow: Number(data.seatsPerRow),
      basePrice: Number(data.basePrice),
      defaultSeatType: data.defaultSeatType,
      aislePositions: parseList(data.aislePositionsStr).map(Number).filter((n) => !isNaN(n)),
      vipRows: parseList(data.vipRowsStr).map((r) => r.toUpperCase()),
      vipPriceMultiplier:
        data.vipPriceMultiplier === '' || data.vipPriceMultiplier == null
          ? null
          : Number(data.vipPriceMultiplier),
      blockedSeats: parseList(data.blockedSeatsStr).map((s) => s.toUpperCase()),
    };

    try {
      await organizerAPI.generateSeats(zone.id, payload);
      toast.success('Tạo sơ đồ ghế thành công');
      onGenerated?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ ghế của khu vực này?')) return;
    try {
      await organizerAPI.deleteAllSeats(zone.id);
      toast.success('Đã xóa toàn bộ ghế');
      setHasSeats(false);
      onGenerated?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const totalSeats = Number(rows || 0) * Number(seatsPerRow || 0);
  const capacity = zone?.totalCapacity ?? 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Tạo sơ đồ ghế — {zone?.zoneName}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {checking ? (
            <Stack alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={22} />
            </Stack>
          ) : hasSeats ? (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Button color="error" size="small" onClick={handleDeleteAll}>
                  Xóa tất cả
                </Button>
              }
            >
              Khu vực này đã có sơ đồ ghế. Hãy xóa trước khi tạo lại.
            </Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="rows"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Số hàng *"
                    fullWidth
                    error={!!errors.rows}
                    helperText={errors.rows?.message || 'Tối đa 52 (A-Z, AA-AZ)'}
                    inputProps={{ min: 1, max: 52 }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="seatsPerRow"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Số ghế / hàng *"
                    fullWidth
                    error={!!errors.seatsPerRow}
                    helperText={errors.seatsPerRow?.message || 'Tối đa 100'}
                    inputProps={{ min: 1, max: 100 }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ px: 1, py: 1, bgcolor: 'action.hover', borderRadius: 1 }}
              >
                <Typography variant="body2">
                  Tổng ghế sẽ tạo:{' '}
                  <strong>{totalSeats.toLocaleString('vi-VN')}</strong>
                </Typography>
                <Chip
                  size="small"
                  label={`Sức chứa: ${capacity.toLocaleString('vi-VN')}`}
                  color={totalSeats > capacity ? 'error' : 'default'}
                />
                {totalSeats > capacity && (
                  <Typography variant="caption" color="error">
                    Vượt sức chứa khu vực
                  </Typography>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="basePrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Giá cơ bản (VND) *"
                    fullWidth
                    error={!!errors.basePrice}
                    helperText={errors.basePrice?.message}
                    inputProps={{ step: 1000, min: 0 }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="defaultSeatType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Loại ghế mặc định" fullWidth>
                    {SEAT_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider>
                <Chip label="Tùy chọn nâng cao" size="small" />
              </Divider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="aislePositionsStr"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Vị trí lối đi"
                    fullWidth
                    placeholder="VD: 5, 10"
                    helperText="Các số thứ tự cột tạo lối đi (cách nhau bởi dấu phẩy)"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="blockedSeatsStr"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ghế bị chặn"
                    fullWidth
                    placeholder="VD: A1, B5, C10"
                    helperText="Danh sách mã ghế không bán (cách nhau bởi dấu phẩy)"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
              <Controller
                name="vipRowsStr"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hàng VIP"
                    fullWidth
                    placeholder="VD: A, B, C"
                    helperText="Các hàng sẽ được đánh dấu VIP (cách nhau bởi dấu phẩy)"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="vipPriceMultiplier"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Hệ số giá VIP"
                    fullWidth
                    error={!!errors.vipPriceMultiplier}
                    helperText={errors.vipPriceMultiplier?.message || 'VD: 1.5'}
                    inputProps={{ step: 0.1, min: 1 }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Alert severity="info" variant="outlined">
              Hệ thống sẽ tự đặt mã ghế theo dạng <strong>A1, A2, ... B1, B2</strong>.
              Hàng VIP (nếu có) áp dụng hệ số giá; ghế chặn sẽ không bán được.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || hasSeats}
              startIcon={isSubmitting && <CircularProgress size={16} color="inherit" />}
            >
              Tạo sơ đồ ghế
            </Button>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GenerateSeatsDialog;
