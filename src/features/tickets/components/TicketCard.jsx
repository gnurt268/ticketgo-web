import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CalendarMonth,
  LocationOn,
  QrCode2,
  ConfirmationNumber,
  CheckCircle,
  Cancel,
  SwapHoriz,
} from '@mui/icons-material';
import { formatDate } from '@/utils/helpers';

const statusConfig = {
  ACTIVE: { label: 'Hợp lệ', color: 'success', icon: CheckCircle },
  USED: { label: 'Đã sử dụng', color: 'default', icon: CheckCircle },
  PENDING: { label: 'Chờ thanh toán', color: 'warning', icon: ConfirmationNumber },
  CANCELLED: { label: 'Đã hủy', color: 'error', icon: Cancel },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'info', icon: SwapHoriz },
  TRANSFERRED: { label: 'Đã chuyển nhượng', color: 'info', icon: SwapHoriz },
};

const TicketCard = ({ ticket, onClick, onShowQR }) => {
  const {
    ticketCode,
    eventTitle,
    eventPosterUrl,
    eventStartDate,
    eventVenue,
    eventCity,
    zoneName,
    zoneColorCode,
    seatCode,
    status,
    isCheckedIn,
    isPast,
  } = ticket;

  const statusInfo = statusConfig[status] || statusConfig.ACTIVE;
  const isValidTicket = status === 'ACTIVE' && !isCheckedIn;

  return (
    <Card
      onClick={() => onClick?.(ticket)}
      sx={{
        display: 'flex',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        opacity: isPast || status === 'CANCELLED' || status === 'USED' ? 0.75 : 1,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(94, 53, 177, 0.12)',
        },
      }}
    >
      {/* Event Image */}
      <Box
        sx={{
          width: 120,
          minHeight: 130,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={eventPosterUrl}
          alt={eventTitle}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Date Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 6,
            left: 6,
            bgcolor: 'white',
            borderRadius: 1,
            px: 0.75,
            py: 0.25,
            textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            minWidth: 36,
          }}
        >
          <Typography
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            {formatDate(eventStartDate, 'MMM')}
          </Typography>
          <Typography
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: '0.95rem',
              lineHeight: 1.1,
            }}
          >
            {formatDate(eventStartDate, 'DD')}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          py: 1.5,
          px: 2,
          '&:last-child': { pb: 1.5 },
        }}
      >
        {/* Title & Status */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {eventTitle}
          </Typography>
          <Chip
            label={isCheckedIn ? 'Đã check-in' : statusInfo.label}
            color={isCheckedIn ? 'default' : statusInfo.color}
            size="small"
            sx={{ 
              height: 22, 
              fontSize: '0.7rem',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Box>

        {/* Event Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <CalendarMonth sx={{ fontSize: 14, color: 'primary.main' }} />
          <Typography variant="caption" color="text.secondary">
            {formatDate(eventStartDate, 'DD/MM/YYYY • HH:mm')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOn sx={{ fontSize: 14, color: 'secondary.main' }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {eventVenue || eventCity}
          </Typography>
        </Box>

        {/* Ticket Info Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Zone */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: zoneColorCode || 'primary.main',
                }}
              />
              <Typography variant="caption" fontWeight={500}>
                {zoneName}
              </Typography>
            </Box>

            {/* Seat */}
            {seatCode && (
              <Typography variant="caption" color="text.secondary">
                Ghế {seatCode}
              </Typography>
            )}

            {/* Ticket Code */}
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                bgcolor: alpha('#5E35B1', 0.08),
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            >
              {ticketCode}
            </Typography>
          </Box>

          {/* QR Button */}
          {isValidTicket && (
            <Tooltip title="Xem mã QR">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowQR?.(ticket);
                }}
                sx={{
                  p: 0.5,
                  bgcolor: alpha('#5E35B1', 0.08),
                  '&:hover': { bgcolor: alpha('#5E35B1', 0.15) },
                }}
              >
                <QrCode2 sx={{ fontSize: 18, color: 'primary.main' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketCard;