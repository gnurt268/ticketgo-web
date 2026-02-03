import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  HourglassEmpty,
  AccessTime,
  People,
  ArrowForward,
  CheckCircle,
  Shuffle,
} from '@mui/icons-material';
import waitingRoomAPI from '../waitingRoomAPI';
import { ROOM_STATUS } from '../hooks';

/**
 * Banner hiển thị thông tin waiting room trên trang Event Detail
 * Cho phép user nhanh chóng vào phòng chờ
 */
const WaitingRoomBanner = ({ eventId, eventSlug }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [waitingRoom, setWaitingRoom] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Fetch waiting room info
   */
  useEffect(() => {
    const fetchWaitingRoom = async () => {
      try {
        const response = await waitingRoomAPI.getByEventId(eventId);
        setWaitingRoom(response.data);
        
        // Calculate countdown
        if (response.data?.saleStartTime) {
          const startTime = new Date(response.data.saleStartTime).getTime();
          const now = Date.now();
          const diff = Math.max(0, Math.floor((startTime - now) / 1000));
          setCountdown(diff);
        }
      } catch (err) {
        // No waiting room for this event - not an error, just hide banner
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchWaitingRoom();
    }
  }, [eventId]);

  /**
   * Countdown timer
   */
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  /**
   * Format countdown
   */
  const formatCountdown = (seconds) => {
    if (seconds <= 0) return null;
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Navigate to waiting room
   */
  const handleGoToWaitingRoom = () => {
    navigate(`/waiting-room/${eventId}`);
  };

  /**
   * Get status config
   */
  const getStatusConfig = () => {
    if (!waitingRoom) return null;

    switch (waitingRoom.status) {
      case ROOM_STATUS.SCHEDULED:
        return {
          color: 'warning',
          bgGradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderColor: '#f59e0b',
          icon: <HourglassEmpty />,
          title: 'Phòng chờ sắp mở',
          subtitle: countdown > 0 
            ? `Mở bán sau ${formatCountdown(countdown)}`
            : 'Sắp mở bán',
          buttonText: 'Xem phòng chờ',
          buttonVariant: 'outlined',
        };
      case ROOM_STATUS.PRE_QUEUE:
        return {
          color: 'info',
          bgGradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          borderColor: '#3b82f6',
          icon: <Shuffle />,
          title: 'Đang nhận đăng ký',
          subtitle: 'Vào phòng chờ ngay để có cơ hội mua vé',
          buttonText: 'Vào phòng chờ',
          buttonVariant: 'contained',
        };
      case ROOM_STATUS.ACTIVE:
        return {
          color: 'success',
          bgGradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          borderColor: '#10b981',
          icon: <People />,
          title: 'Đang bán vé',
          subtitle: `${waitingRoom.currentQueueSize || 0} người đang xếp hàng`,
          buttonText: 'Xếp hàng ngay',
          buttonVariant: 'contained',
        };
      case ROOM_STATUS.PAUSED:
        return {
          color: 'default',
          bgGradient: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          borderColor: '#9ca3af',
          icon: <AccessTime />,
          title: 'Tạm dừng',
          subtitle: 'Phòng chờ đang tạm dừng',
          buttonText: 'Xem chi tiết',
          buttonVariant: 'outlined',
        };
      case ROOM_STATUS.CLOSED:
        return {
          color: 'error',
          bgGradient: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          borderColor: '#ef4444',
          icon: <CheckCircle />,
          title: 'Đã đóng',
          subtitle: 'Phòng chờ đã kết thúc',
          buttonText: null,
          buttonVariant: null,
        };
      default:
        return null;
    }
  };

  // Don't render if loading, error, or no waiting room
  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  if (error || !waitingRoom) {
    return null;
  }

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <Collapse in={true}>
      <Paper
        sx={{
          mb: 3,
          overflow: 'hidden',
          background: config.bgGradient,
          border: '1px solid',
          borderColor: config.borderColor,
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {/* Left: Icon + Text */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: config.borderColor,
                  boxShadow: 1,
                }}
              >
                {config.icon}
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {config.title}
                  </Typography>
                  <Chip 
                    label="Virtual Queue" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'white',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {config.subtitle}
                </Typography>
              </Box>
            </Box>

            {/* Right: Button */}
            {config.buttonText && (
              <Button
                variant={config.buttonVariant}
                color="primary"
                endIcon={<ArrowForward />}
                onClick={handleGoToWaitingRoom}
                sx={{
                  whiteSpace: 'nowrap',
                  ...(config.buttonVariant === 'contained' && {
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6d28d9, #9333ea)',
                    },
                  }),
                }}
              >
                {config.buttonText}
              </Button>
            )}
          </Box>

          {/* Countdown for SCHEDULED */}
          {waitingRoom.status === ROOM_STATUS.SCHEDULED && countdown > 0 && (
            <Box 
              sx={{ 
                mt: 2, 
                pt: 2, 
                borderTop: '1px solid',
                borderColor: 'rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <AccessTime sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Thời gian mở bán
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                  {formatCountdown(countdown)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Stats for ACTIVE */}
          {waitingRoom.status === ROOM_STATUS.ACTIVE && waitingRoom.currentQueueSize > 0 && (
            <Box 
              sx={{ 
                mt: 2, 
                pt: 2, 
                borderTop: '1px solid',
                borderColor: 'rgba(0,0,0,0.1)',
                display: 'flex',
                gap: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>{waitingRoom.currentQueueSize}</strong> đang chờ
                </Typography>
              </Box>
              {waitingRoom.throughputPerMinute && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>{waitingRoom.throughputPerMinute}</strong>/phút
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Collapse>
  );
};

export default WaitingRoomBanner;