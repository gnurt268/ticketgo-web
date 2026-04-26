import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCart, updateTicketQuantity, clearCart, selectSelectedTickets } from '@/features/cart';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Paper,
  Avatar,
  Skeleton,
  IconButton,
  Breadcrumbs,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CalendarMonth,
  LocationOn,
  AccessTime,
  Share,
  FavoriteBorder,
  Favorite,
  ExpandMore,
  ConfirmationNumber,
  Add,
  Remove,
  NavigateNext,
  Person,
  Info,
  EventBusy,
} from '@mui/icons-material';
import eventAPI from '../eventAPI';
import { EventCard, EventCardSkeleton } from '../components';
import ReviewSection from '../components/ReviewSection';
import { WaitingRoomBanner } from '@/features/waitingroom';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useAuth } from '@/hooks';
import { openAuthModal } from '@/features/auth';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const selectedTickets = useSelector(selectSelectedTickets);

  // State
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if event has ended
  const isEventEnded = event && new Date(event.endDate) < new Date();

  // Fetch event detail
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if id is slug or numeric id
        const isSlug = isNaN(parseInt(id, 10));
        const response = isSlug
          ? await eventAPI.getEventDetailBySlug(id)
          : await eventAPI.getEventDetail(id);
        
        setEvent(response.data);

        // Fetch related events
        if (response.data?.id) {
          const relatedRes = await eventAPI.getRelatedEvents(response.data.id, 4);
          setRelatedEvents(relatedRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Không tìm thấy sự kiện này');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      dispatch(clearCart());
      fetchEvent();
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Handle ticket quantity change
  const handleTicketChange = (zoneId, delta) => {
    const current = selectedTickets[zoneId] || 0;
    const zone = event?.ticketZones?.find((z) => z.id === zoneId);
    const maxQty = Math.min(10, zone?.availableCapacity ?? 10);
    const newValue = Math.max(0, Math.min(current + delta, maxQty));
    dispatch(updateTicketQuantity({ zoneId, quantity: newValue }));
  };

  // Calculate total
  const calculateTotal = () => {
    if (!event?.ticketZones) return { quantity: 0, amount: 0 };
    
    let quantity = 0;
    let amount = 0;
    
    Object.entries(selectedTickets).forEach(([zoneId, qty]) => {
      const zone = event.ticketZones.find((z) => z.id === parseInt(zoneId, 10));
      if (zone) {
        quantity += qty;
        amount += zone.price * qty;
      }
    });
    
    return { quantity, amount };
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ tab: 0 }));
      return;
    }

    const total = calculateTotal();
    if (total.quantity === 0) return;

    dispatch(setCart({
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.startDate,
      eventVenue: event.venue,
      eventAddress: event.address,
      eventPosterUrl: event.posterUrl,
      selectedTickets,
      ticketZones: event.ticketZones,
    }));
    navigate('/checkout');
  };

  // Share event
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Xem sự kiện ${event.title} trên TicketGo`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link!');
    }
  };

  const total = calculateTotal();

  // Loading state
  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3, mb: 4 }} />
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton variant="text" height={60} />
              <Skeleton variant="text" height={30} width="60%" />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 10 }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error || 'Không tìm thấy sự kiện'}
            </Typography>
            <Button variant="contained" component={Link} to="/events" sx={{ mt: 2 }}>
              Quay lại danh sách
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      {/* Banner */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 250, md: 400 },
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={event.bannerUrl || event.posterUrl}
          alt={event.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        
        {/* Event Ended Badge */}
        {isEventEnded && (
          <Chip
            icon={<EventBusy />}
            label="Sự kiện đã kết thúc"
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 1 }}>
        {/* Breadcrumb */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" sx={{ color: 'grey.300' }} />}
          sx={{ mb: 2, color: 'grey.300' }}
        >
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Trang chủ
          </Link>
          <Link to="/events" style={{ color: 'inherit', textDecoration: 'none' }}>
            Sự kiện
          </Link>
          <Typography color="white">{event.title}</Typography>
        </Breadcrumbs>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Left Column - Event Info */}
          <Grid size={{ xs: 12, md: isEventEnded ? 12 : 8 }}>
            {/* Title Card */}
            <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Chip 
                    label={event.categoryName} 
                    size="small" 
                    color="primary" 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {event.title}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                    {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton onClick={handleShare}>
                    <Share />
                  </IconButton>
                </Box>
              </Box>

              {/* Event Meta */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ngày
                    </Typography>
                    <Typography fontWeight={500}>
                      {formatDate(event.startDate)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Giờ
                    </Typography>
                    <Typography fontWeight={500}>
                      {new Date(event.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Địa điểm
                    </Typography>
                    <Typography fontWeight={500}>
                      {event.venue}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.address}, {event.city}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Description */}
            <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Giới thiệu sự kiện
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ whiteSpace: 'pre-line' }}
              >
                {event.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Organizer */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {event.organizerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đơn vị tổ chức
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Ticket Zones OR Reviews */}
            {isEventEnded ? (
              /* Event Ended - Show Reviews */
              <ReviewSection eventId={event.id} isEventEnded={isEventEnded} />
            ) : (
              <>
                {/* Waiting Room Banner */}
                <WaitingRoomBanner eventId={event.id} eventSlug={event.slug} />

                {/* Ticket Selection */}
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    <ConfirmationNumber sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Chọn vé
                  </Typography>

                  {event.isSoldOut ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Sự kiện này đã hết vé
                    </Alert>
                  ) : (
                    <TableContainer sx={{ mt: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Loại vé</TableCell>
                            <TableCell align="center">Giá</TableCell>
                            <TableCell align="center">Còn lại</TableCell>
                            <TableCell align="center">Số lượng</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {event.ticketZones?.map((zone) => {
                            const isAvailable = zone.availableCapacity > 0;
                            const quantity = selectedTickets[zone.id] || 0;

                            return (
                              <TableRow key={zone.id}>
                                <TableCell>
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: '50%',
                                          bgcolor: zone.colorCode || 'primary.main',
                                        }}
                                      />
                                      <Typography fontWeight={500}>{zone.zoneName}</Typography>
                                    </Box>
                                    {zone.description && (
                                      <Typography variant="caption" color="text.secondary">
                                        {zone.description}
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography fontWeight={600} color="primary.main">
                                    {formatCurrency(zone.price)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={isAvailable ? zone.availableCapacity : 'Hết'}
                                    size="small"
                                    color={isAvailable ? 'success' : 'error'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {isAvailable ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleTicketChange(zone.id, -1)}
                                        disabled={quantity === 0}
                                      >
                                        <Remove fontSize="small" />
                                      </IconButton>
                                      <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                                        {quantity}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleTicketChange(zone.id, 1)}
                                        disabled={quantity >= 10 || quantity >= zone.availableCapacity}
                                      >
                                        <Add fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ) : (
                                    <Typography color="error" variant="body2">
                                      Hết vé
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </Paper>
              </>
            )}

            {/* Event Info Accordion */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={600}>Thông tin thêm</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loại sự kiện
                      </Typography>
                      <Typography>{event.eventType === 'OUTDOOR' ? 'Ngoài trời' : 'Trong nhà'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Số vé tối đa/đơn
                      </Typography>
                      <Typography>{event.maxTicketsPerOrder} vé</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Lượt xem
                      </Typography>
                      <Typography>{event.viewCount?.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Đánh giá
                      </Typography>
                      <Typography>
                        {event.averageRating > 0 ? `${event.averageRating}/5 (${event.totalReviews} đánh giá)` : 'Chưa có đánh giá'}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>

          {/* Right Column - Booking Summary (only show if event not ended) */}
          {!isEventEnded && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  borderRadius: 3,
                  p: 3,
                  position: 'sticky',
                  top: 100,
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Đơn hàng của bạn
                </Typography>

                {total.quantity > 0 ? (
                  <>
                    {/* Selected Tickets */}
                    <Box sx={{ my: 2 }}>
                      {Object.entries(selectedTickets).map(([zoneId, qty]) => {
                        const zone = event.ticketZones?.find((z) => z.id === parseInt(zoneId, 10));
                        if (!zone) return null;

                        return (
                          <Box
                            key={zoneId}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 1,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {zone.zoneName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {qty} x {formatCurrency(zone.price)}
                              </Typography>
                            </Box>
                            <Typography fontWeight={500}>
                              {formatCurrency(zone.price * qty)}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Total */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="body1" fontWeight={600}>
                        Tổng cộng ({total.quantity} vé)
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={700}>
                        {formatCurrency(total.amount)}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleCheckout}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      Đặt vé ngay
                    </Button>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ConfirmationNumber sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                    <Typography color="text.secondary">
                      Chọn vé để tiếp tục
                    </Typography>
                  </Box>
                )}

                {/* Info */}
                <Alert severity="info" sx={{ mt: 2 }} icon={<Info />}>
                  <Typography variant="caption">
                    Vé sẽ được giữ trong 15 phút sau khi bạn tiến hành thanh toán
                  </Typography>
                </Alert>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Sự kiện liên quan
            </Typography>
            <Grid container spacing={3}>
              {relatedEvents.map((relEvent) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={relEvent.id}>
                  <EventCard event={relEvent} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default EventDetailPage;