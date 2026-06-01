import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Timer,
  ExitToApp,
  Refresh,
  ConfirmationNumber,
  ArrowBack,
  HourglassEmpty,
  Shuffle,
  ShoppingCart,
  People,
} from '@mui/icons-material';
import { TurnstileWidget } from '@/components/common';
import { TURNSTILE_SITE_KEY } from '@/utils/constants';
import { useWaitingRoom, QUEUE_STATUS, ROOM_STATUS } from '../hooks';
import { QueueStatusCard } from '../components';

const WaitingRoomPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const turnstileRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState(null);

  const {
    loading,
    error,
    waitingRoom,
    queueStatus,
    userStatus,
    countdown,
    isJoining,
    isEntering,
    isInQueue,
    canJoin,
    canEnter,
    position,
    peopleAhead,
    totalInQueue,
    estimatedWaitSeconds,
    joinQueue,
    enterProtectedZone,
    leaveQueue,
    clearError,
    formatCountdown,
    formatWaitTime,
  } = useWaitingRoom(eventId);

  const captchaRequired = waitingRoom?.captchaRequired === true;
  const showCaptchaWidget = captchaRequired && Boolean(TURNSTILE_SITE_KEY);
  const missingSiteKey = captchaRequired && !TURNSTILE_SITE_KEY;

  /**
   * Handle join queue
   */
  const handleJoinQueue = async () => {
    if (missingSiteKey) {
      setCaptchaError('CAPTCHA chưa được cấu hình ở phía client. Vui lòng liên hệ quản trị viên.');
      return;
    }

    if (showCaptchaWidget && !captchaToken) {
      setCaptchaError('Vui lòng hoàn tất xác minh CAPTCHA trước khi vào phòng chờ.');
      return;
    }

    setCaptchaError(null);
    const result = await joinQueue({ captchaToken });
    if (!result && showCaptchaWidget) {
      setCaptchaToken('');
      turnstileRef.current?.reset();
    }
  };

  /**
   * Handle enter protected zone
   */
  const handleEnterZone = async () => {
    const result = await enterProtectedZone();
    if (result) {
      // Redirect to event page for booking
      navigate(`/events/${waitingRoom?.eventSlug || eventId}`);
    }
  };

  /**
   * Handle leave queue
   */
  const handleLeaveQueue = async () => {
    if (!window.confirm('Bạn có chắc muốn rời khỏi hàng chờ? Bạn sẽ mất vị trí hiện tại.')) {
      return;
    }
    await leaveQueue();
  };

  /**
   * Get header icon based on status
   */
  const getHeaderIcon = () => {
    switch (userStatus) {
      case QUEUE_STATUS.NOT_JOINED:
        return <HourglassEmpty sx={{ fontSize: 48, mb: 1 }} />;
      case QUEUE_STATUS.PRE_QUEUE:
        return <Shuffle sx={{ fontSize: 48, mb: 1 }} />;
      case QUEUE_STATUS.WAITING:
        return <People sx={{ fontSize: 48, mb: 1 }} />;
      case QUEUE_STATUS.READY:
        return <CheckCircle sx={{ fontSize: 48, mb: 1 }} />;
      case QUEUE_STATUS.SHOPPING:
        return <ShoppingCart sx={{ fontSize: 48, mb: 1 }} />;
      case QUEUE_STATUS.EXPIRED:
      case QUEUE_STATUS.LEFT:
        return <Timer sx={{ fontSize: 48, mb: 1 }} />;
      default:
        return <HourglassEmpty sx={{ fontSize: 48, mb: 1 }} />;
    }
  };

  /**
   * Get header text based on status
   */
  const getHeaderText = () => {
    switch (userStatus) {
      case QUEUE_STATUS.NOT_JOINED:
        return waitingRoom?.status === ROOM_STATUS.SCHEDULED
          ? 'Phòng chờ sắp mở'
          : 'Sẵn sàng tham gia';
      case QUEUE_STATUS.PRE_QUEUE:
        return 'Đang trong phòng chờ';
      case QUEUE_STATUS.WAITING:
        return 'Đang xếp hàng';
      case QUEUE_STATUS.READY:
        return 'Đến lượt của bạn!';
      case QUEUE_STATUS.SHOPPING:
        return 'Đang mua vé';
      case QUEUE_STATUS.EXPIRED:
        return 'Phiên đã hết hạn';
      case QUEUE_STATUS.LEFT:
        return 'Đã rời hàng chờ';
      default:
        return 'Phòng chờ';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  // Error state (no waiting room)
  if (error && !waitingRoom) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 10 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/events"
              sx={{ mt: 2 }}
              startIcon={<ArrowBack />}
            >
              Quay lại danh sách
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Phòng chờ
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {waitingRoom?.eventTitle}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {captchaError && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setCaptchaError(null)}>
            {captchaError}
          </Alert>
        )}

        {/* Main Card */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Status Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 3,
              textAlign: 'center',
            }}
          >
            {getHeaderIcon()}
            <Typography variant="h6">{getHeaderText()}</Typography>
            {userStatus === QUEUE_STATUS.PRE_QUEUE && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                Vị trí sẽ được xáo trộn ngẫu nhiên khi mở bán
              </Typography>
            )}
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {/* Queue Status Card */}
            {isInQueue && (
              <QueueStatusCard
                userStatus={userStatus}
                position={position}
                peopleAhead={peopleAhead}
                totalInQueue={totalInQueue}
                estimatedWaitTime={estimatedWaitSeconds}
                countdown={countdown}
                formatCountdown={formatCountdown}
                formatWaitTime={formatWaitTime}
              />
            )}

            {/* Countdown for NOT_JOINED */}
            {userStatus === QUEUE_STATUS.NOT_JOINED && countdown > 0 && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mở bán sau
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  color="primary.main"
                  sx={{ fontFamily: 'monospace' }}
                >
                  {formatCountdown(countdown)}
                </Typography>
              </Box>
            )}

            {/* Session Timeout Warning for READY */}
            {userStatus === QUEUE_STATUS.READY && queueStatus?.sessionTimeoutMinutes && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Bạn có {queueStatus.sessionTimeoutMinutes} phút để vào mua vé
                </Typography>
              </Alert>
            )}

            {/* Session Expiry for SHOPPING */}
            {userStatus === QUEUE_STATUS.SHOPPING && queueStatus?.expiresAt && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Phiên mua vé hết hạn lúc:{' '}
                  {new Date(queueStatus.expiresAt).toLocaleTimeString('vi-VN')}
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {canJoin && showCaptchaWidget && (
                <TurnstileWidget
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setCaptchaError(null);
                  }}
                  onExpire={() => {
                    setCaptchaToken('');
                    setCaptchaError('CAPTCHA đã hết hạn. Vui lòng xác minh lại.');
                  }}
                  onError={() => {
                    setCaptchaToken('');
                    setCaptchaError('Không thể xác minh CAPTCHA. Vui lòng thử lại.');
                  }}
                />
              )}

              {/* Join Queue Button */}
              {canJoin && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleJoinQueue}
                  disabled={isJoining}
                  startIcon={
                    isJoining ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <People />
                    )
                  }
                  sx={{ py: 1.5 }}
                >
                  {isJoining ? 'Đang vào...' : 'Vào phòng chờ'}
                </Button>
              )}

              {/* Not available yet */}
              {userStatus === QUEUE_STATUS.NOT_JOINED && !canJoin && (
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  disabled
                  sx={{ py: 1.5 }}
                >
                  Phòng chờ chưa mở
                </Button>
              )}

              {/* Enter Zone Button */}
              {canEnter && (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  onClick={handleEnterZone}
                  disabled={isEntering}
                  startIcon={
                    isEntering ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <ConfirmationNumber />
                    )
                  }
                  sx={{ py: 1.5 }}
                >
                  {isEntering ? 'Đang vào...' : 'Vào mua vé ngay'}
                </Button>
              )}

              {/* Leave Queue Button */}
              {(userStatus === QUEUE_STATUS.PRE_QUEUE ||
                userStatus === QUEUE_STATUS.WAITING) && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={handleLeaveQueue}
                  startIcon={<ExitToApp />}
                >
                  Rời khỏi hàng chờ
                </Button>
              )}

              {/* Rejoin after expired/left */}
              {(userStatus === QUEUE_STATUS.EXPIRED ||
                userStatus === QUEUE_STATUS.LEFT) &&
                waitingRoom?.canJoinNow && (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleJoinQueue}
                    disabled={isJoining}
                    startIcon={<Refresh />}
                    sx={{ py: 1.5 }}
                  >
                    Xếp hàng lại
                  </Button>
                )}

              {/* Back to Event */}
              <Button
                variant="text"
                component={Link}
                to={`/events/${waitingRoom?.eventSlug || eventId}`}
                startIcon={<ArrowBack />}
              >
                Quay lại sự kiện
              </Button>
            </Box>
          </Box>

          {/* Footer Info */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              textAlign="center"
            >
              Giữ trang này mở. Vị trí của bạn sẽ được cập nhật tự động.
            </Typography>
          </Box>
        </Paper>

        {/* Tips */}
        <Paper sx={{ mt: 3, p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            💡 Mẹo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Không tắt hoặc refresh trang khi đang xếp hàng
            <br />
            • Khi đến lượt, bạn có thời gian giới hạn để hoàn tất mua vé
            <br />
            • Nếu lỡ mất kết nối, bạn có thể quay lại và vị trí sẽ được khôi phục
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default WaitingRoomPage;
