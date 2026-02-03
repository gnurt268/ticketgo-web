import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import {
  People,
  AccessTime,
  TrendingUp,
  CheckCircle,
  Shuffle,
} from '@mui/icons-material';
import { QUEUE_STATUS } from '../hooks';

/**
 * Card hiển thị trạng thái queue của user
 */
const QueueStatusCard = ({
  userStatus,
  position,
  peopleAhead,
  totalInQueue,
  estimatedWaitTime,
  countdown,
  formatCountdown,
  formatWaitTime,
}) => {
  /**
   * Get status chip config
   */
  const getStatusChip = () => {
    switch (userStatus) {
      case QUEUE_STATUS.PRE_QUEUE:
        return {
          label: 'Trong phòng chờ',
          color: 'warning',
          icon: <Shuffle fontSize="small" />,
        };
      case QUEUE_STATUS.WAITING:
        return {
          label: 'Đang xếp hàng',
          color: 'info',
          icon: <People fontSize="small" />,
        };
      case QUEUE_STATUS.READY:
        return {
          label: 'Đến lượt bạn!',
          color: 'success',
          icon: <CheckCircle fontSize="small" />,
        };
      case QUEUE_STATUS.SHOPPING:
        return {
          label: 'Đang mua vé',
          color: 'success',
          icon: <CheckCircle fontSize="small" />,
        };
      default:
        return {
          label: 'Chờ...',
          color: 'default',
          icon: null,
        };
    }
  };

  const statusChip = getStatusChip();
  const progress = totalInQueue > 0 
    ? ((totalInQueue - peopleAhead) / totalInQueue) * 100 
    : 0;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Status Chip */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Chip
          label={statusChip.label}
          color={statusChip.color}
          icon={statusChip.icon}
          sx={{ 
            fontWeight: 600,
            fontSize: '0.9rem',
            py: 2.5,
            px: 1,
          }}
        />
      </Box>

      {/* PRE_QUEUE: Show countdown + message */}
      {userStatus === QUEUE_STATUS.PRE_QUEUE && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Vị trí sẽ được xáo trộn ngẫu nhiên khi mở bán
          </Typography>
          {countdown > 0 && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
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
            </>
          )}
        </Box>
      )}

      {/* WAITING: Show position + stats */}
      {userStatus === QUEUE_STATUS.WAITING && (
        <>
          {/* Position Display */}
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 3,
              px: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Vị trí của bạn
            </Typography>
            <Typography 
              variant="h2" 
              fontWeight={700} 
              color="primary.main"
              sx={{ lineHeight: 1 }}
            >
              #{position}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Còn {peopleAhead} người phía trước
            </Typography>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Tiến trình
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                },
              }}
            />
          </Box>

          {/* Stats */}
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                <People fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Tổng hàng chờ
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {totalInQueue.toLocaleString()}
              </Typography>
            </Box>

            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Thời gian chờ
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {formatWaitTime(estimatedWaitTime)}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* READY: Highlight call to action */}
      {userStatus === QUEUE_STATUS.READY && (
        <Box 
          sx={{ 
            textAlign: 'center',
            py: 3,
            px: 2,
            bgcolor: 'success.50',
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'success.main',
          }}
        >
          <CheckCircle 
            sx={{ 
              fontSize: 48, 
              color: 'success.main',
              mb: 1,
            }} 
          />
          <Typography variant="h6" fontWeight={600} color="success.dark">
            Đến lượt của bạn!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nhấn nút bên dưới để vào mua vé
          </Typography>
        </Box>
      )}

      {/* SHOPPING: Show session info */}
      {userStatus === QUEUE_STATUS.SHOPPING && (
        <Box 
          sx={{ 
            textAlign: 'center',
            py: 3,
            px: 2,
            bgcolor: 'info.50',
            borderRadius: 2,
          }}
        >
          <TrendingUp 
            sx={{ 
              fontSize: 40, 
              color: 'info.main',
              mb: 1,
            }} 
          />
          <Typography variant="h6" fontWeight={600} color="info.dark">
            Bạn đang trong phiên mua vé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hoàn tất đơn hàng trước khi hết phiên
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default QueueStatusCard;