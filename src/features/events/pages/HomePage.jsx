import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  IconButton,
  InputBase,
  keyframes,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Search,
  ArrowForward,
  ArrowBackIos,
  ArrowForwardIos,
  TrendingUp,
  LocalActivity,
  CalendarMonth,
  LocationOn,
  MusicNote,
} from '@mui/icons-material';
import eventAPI from '../eventAPI';
import { EventCard, EventCardSkeleton } from '../components';
import { FoxMascot } from '@/assets/brand';
import { formatDate } from '@/utils/helpers';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ==================== HERO SECTION ====================
const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 50%, #9333EA 100%)',
        overflow: 'hidden',
        py: { xs: 6, md: 10 },
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          animation: `${float} 3s ease-in-out infinite`,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <LocalActivity sx={{ fontSize: 60, color: 'rgba(255,255,255,0.2)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          animation: `${float} 4s ease-in-out infinite 1s`,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <MusicNote sx={{ fontSize: 50, color: 'rgba(255,255,255,0.15)' }} />
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ animation: `${fadeInUp} 0.8s ease` }}>
              {/* Badge */}
              <Chip
                label="🎉 Nền tảng đặt vé #1 Việt Nam"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  mb: 3,
                  backdropFilter: 'blur(10px)',
                }}
              />

              {/* Heading */}
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  lineHeight: 1.2,
                  mb: 2,
                }}
              >
                Khám phá sự kiện
                <Box component="span" sx={{ display: 'block', color: '#F59E0B' }}>
                  đáng nhớ nhất
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 400,
                  mb: 4,
                  maxWidth: 500,
                }}
              >
                Hàng ngàn sự kiện âm nhạc, thể thao, sân khấu đang chờ bạn.
                Đặt vé nhanh chóng, an toàn với TicketGo.
              </Typography>

              {/* Search Bar */}
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'white',
                  borderRadius: 3,
                  p: 0.75,
                  maxWidth: 500,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                }}
              >
                <Search sx={{ color: 'text.secondary', mx: 2 }} />
                <InputBase
                  placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, fontSize: '1rem' }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.25,
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                    color: '#1E1B4B',
                    fontWeight: 700,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                    },
                  }}
                >
                  Tìm kiếm
                </Button>
              </Box>

              {/* Quick Stats */}
              <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
                {[
                  { value: '1000+', label: 'Sự kiện' },
                  { value: '500K+', label: 'Vé đã bán' },
                  { value: '100K+', label: 'Người dùng' },
                ].map((stat) => (
                  <Box key={stat.label}>
                    <Typography variant="h5" sx={{ color: '#F59E0B', fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Fox Mascot */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Box sx={{ animation: `${float} 3s ease-in-out infinite` }}>
              <FoxMascot size={320} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// ==================== HERO CAROUSEL (Ticketbox style) ====================
const HeroCarousel = ({ events, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, events.length]);

  const goToPrev = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  }, [events.length]);

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % events.length);
  }, [events.length]);

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#F3F0FF', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (events.length === 0) return null;

  const mainEvent = events[currentIndex];
  const sideEvent = events[(currentIndex + 1) % events.length];

  return (
    <Box sx={{ bgcolor: '#F3F0FF', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Main Banner */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                height: { xs: 280, md: 400 },
              }}
            >
              {/* Background Image */}
              <Box
                component="img"
                key={mainEvent.id}
                src={mainEvent.posterUrl}
                alt={mainEvent.title}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  animation: `${fadeIn} 0.5s ease`,
                }}
              />

              {/* Gradient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                }}
              />

              {/* Content */}
              <Box
                component={Link}
                to={`/events/${mainEvent.slug || mainEvent.id}`}
                sx={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  top: 0,
                  width: '60%',
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  textDecoration: 'none',
                  animation: `${slideInLeft} 0.5s ease`,
                }}
                key={`content-${mainEvent.id}`}
              >
                <Chip
                  label={mainEvent.categoryName}
                  size="small"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    fontWeight: 600,
                    mb: 2,
                    width: 'fit-content',
                  }}
                />

                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {mainEvent.title}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonth sx={{ fontSize: 18, color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {formatDate(mainEvent.startDate, 'HH:mm • DD/MM/YYYY')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 18, color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {mainEvent.venue}, {mainEvent.city}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    width: 'fit-content',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                >
                  Xem chi tiết
                </Button>
              </Box>

              {/* Navigation Arrows */}
              {events.length > 1 && (
                <>
                  <IconButton
                    onClick={goToPrev}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' },
                      display: { xs: 'none', md: 'flex' },
                    }}
                  >
                    <ArrowBackIos sx={{ fontSize: 18, ml: 0.5 }} />
                  </IconButton>
                  <IconButton
                    onClick={goToNext}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' },
                      display: { xs: 'none', md: 'flex' },
                    }}
                  >
                    <ArrowForwardIos sx={{ fontSize: 18 }} />
                  </IconButton>
                </>
              )}

              {/* Dots Indicator */}
              {events.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  {events.slice(0, 5).map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => goToSlide(index)}
                      sx={{
                        width: currentIndex === index ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: currentIndex === index ? 'secondary.main' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: currentIndex === index ? 'secondary.main' : 'rgba(255,255,255,0.8)',
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Side Banner */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            {sideEvent && (
              <Box
                component={Link}
                to={`/events/${sideEvent.slug || sideEvent.id}`}
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 400,
                  display: 'block',
                  textDecoration: 'none',
                  '&:hover img': { transform: 'scale(1.05)' },
                }}
              >
                <Box
                  component="img"
                  src={sideEvent.posterUrl}
                  alt={sideEvent.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                  }}
                />

                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3 }}>
                  <Chip
                    label={sideEvent.categoryName}
                    size="small"
                    sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, mb: 1.5 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {sideEvent.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonth sx={{ fontSize: 16, color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {formatDate(sideEvent.startDate, 'DD/MM/YYYY')}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      mt: 2,
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// ==================== EVENT SECTION ====================
const EventSection = ({ title, subtitle, icon, events, loading, viewAllLink }) => {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          <Button
            component={Link}
            to={viewAllLink}
            endIcon={<ArrowForward />}
            sx={{ color: 'primary.main', fontWeight: 600, '&:hover': { bgcolor: 'primary.lighter' } }}
          >
            Xem tất cả
          </Button>
        </Box>

        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <EventCardSkeleton />
                </Grid>
              ))
            : events.map((event) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={event.id}>
                  <EventCard event={event} />
                </Grid>
              ))}
        </Grid>

        {!loading && events.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Chưa có sự kiện nào
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

// ==================== CTA SECTION ====================
const CTASection = () => {
  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 3s infinite`,
        }}
      />

      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
            Bạn là nhà tổ chức sự kiện?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 500, mx: 'auto' }}>
            Đăng ký ngay để quản lý và bán vé sự kiện của bạn trên nền tảng TicketGo
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              color: '#1E1B4B',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              '&:hover': { background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' },
            }}
          >
            Trở thành đối tác
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// ==================== MAIN HOMEPAGE ====================
const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [topSellingEvents, setTopSellingEvents] = useState([]);
  const [loading, setLoading] = useState({ featured: true, topSelling: true });

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await eventAPI.getFeaturedEvents({ size: 8 });
        setFeaturedEvents(response.data.content || []);
      } catch (error) {
        console.error('Error fetching featured events:', error);
      } finally {
        setLoading((prev) => ({ ...prev, featured: false }));
      }
    };

    const fetchTopSelling = async () => {
      try {
        const response = await eventAPI.getTopSellingEvents({ size: 8 });
        setTopSellingEvents(response.data.content || []);
      } catch (error) {
        console.error('Error fetching top selling events:', error);
      } finally {
        setLoading((prev) => ({ ...prev, topSelling: false }));
      }
    };

    fetchFeatured();
    fetchTopSelling();
  }, []);

  return (
    <Box>
      {/* 1. Hero Section - Giới thiệu app + Search */}
      <HeroSection />

      {/* 2. Hero Carousel - Sự kiện nổi bật dạng banner */}
      <HeroCarousel events={featuredEvents} loading={loading.featured} />

      {/* 3. Featured Events Grid */}
      <EventSection
        title="Sự kiện nổi bật"
        subtitle="Những sự kiện hot nhất đang chờ bạn"
        icon={<TrendingUp />}
        events={featuredEvents}
        loading={loading.featured}
        viewAllLink="/events?featured=true"
      />

      {/* 4. Top Selling Events */}
      <Box sx={{ bgcolor: '#F8F5FF' }}>
        <EventSection
          title="Bán chạy nhất"
          subtitle="Sự kiện được yêu thích nhất"
          icon={<LocalActivity />}
          events={topSellingEvents}
          loading={loading.topSelling}
          viewAllLink="/events?sort=popularity"
        />
      </Box>

      {/* 5. CTA Section */}
      <CTASection />
    </Box>
  );
};

export default HomePage;