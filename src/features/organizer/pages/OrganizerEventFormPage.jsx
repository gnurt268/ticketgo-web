import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { axiosInstance } from '@/api';
import organizerAPI from '../organizerAPI';
import { getErrorMessage } from '@/utils/helpers';

const EVENT_TYPE_OPTIONS = [
  { value: 'INDOOR', label: 'Trong nhà' },
  { value: 'OUTDOOR', label: 'Ngoài trời' },
  { value: 'ONLINE', label: 'Trực tuyến' },
  { value: 'HYBRID', label: 'Kết hợp' },
];

const schema = yup.object({
  title: yup.string().required('Vui lòng nhập tiêu đề').max(255),
  slug: yup
    .string()
    .required('Vui lòng nhập slug')
    .max(255)
    .matches(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  categoryId: yup.number().required('Vui lòng chọn danh mục').typeError('Vui lòng chọn danh mục'),
  description: yup.string().max(5000).nullable(),
  posterUrl: yup.string().url('URL không hợp lệ').max(500).nullable().transform((v) => (v === '' ? null : v)),
  bannerUrl: yup.string().url('URL không hợp lệ').max(500).nullable().transform((v) => (v === '' ? null : v)),
  location: yup.string().required('Vui lòng nhập khu vực').max(255),
  venue: yup.string().required('Vui lòng nhập địa điểm').max(255),
  address: yup.string().max(500).nullable(),
  city: yup.string().max(100).nullable(),
  startDate: yup.string().required('Vui lòng chọn thời gian bắt đầu'),
  endDate: yup
    .string()
    .required('Vui lòng chọn thời gian kết thúc')
    .test('after-start', 'Thời gian kết thúc phải sau thời gian bắt đầu', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return dayjs(value).isAfter(dayjs(startDate));
    }),
  eventType: yup.string().oneOf(['INDOOR', 'OUTDOOR', 'ONLINE', 'HYBRID']).required(),
  maxTicketsPerOrder: yup.number().min(1).max(50).required(),
  enableSeatSelection: yup.boolean(),
  seatMapImageUrl: yup.string().url('URL không hợp lệ').max(500).nullable().transform((v) => (v === '' ? null : v)),
  enableFaceRecognition: yup.boolean(),
  faceRecognitionThreshold: yup.number().min(0.5).max(1.0),
  requireFaceUpload: yup.boolean(),
});

const toLocalInputValue = (iso) => {
  if (!iso) return '';
  return dayjs(iso).format('YYYY-MM-DDTHH:mm');
};

const OrganizerEventFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      categoryId: '',
      description: '',
      posterUrl: '',
      bannerUrl: '',
      location: '',
      venue: '',
      address: '',
      city: '',
      startDate: '',
      endDate: '',
      eventType: 'INDOOR',
      maxTicketsPerOrder: 10,
      enableSeatSelection: false,
      seatMapImageUrl: '',
      enableFaceRecognition: true,
      faceRecognitionThreshold: 0.7,
      requireFaceUpload: true,
    },
  });

  const title = watch('title');

  // Auto-generate slug from title (only in create mode)
  useEffect(() => {
    if (!isEdit && title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 200);
      setValue('slug', slug, { shouldValidate: false });
    }
  }, [title, isEdit, setValue]);

  useEffect(() => {
    axiosInstance
      .get('/categories')
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const res = await organizerAPI.getEventDetail(id);
        const ev = res.data;
        reset({
          title: ev.title || '',
          slug: ev.slug || '',
          categoryId: ev.categoryId || '',
          description: ev.description || '',
          posterUrl: ev.posterUrl || '',
          bannerUrl: ev.bannerUrl || '',
          location: ev.location || '',
          venue: ev.venue || '',
          address: ev.address || '',
          city: ev.city || '',
          startDate: toLocalInputValue(ev.startDate),
          endDate: toLocalInputValue(ev.endDate),
          eventType: ev.eventType || 'INDOOR',
          maxTicketsPerOrder: ev.maxTicketsPerOrder || 10,
          enableSeatSelection: !!ev.enableSeatSelection,
          seatMapImageUrl: ev.seatMapImageUrl || '',
          enableFaceRecognition: ev.enableFaceRecognition !== false,
          faceRecognitionThreshold: ev.faceRecognitionThreshold || 0.7,
          requireFaceUpload: ev.requireFaceUpload !== false,
        });
      } catch (err) {
        setLoadError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      categoryId: Number(data.categoryId),
      maxTicketsPerOrder: Number(data.maxTicketsPerOrder),
      faceRecognitionThreshold: Number(data.faceRecognitionThreshold),
      startDate: dayjs(data.startDate).format('YYYY-MM-DDTHH:mm:ss'),
      endDate: dayjs(data.endDate).format('YYYY-MM-DDTHH:mm:ss'),
      description: data.description || null,
      posterUrl: data.posterUrl || null,
      bannerUrl: data.bannerUrl || null,
      address: data.address || null,
      city: data.city || null,
      seatMapImageUrl: data.seatMapImageUrl || null,
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await organizerAPI.updateEvent(id, payload);
        toast.success('Cập nhật sự kiện thành công');
        navigate(`/organizer/events/${id}`);
      } else {
        const res = await organizerAPI.createEvent(payload);
        toast.success('Tạo sự kiện thành công');
        navigate(`/organizer/events/${res.data.id}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {loadError}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Quay lại
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {isEdit ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
      </Typography>

      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Thông tin cơ bản
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tiêu đề sự kiện *"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Slug *"
                  fullWidth
                  error={!!errors.slug}
                  helperText={errors.slug?.message || 'Dùng trong URL công khai'}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Danh mục *"
                  fullWidth
                  error={!!errors.categoryId}
                  helperText={errors.categoryId?.message}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
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
                  minRows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="posterUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="URL poster"
                  fullWidth
                  error={!!errors.posterUrl}
                  helperText={errors.posterUrl?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="bannerUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="URL banner"
                  fullWidth
                  error={!!errors.bannerUrl}
                  helperText={errors.bannerUrl?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Địa điểm & thời gian
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="venue"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Địa điểm (venue) *"
                  fullWidth
                  error={!!errors.venue}
                  helperText={errors.venue?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Khu vực *"
                  fullWidth
                  error={!!errors.location}
                  helperText={errors.location?.message || 'VD: Quận 1, TP.HCM'}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Địa chỉ chi tiết" fullWidth />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Thành phố" fullWidth />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Loại sự kiện *" fullWidth>
                  {EVENT_TYPE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="datetime-local"
                  label="Bắt đầu *"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="datetime-local"
                  label="Kết thúc *"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Cấu hình nâng cao
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="maxTicketsPerOrder"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Số vé tối đa/đơn"
                  fullWidth
                  inputProps={{ min: 1, max: 50 }}
                  error={!!errors.maxTicketsPerOrder}
                  helperText={errors.maxTicketsPerOrder?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="enableSeatSelection"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Cho phép chọn ghế"
                />
              )}
            />
          </Grid>
          {watch('enableSeatSelection') && (
            <Grid size={{ xs: 12 }}>
              <Controller
                name="seatMapImageUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL ảnh sơ đồ ghế"
                    fullWidth
                    error={!!errors.seatMapImageUrl}
                    helperText={errors.seatMapImageUrl?.message}
                  />
                )}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="enableFaceRecognition"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Bật nhận diện khuôn mặt"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="requireFaceUpload"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Bắt buộc upload khuôn mặt"
                />
              )}
            />
          </Grid>
          {watch('enableFaceRecognition') && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="faceRecognitionThreshold"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Ngưỡng nhận diện (0.5 - 1.0)"
                    fullWidth
                    inputProps={{ step: 0.05, min: 0.5, max: 1 }}
                    error={!!errors.faceRecognitionThreshold}
                    helperText={errors.faceRecognitionThreshold?.message}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate(-1)} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Save />}
            disabled={submitting}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo sự kiện'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default OrganizerEventFormPage;
