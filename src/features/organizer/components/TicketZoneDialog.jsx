import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import organizerAPI from '../organizerAPI';
import { getErrorMessage } from '@/utils/helpers';

const ZONE_TYPES = [
  { value: 'VIP', label: 'VIP' },
  { value: 'STANDARD', label: 'Tiêu chuẩn' },
  { value: 'ECONOMY', label: 'Tiết kiệm' },
  { value: 'STANDING', label: 'Đứng' },
  { value: 'SPECIAL', label: 'Đặc biệt' },
];

const schema = yup.object({
  zoneName: yup.string().required('Vui lòng nhập tên khu vực').max(100),
  zoneCode: yup
    .string()
    .required('Vui lòng nhập mã khu vực')
    .max(50)
    .matches(/^[A-Z0-9_-]+$/, 'Chỉ dùng chữ hoa, số, _ và -'),
  description: yup.string().max(1000).nullable(),
  colorCode: yup
    .string()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Mã màu không hợp lệ')
    .required(),
  price: yup.number().min(0).required('Vui lòng nhập giá').typeError('Giá không hợp lệ'),
  totalCapacity: yup
    .number()
    .min(1)
    .max(100000)
    .required('Vui lòng nhập sức chứa')
    .typeError('Sức chứa không hợp lệ'),
  zoneType: yup.string().required(),
  isActive: yup.boolean(),
  displayOrder: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
  saleStartDate: yup.string().nullable(),
  saleEndDate: yup.string().nullable(),
});

const toLocalInputValue = (iso) => {
  if (!iso) return '';
  return dayjs(iso).format('YYYY-MM-DDTHH:mm');
};

const TicketZoneDialog = ({ open, onClose, eventId, zone, onSaved }) => {
  const isEdit = Boolean(zone);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      zoneName: '',
      zoneCode: '',
      description: '',
      colorCode: '#3B82F6',
      price: 0,
      totalCapacity: 50,
      zoneType: 'STANDARD',
      isActive: true,
      displayOrder: '',
      saleStartDate: '',
      saleEndDate: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (zone) {
      reset({
        zoneName: zone.zoneName || '',
        zoneCode: zone.zoneCode || '',
        description: zone.description || '',
        colorCode: zone.colorCode || '#3B82F6',
        price: zone.price || 0,
        totalCapacity: zone.totalCapacity || 50,
        zoneType: zone.zoneType || 'STANDARD',
        isActive: zone.isActive !== false,
        displayOrder: zone.displayOrder ?? '',
        saleStartDate: toLocalInputValue(zone.saleStartDate),
        saleEndDate: toLocalInputValue(zone.saleEndDate),
      });
    } else {
      reset({
        zoneName: '',
        zoneCode: '',
        description: '',
        colorCode: '#3B82F6',
        price: 0,
        totalCapacity: 50,
        zoneType: 'STANDARD',
        isActive: true,
        displayOrder: '',
        saleStartDate: '',
        saleEndDate: '',
      });
    }
  }, [open, zone, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      price: Number(data.price),
      totalCapacity: Number(data.totalCapacity),
      displayOrder: data.displayOrder === '' ? null : Number(data.displayOrder),
      description: data.description || null,
      saleStartDate: data.saleStartDate
        ? dayjs(data.saleStartDate).format('YYYY-MM-DDTHH:mm:ss')
        : null,
      saleEndDate: data.saleEndDate
        ? dayjs(data.saleEndDate).format('YYYY-MM-DDTHH:mm:ss')
        : null,
    };

    try {
      if (isEdit) {
        await organizerAPI.updateZone(zone.id, payload);
        toast.success('Cập nhật khu vực thành công');
      } else {
        await organizerAPI.createZone(eventId, payload);
        toast.success('Tạo khu vực thành công');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? 'Chỉnh sửa khu vực' : 'Tạo khu vực vé'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="zoneName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tên khu vực *"
                    fullWidth
                    error={!!errors.zoneName}
                    helperText={errors.zoneName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="zoneCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mã khu vực *"
                    fullWidth
                    error={!!errors.zoneCode}
                    helperText={errors.zoneCode?.message || 'VD: VIP, A1, STANDARD'}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mô tả"
                    fullWidth
                    multiline
                    minRows={2}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="zoneType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Loại *" fullWidth>
                    {ZONE_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="colorCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mã màu"
                    fullWidth
                    error={!!errors.colorCode}
                    helperText={errors.colorCode?.message}
                    InputProps={{
                      startAdornment: (
                        <input
                          type="color"
                          value={field.value || '#3B82F6'}
                          onChange={(e) => field.onChange(e.target.value)}
                          style={{
                            width: 28,
                            height: 28,
                            border: 'none',
                            marginRight: 8,
                            background: 'transparent',
                            cursor: 'pointer',
                          }}
                        />
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="displayOrder"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Thứ tự hiển thị"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Giá (VND) *"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    inputProps={{ step: 1000, min: 0 }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="totalCapacity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Tổng sức chứa *"
                    fullWidth
                    error={!!errors.totalCapacity}
                    helperText={errors.totalCapacity?.message}
                    inputProps={{ min: 1, max: 100000 }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="saleStartDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="datetime-local"
                    label="Bắt đầu bán"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="saleEndDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="datetime-local"
                    label="Kết thúc bán"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Kích hoạt khu vực"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={16} color="inherit" />}
            >
              {isEdit ? 'Lưu' : 'Tạo'}
            </Button>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TicketZoneDialog;
