import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  CardActionArea,
  LinearProgress,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  QrCodeScanner,
  ArrowBack,
  Event as EventIcon,
  LocationOn,
  AccessTime,
} from '@mui/icons-material';
import checkinAPI from '../checkinAPI';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const CheckinEventPickerPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await checkinAPI.getMyEvents();
        setEvents(res.data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar
        position="sticky"
        elevation={2}
        sx={{ background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)' }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <QrCodeScanner sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} color="white">
            Chọn sự kiện để soát vé
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : events.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Chưa có sự kiện nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn chưa được giao soát vé cho sự kiện nào, hoặc chưa có sự kiện đang mở bán.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.map((ev) => {
              const pct = ev.totalTickets > 0
                ? Math.round((ev.totalCheckedIn / ev.totalTickets) * 100)
                : 0;
              return (
                <Paper key={ev.id} elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <CardActionArea onClick={() => navigate(`/checkin/${ev.id}`)} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        component="img"
                        src={ev.posterUrl || '/icons/categories/default.svg'}
                        alt=""
                        sx={{
                          width: 64, height: 64, borderRadius: 2, objectFit: 'cover',
                          bgcolor: 'grey.100', flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>
                          {ev.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <AccessTime sx={{ fontSize: 15 }} />
                          <Typography variant="caption">{formatTime(ev.startDate)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <LocationOn sx={{ fontSize: 15 }} />
                          <Typography variant="caption" noWrap>
                            {ev.venue}{ev.city ? ` • ${ev.city}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        size="small"
                        label={`${ev.totalCheckedIn}/${ev.totalTickets}`}
                        sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        mt: 1.5, height: 8, borderRadius: 5, bgcolor: '#E9D5FF',
                        '& .MuiLinearProgress-bar': { bgcolor: '#7C3AED', borderRadius: 5 },
                      }}
                    />
                  </CardActionArea>
                </Paper>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CheckinEventPickerPage;
