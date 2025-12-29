import { Link } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  alpha,
} from '@mui/material';
import {
  CalendarMonth,
  LocationOn,
  LocalActivity,
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '@/utils/helpers';

const EventCard = ({ event, variant = 'default' }) => {
  const {
    id,
    slug,
    title,
    posterUrl,
    startDate,
    venue,
    city,
    minPrice,
    maxPrice,
    categoryName,
    isFeatured,
    isSoldOut,
  } = event;

  const eventUrl = slug ? `/events/${slug}` : `/events/${id}`;
  const isEnded = new Date(startDate) < new Date();

  // Format price display
  const getPriceDisplay = () => {
    if (!minPrice && !maxPrice) return 'Miễn phí';
    if (minPrice === maxPrice) return formatCurrency(minPrice);
    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
  };

  if (variant === 'horizontal') {
    return (
      <Card
        component={Link}
        to={eventUrl}
        sx={{
          display: 'flex',
          textDecoration: 'none',
          height: 140,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(94, 53, 177, 0.15)',
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 180, objectFit: 'cover' }}
          image={posterUrl}
          alt={title}
        />
        <CardContent sx={{ flex: 1, py: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <CalendarMonth sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(startDate, 'DD/MM/YYYY • HH:mm')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 16, color: 'secondary.main' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {venue || city}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      component={Link}
      to={eventUrl}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(94, 53, 177, 0.18)',
          '& .event-image': {
            transform: 'scale(1.05)',
          },
          '& .event-overlay': {
            opacity: 1,
          },
        },
      }}
    >
      {/* Image Container */}
      <Box sx={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={posterUrl}
          alt={title}
          className="event-image"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />

        {/* Gradient Overlay */}
        <Box
          className="event-overlay"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          {isFeatured && (
            <Chip
              label="🔥 Hot"
              size="small"
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
          {categoryName && (
            <Chip
              label={categoryName}
              size="small"
              sx={{
                bgcolor: alpha('#5E35B1', 0.9),
                color: 'white',
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>

        {/* Status Badge */}
        {(isSoldOut || isEnded) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Chip
              label={isSoldOut ? 'Hết vé' : 'Đã kết thúc'}
              sx={{
                bgcolor: isSoldOut ? 'error.main' : 'grey.700',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                px: 2,
              }}
            />
          </Box>
        )}

        {/* Date Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: 'white',
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              display: 'block',
              lineHeight: 1,
            }}
          >
            {formatDate(startDate, 'MMM')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {formatDate(startDate, 'DD')}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        {/* Title */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            minHeight: '2.8em',
          }}
        >
          {title}
        </Typography>

        {/* Info */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <CalendarMonth sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(startDate, 'DD/MM/YYYY • HH:mm')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOn sx={{ fontSize: 18, color: 'secondary.main' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {venue || city}
            </Typography>
          </Box>
        </Box>

        {/* Price */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalActivity sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="caption" color="text.secondary">
              Từ
            </Typography>
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            {getPriceDisplay()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard;