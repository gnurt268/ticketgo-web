import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Stack,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Business,
  Language,
  Phone,
  LocationOn,
  Receipt,
  Category,
  Description,
  Send,
  CheckCircle,
  HourglassTop,
  Cancel,
  ErrorOutline,
  AttachFile,
  Refresh,
  Person,
  Info,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { getErrorMessage, formatDate } from '@/utils/helpers';
import {
  ORGANIZER_REQUEST_STATUS,
  ORGANIZATION_TYPE,
  ORGANIZATION_TYPE_LABELS,
} from '@/utils/constants';
import profileAPI from '../profileAPI';

const organizerRequestSchema = yup.object({
  organizationName: yup
    .string()
    .required('Vui lòng nhập tên tổ chức')
    .max(255, 'Tên tổ chức tối đa 255 ký tự'),
  organizationType: yup
    .string()
    .oneOf(Object.values(ORGANIZATION_TYPE), 'Loại tổ chức không hợp lệ')
    .required('Vui lòng chọn loại tổ chức'),
  organizationDescription: yup
    .string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .max(2000, 'Mô tả tối đa 2000 ký tự'),
  businessField: yup
    .string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .max(255, 'Lĩnh vực tối đa 255 ký tự'),
  contactPhone: yup
    .string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .max(20, 'Số điện thoại tối đa 20 ký tự')
    .matches(/^(\+?84|0)\d{9,10}$/, {
      message: 'Số điện thoại không hợp lệ',
      excludeEmptyString: true,
    }),
  address: yup
    .string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .max(500, 'Địa chỉ tối đa 500 ký tự'),
  website: yup
    .string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .max(500, 'Website tối đa 500 ký tự')
    .url('Đường dẫn website không hợp lệ'),
  taxCode: yup
    .string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .max(50, 'Mã số thuế tối đa 50 ký tự'),
  verificationDocumentUrl: yup
    .string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .url('Đường dẫn tài liệu không hợp lệ'),
  reason: yup
    .string()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .max(2000, 'Lý do tối đa 2000 ký tự'),
});

const STATUS_CONFIG = {
  [ORGANIZER_REQUEST_STATUS.PENDING]: {
    label: 'Đang chờ duyệt',
    color: 'warning',
    icon: <HourglassTop />,
    description:
      'Yêu cầu của bạn đã được gửi và đang chờ đội ngũ quản trị xem xét. Bạn sẽ nhận được email ngay khi có kết quả.',
  },
  [ORGANIZER_REQUEST_STATUS.APPROVED]: {
    label: 'Đã duyệt',
    color: 'success',
    icon: <CheckCircle />,
    description:
      'Chúc mừng! Yêu cầu đã được duyệt. Bạn có thể truy cập vào khu vực Ban tổ chức để bắt đầu tạo sự kiện.',
  },
  [ORGANIZER_REQUEST_STATUS.REJECTED]: {
    label: 'Bị từ chối',
    color: 'error',
    icon: <ErrorOutline />,
    description:
      'Rất tiếc, yêu cầu của bạn chưa được duyệt. Vui lòng xem lý do bên dưới và gửi lại đơn với thông tin đầy đủ hơn.',
  },
  [ORGANIZER_REQUEST_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    color: 'default',
    icon: <Cancel />,
    description: 'Bạn đã hủy yêu cầu này. Bạn có thể gửi lại yêu cầu mới bất cứ lúc nào.',
  },
};

const defaultFormValues = {
  organizationName: '',
  organizationType: ORGANIZATION_TYPE.INDIVIDUAL,
  organizationDescription: '',
  businessField: '',
  contactPhone: '',
  address: '',
  website: '',
  taxCode: '',
  verificationDocumentUrl: '',
  reason: '',
};

