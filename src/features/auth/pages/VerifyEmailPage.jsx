import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Stack,
} from '@mui/material';
import {
  CheckCircleOutline,
  ErrorOutline,
  MarkEmailRead,
  Replay,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import authAPI from '../authAPI';
import { FoxIcon } from '@/assets/brand';

const STATUS = {
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  ERROR: 'error',
  MISSING_TOKEN: 'missing_token',
};

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(
    token ? STATUS.VERIFYING : STATUS.MISSING_TOKEN
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus(STATUS.SUCCESS);
      } catch (err) {
        setStatus(STATUS.ERROR);
        setErrorMessage(
          err.response?.data?.message ||
            'Liên kết xác thực không hợp lệ hoặc đã hết hạn.'
        );
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setResendLoading(true);
    try {
      await authAPI.resendVerification(resendEmail);
      toast.success('Đã gửi lại email xác thực, vui lòng kiểm tra hộp thư');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Gửi lại email thất bại, vui lòng thử lại'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    if (status === STATUS.VERIFYING) {
      return (
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={56} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Đang xác thực email...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng đợi trong giây lát
          </Typography>
        </Stack>
      );
    }

    if (status === STATUS.SUCCESS) {
      return (
        <Stack alignItems="center" spacing={2}>
          <CheckCircleOutline sx={{ fontSize: 72, color: 'success.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Xác thực email thành công!
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập và bắt đầu
            sử dụng TicketGO.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{ mt: 2, px: 4 }}
          >
            Về trang chủ
          </Button>
        </Stack>
      );
    }

    if (status === STATUS.MISSING_TOKEN) {
      return (
        <Stack alignItems="center" spacing={2}>
          <MarkEmailRead sx={{ fontSize: 72, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Thiếu token xác thực
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Liên kết không chứa token. Vui lòng sử dụng đúng liên kết được gửi
            đến email của bạn hoặc yêu cầu gửi lại email xác thực.
          </Typography>
          {renderResendForm()}
        </Stack>
      );
    }

    return (
      <Stack alignItems="center" spacing={2}>
        <ErrorOutline sx={{ fontSize: 72, color: 'error.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Xác thực thất bại
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {errorMessage}
        </Typography>
        {renderResendForm()}
      </Stack>
    );
  };

  const renderResendForm = () => (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1.5, textAlign: 'center' }}
      >
        Gửi lại email xác thực
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          fullWidth
          type="email"
          placeholder="example@email.com"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          disabled={resendLoading}
        />
        <Button
          variant="contained"
          startIcon={!resendLoading && <Replay />}
          onClick={handleResend}
          disabled={resendLoading}
          sx={{ whiteSpace: 'nowrap', px: 3 }}
        >
          {resendLoading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            'Gửi lại'
          )}
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #5E35B1 0%, #7C3AED 50%, #F59E0B 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)',
              py: 3,
              textAlign: 'center',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <FoxIcon size={56} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
              <Typography
                variant="h5"
                component="span"
                sx={{ fontWeight: 700, color: 'white' }}
              >
                Ticket
              </Typography>
              <Typography
                variant="h5"
                component="span"
                sx={{ fontWeight: 700, color: '#F59E0B' }}
              >
                GO
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 3, sm: 5 } }}>{renderContent()}</Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