const OrganizerRequestTab = ({ isAlreadyOrganizer }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(organizerRequestSchema),
    defaultValues: defaultFormValues,
  });

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await profileAPI.getMyOrganizerRequest();
      setRequest(res.data || null);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAlreadyOrganizer) {
      loadRequest();
    } else {
      setLoading(false);
    }
  }, [isAlreadyOrganizer, loadRequest]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        organizationName: data.organizationName.trim(),
        organizationType: data.organizationType,
        organizationDescription: data.organizationDescription?.trim() || null,
        businessField: data.businessField?.trim() || null,
        contactPhone: data.contactPhone?.trim() || null,
        address: data.address?.trim() || null,
        website: data.website?.trim() || null,
        taxCode: data.taxCode?.trim() || null,
        verificationDocumentUrl: data.verificationDocumentUrl?.trim() || null,
        reason: data.reason?.trim() || null,
      };
      const res = await profileAPI.submitOrganizerRequest(payload);
      setRequest(res.data);
      setShowForm(false);
      reset(defaultFormValues);
      toast.success('Gửi yêu cầu đăng ký Ban tổ chức thành công!');
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Gửi yêu cầu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setCancelling(true);
      await profileAPI.cancelMyOrganizerRequest();
      setConfirmCancelOpen(false);
      toast.success('Đã hủy yêu cầu đăng ký');
      await loadRequest();
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Hủy yêu cầu thất bại');
    } finally {
      setCancelling(false);
    }
  };

  const handleStartResubmit = () => {
    reset({
      ...defaultFormValues,
      organizationName: request?.organizationName || '',
      organizationType: request?.organizationType || ORGANIZATION_TYPE.INDIVIDUAL,
      organizationDescription: request?.organizationDescription || '',
      businessField: request?.businessField || '',
      contactPhone: request?.contactPhone || '',
      address: request?.address || '',
      website: request?.website || '',
      taxCode: request?.taxCode || '',
      verificationDocumentUrl: request?.verificationDocumentUrl || '',
      reason: request?.reason || '',
    });
    setShowForm(true);
  };

  if (isAlreadyOrganizer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ borderRadius: 2 }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>
            Bạn đã là Ban tổ chức
          </AlertTitle>
          Bạn đã có quyền truy cập khu vực Ban tổ chức để tạo và quản lý sự kiện.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadRequest}>
              Thử lại
            </Button>
          }
        >
          {loadError}
        </Alert>
      </Box>
    );
  }

  const existingStatus = request?.status;
  const statusInfo = existingStatus ? STATUS_CONFIG[existingStatus] : null;
  const canResubmit =
    !request ||
    existingStatus === ORGANIZER_REQUEST_STATUS.REJECTED ||
    existingStatus === ORGANIZER_REQUEST_STATUS.CANCELLED;
  const isPending = existingStatus === ORGANIZER_REQUEST_STATUS.PENDING;

  const renderStatusCard = () => (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5, mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor:
              statusInfo.color === 'default'
                ? 'action.hover'
                : `${statusInfo.color}.lighter`,
            color:
              statusInfo.color === 'default'
                ? 'text.secondary'
                : `${statusInfo.color}.main`,
            flexShrink: 0,
          }}
        >
          {statusInfo.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {request.organizationName}
            </Typography>
            <Chip
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {statusInfo.description}
          </Typography>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Category fontSize="small" color="action" />
                <Typography variant="body2">
                  {ORGANIZATION_TYPE_LABELS[request.organizationType] ||
                    request.organizationType ||
                    '—'}
                </Typography>
              </Stack>
            </Grid>
            {request.contactPhone && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{request.contactPhone}</Typography>
                </Stack>
              </Grid>
            )}
            {request.website && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Language fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    component="a"
                    href={request.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'primary.main', textDecoration: 'none' }}
                  >
                    {request.website}
                  </Typography>
                </Stack>
              </Grid>
            )}
            {request.taxCode && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Receipt fontSize="small" color="action" />
                  <Typography variant="body2">MST: {request.taxCode}</Typography>
                </Stack>
              </Grid>
            )}
            {request.address && (
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <LocationOn fontSize="small" color="action" sx={{ mt: 0.3 }} />
                  <Typography variant="body2">{request.address}</Typography>
                </Stack>
              </Grid>
            )}
            {request.createdAt && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Gửi lúc {formatDate(request.createdAt, 'DD/MM/YYYY HH:mm')}
                </Typography>
              </Grid>
            )}
          </Grid>

          {existingStatus === ORGANIZER_REQUEST_STATUS.REJECTED &&
            request.rejectionReason && (
              <Alert severity="error" icon={<Info />} sx={{ mt: 2, borderRadius: 2 }}>
                <AlertTitle sx={{ fontWeight: 600 }}>Lý do từ chối</AlertTitle>
                {request.rejectionReason}
              </Alert>
            )}

          {request.adminNotes && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: 600 }}>Ghi chú từ quản trị</AlertTitle>
              {request.adminNotes}
            </Alert>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {isPending && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setConfirmCancelOpen(true)}
              >
                Hủy yêu cầu
              </Button>
            )}
            {canResubmit && !showForm && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleStartResubmit}
              >
                Gửi lại yêu cầu
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );

  const renderForm = () => (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6" fontWeight={600}>
          Thông tin đăng ký
        </Typography>
        {request && (
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowForm(false)}
          >
            Quay lại
          </Button>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Vui lòng cung cấp thông tin về tổ chức hoặc đơn vị của bạn. Các trường
        có dấu <strong>*</strong> là bắt buộc. Sau khi gửi, yêu cầu sẽ được
        quản trị viên xem xét.
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: 0.5 }}
        >
          Thông tin tổ chức
        </Typography>
        <Divider sx={{ mb: 2, mt: 0.5 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller
              name="organizationName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tên tổ chức *"
                  fullWidth
                  disabled={submitting}
                  error={!!errors.organizationName}
                  helperText={errors.organizationName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="organizationType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Loại tổ chức *"
                  fullWidth
                  disabled={submitting}
                  error={!!errors.organizationType}
                  helperText={errors.organizationType?.message}
                >
                  {Object.values(ORGANIZATION_TYPE).map((type) => (
                    <MenuItem key={type} value={type}>
                      {ORGANIZATION_TYPE_LABELS[type]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="businessField"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Lĩnh vực hoạt động"
                  fullWidth
                  disabled={submitting}
                  error={!!errors.businessField}
                  helperText={
                    errors.businessField?.message ||
                    'Ví dụ: Âm nhạc, Thể thao, Hội thảo...'
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Category fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="organizationDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Giới thiệu về tổ chức"
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  disabled={submitting}
                  error={!!errors.organizationDescription}
                  helperText={
                    errors.organizationDescription?.message ||
                    `${field.value?.length || 0}/2000 ký tự`
                  }
                />
              )}
            />
          </Grid>
        </Grid>

        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: 0.5 }}
        >
          Thông tin liên hệ
        </Typography>
        <Divider sx={{ mb: 2, mt: 0.5 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Số điện thoại liên hệ"
                  fullWidth
                  disabled={submitting}
                  error={!!errors.contactPhone}
                  helperText={errors.contactPhone?.message}
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
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Website"
                  fullWidth
                  disabled={submitting}
                  error={!!errors.website}
                  helperText={errors.website?.message}
                  placeholder="https://example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Language fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Địa chỉ"
                  fullWidth
                  disabled={submitting}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: 0.5 }}
        >
          Pháp lý & Xác minh
        </Typography>
        <Divider sx={{ mb: 2, mt: 0.5 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="taxCode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mã số thuế"
                  fullWidth
                  disabled={submitting}
                  error={!!errors.taxCode}
                  helperText={errors.taxCode?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Receipt fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="verificationDocumentUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Đường dẫn tài liệu xác minh"
                  fullWidth
                  disabled={submitting}
                  error={!!errors.verificationDocumentUrl}
                  helperText={
                    errors.verificationDocumentUrl?.message ||
                    'URL tài liệu (giấy phép KD, CCCD...)'
                  }
                  placeholder="https://..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachFile fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: 0.5 }}
        >
          Lý do đăng ký
        </Typography>
        <Divider sx={{ mb: 2, mt: 0.5 }} />
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Lý do bạn muốn trở thành Ban tổ chức"
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              disabled={submitting}
              error={!!errors.reason}
              helperText={
                errors.reason?.message ||
                `${field.value?.length || 0}/2000 ký tự`
              }
              sx={{ mb: 3 }}
            />
          )}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {request && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Send />
              )
            }
          >
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <Business />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Đăng ký trở thành Ban tổ chức
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gửi yêu cầu để được cấp quyền tạo và quản lý sự kiện trên TicketGo.
          </Typography>
        </Box>
      </Stack>

      {request && !showForm && renderStatusCard()}
      {(!request || showForm) && renderForm()}

      {/* Confirm cancel dialog */}
      <Dialog
        open={confirmCancelOpen}
        onClose={() => !cancelling && setConfirmCancelOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Cancel color="error" />
          Hủy yêu cầu đăng ký?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc muốn hủy yêu cầu đăng ký Ban tổ chức? Bạn có thể gửi
            lại yêu cầu mới sau khi hủy.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmCancelOpen(false)}
            disabled={cancelling}
          >
            Không
          </Button>
          <Button
            onClick={handleCancelRequest}
            color="error"
            variant="contained"
            disabled={cancelling}
            startIcon={
              cancelling ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Cancel />
              )
            }
          >
            {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizerRequestTab;
