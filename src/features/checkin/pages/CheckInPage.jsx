import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Fade,
  Slide,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  QrCodeScanner,
  CheckCircle,
  Cancel,
  Person,
  Event,
  ConfirmationNumber,
  Chair,
  Refresh,
  Keyboard,
  KeyboardHide,
  VolumeUp,
  VolumeOff,
  ArrowBack,
  Phone,
  Email,
  AccessTime,
  LocationOn,
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { selectUser } from '@/features/auth';
import checkinAPI from '../checkinAPI';

const CheckInPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [lastScanTime, setLastScanTime] = useState(null);

  const scannerRef = useRef(null);
  const inputRef = useRef(null);
  const lastScannedRef = useRef('');

  // Play sound
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.value = 1100;
        }, 100);
        setTimeout(() => oscillator.stop(), 200);
      } else {
        oscillator.frequency.value = 300;
        oscillator.type = 'square';
        gainNode.gain.value = 0.2;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 400);
      }
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Handle scan
  const handleScan = useCallback(async (qrContent) => {
    const content = qrContent.trim();
    
    if (content === lastScannedRef.current) {
      const timeDiff = Date.now() - lastScanTime;
      if (timeDiff < 2000) return;
    }

    lastScannedRef.current = content;
    setLastScanTime(Date.now());
    setLoading(true);
    setResult(null);

    try {
      const response = await checkinAPI.scan(content);
      const data = response.data;

      setResult(data);
      setStats(prev => ({
        total: prev.total + 1,
        success: data.success ? prev.success + 1 : prev.success,
        failed: data.success ? prev.failed : prev.failed + 1,
      }));
      playSound(data.success ? 'success' : 'error');

    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi kết nối server';
      setResult({ success: false, message });
      setStats(prev => ({ ...prev, total: prev.total + 1, failed: prev.failed + 1 }));
      playSound('error');
    } finally {
      setLoading(false);
    }
  }, [lastScanTime, playSound]);

  // Initialize scanner
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
      },
      (error) => {}
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim() && !loading) {
      handleScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleReset = () => {
    setResult(null);
    lastScannedRef.current = '';
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        elevation={2}
        sx={{ 
          background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)',
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          
          <QrCodeScanner sx={{ mr: 1.5, fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} color='white'>
              Check-in Scanner
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, color: 'white' }}>
              {user?.fullName} • {user?.role}
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              size="small"
              icon={<CheckCircle sx={{ fontSize: 18 }} />}
              label={stats.success}
              sx={{ 
                bgcolor: '#4ADE80', 
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              size="small"
              icon={<Cancel sx={{ fontSize: 18 }} />}
              label={stats.failed}
              sx={{ 
                bgcolor: '#F87171', 
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* Scanner Card */}
        <Paper 
          elevation={3}
          sx={{ 
            mb: 2, 
            borderRadius: 3, 
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <Box
            id="qr-reader"
            sx={{
              width: '100%',
              '& video': { borderRadius: 0 },
              '& #qr-reader__scan_region': { 
                background: '#f8f8f8 !important',
                minHeight: 280,
              },
              '& #qr-reader__dashboard': { 
                background: 'white !important',
                padding: '16px !important',
                borderTop: '1px solid #eee',
              },
              '& #qr-reader__dashboard button': { 
                borderRadius: '8px !important',
                background: '#7C3AED !important',
                color: 'white !important',
                border: 'none !important',
                padding: '8px 16px !important',
                cursor: 'pointer',
              },
              '& #qr-reader__dashboard select': {
                borderRadius: '8px !important',
                padding: '8px 12px !important',
                border: '1px solid #ddd !important',
              },
              '& #qr-reader__dashboard a': {
                color: '#7C3AED !important',
              },
            }}
          />
          {loading && <LinearProgress />}
        </Paper>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
          <Button
            variant={showManualInput ? 'contained' : 'outlined'}
            size="medium"
            startIcon={showManualInput ? <KeyboardHide /> : <Keyboard />}
            onClick={() => setShowManualInput(!showManualInput)}
            sx={{ 
              borderRadius: 2,
              px: 2,
              bgcolor: showManualInput ? '#7C3AED' : 'white',
              color: showManualInput ? 'white' : '#7C3AED',
              borderColor: '#7C3AED',
              '&:hover': {
                bgcolor: showManualInput ? '#6D28D9' : 'rgba(124, 58, 237, 0.08)',
                borderColor: '#7C3AED',
              },
            }}
          >
            Nhập tay
          </Button>
          
          <IconButton
            onClick={() => setSoundEnabled(!soundEnabled)}
            sx={{ 
              bgcolor: 'white',
              border: '1px solid',
              borderColor: soundEnabled ? '#7C3AED' : '#ccc',
              color: soundEnabled ? '#7C3AED' : '#999',
              '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.08)' },
            }}
          >
            {soundEnabled ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
          
          <Button
            variant="outlined"
            size="medium"
            startIcon={<Refresh />}
            onClick={handleReset}
            sx={{ 
              borderRadius: 2,
              px: 2,
              bgcolor: 'white',
              borderColor: '#7C3AED', 
              color: '#7C3AED',
              '&:hover': {
                bgcolor: 'rgba(124, 58, 237, 0.08)',
                borderColor: '#7C3AED',
              },
            }}
          >
            Reset
          </Button>
        </Box>

        {/* Manual Input */}
        <Slide direction="down" in={showManualInput} mountOnEnter unmountOnExit>
          <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <form onSubmit={handleManualSubmit}>
              <TextField
                fullWidth
                size="small"
                placeholder="Dán nội dung QR code vào đây..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                inputRef={inputRef}
                autoFocus
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    bgcolor: '#f9f9f9',
                  },
                }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || !manualInput.trim()}
                sx={{ 
                  mt: 1.5, 
                  borderRadius: 2,
                  py: 1,
                  bgcolor: '#7C3AED',
                  '&:hover': { bgcolor: '#6D28D9' },
                }}
              >
                Check-in
              </Button>
            </form>
          </Paper>
        </Slide>

        {/* Result */}
        {result && (
          <Fade in={true}>
            <Paper
              elevation={4}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '3px solid',
                borderColor: result.success ? '#22C55E' : '#EF4444',
              }}
            >
              {/* Status Header */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: result.success ? '#22C55E' : '#EF4444',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                {result.success ? (
                  <CheckCircle sx={{ fontSize: 64, mb: 1 }} />
                ) : (
                  <Cancel sx={{ fontSize: 64, mb: 1 }} />
                )}
                <Typography variant="h4" fontWeight={700}>
                  {result.success ? 'THÀNH CÔNG' : 'KHÔNG HỢP LỆ'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
                  {result.message}
                </Typography>
              </Box>

              {/* Ticket Info */}
              {result.ticketCode && (
                <Box sx={{ p: 3, bgcolor: 'white' }}>
                  {/* Holder Name */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2.5,
                    p: 2,
                    bgcolor: '#F3E8FF',
                    borderRadius: 2,
                    border: '1px solid #E9D5FF',
                  }}>
                    <Person sx={{ color: '#7C3AED', fontSize: 44 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        Người tham dự
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="#1a1a1a">
                        {result.holderName}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Info Grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    {/* Ticket Code */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <ConfirmationNumber sx={{ color: '#7C3AED', fontSize: 20 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Mã vé
                        </Typography>
                      </Box>
                      <Typography fontWeight={700} fontFamily="monospace" fontSize="1rem" color="#1a1a1a">
                        {result.ticketCode}
                      </Typography>
                    </Paper>

                    {/* Zone & Seat */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chair sx={{ color: '#7C3AED', fontSize: 20 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Khu vực / Ghế
                        </Typography>
                      </Box>
                      <Typography fontWeight={700} fontSize="1rem" color="#1a1a1a">
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: result.zoneColorCode || '#7C3AED',
                            mr: 1,
                            verticalAlign: 'middle',
                          }}
                        />
                        {result.zoneName}
                        {result.seatCode && ` - ${result.rowNumber || ''}${result.seatCode}`}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Event */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Event sx={{ color: '#7C3AED', fontSize: 20 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        Sự kiện
                      </Typography>
                    </Box>
                    <Typography fontWeight={700} fontSize="1.1rem" color="#1a1a1a" gutterBottom>
                      {result.eventTitle}
                    </Typography>
                    {result.eventStartDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <AccessTime sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {formatTime(result.eventStartDate)}
                        </Typography>
                      </Box>
                    )}
                    {result.eventVenue && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mt: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {result.eventVenue}
                        </Typography>
                      </Box>
                    )}
                  </Paper>

                  {/* Contact Info */}
                  {(result.holderEmail || result.holderPhone) && (
                    <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                      {result.holderPhone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Phone sx={{ color: '#7C3AED', fontSize: 18 }} />
                          <Typography variant="body2" color="text.secondary">
                            {result.holderPhone}
                          </Typography>
                        </Box>
                      )}
                      {result.holderEmail && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Email sx={{ color: '#7C3AED', fontSize: 18 }} />
                          <Typography variant="body2" color="text.secondary">
                            {result.holderEmail}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Stats Progress */}
                  {result.totalCheckedIn != null && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Tiến độ check-in sự kiện
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="#7C3AED">
                          {result.totalCheckedIn} 
                          <Typography component="span" variant="h5" color="text.secondary" fontWeight={500}>
                            {' '}/ {result.totalTickets}
                          </Typography>
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={result.totalTickets > 0 ? (result.totalCheckedIn / result.totalTickets) * 100 : 0}
                          sx={{ 
                            mt: 1.5, 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: '#E9D5FF',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#7C3AED',
                              borderRadius: 5,
                            },
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {result.totalTickets > 0 
                            ? `${Math.round((result.totalCheckedIn / result.totalTickets) * 100)}% hoàn thành` 
                            : '0%'}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              )}

              {/* Next Scan Button */}
              <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderTop: '1px solid #eee' }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<QrCodeScanner />}
                  onClick={handleReset}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    bgcolor: '#7C3AED',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#6D28D9' },
                  }}
                >
                  Quét vé tiếp theo
                </Button>
              </Box>
            </Paper>
          </Fade>
        )}

        {/* Instructions */}
        {!result && !loading && (
          <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white' }}>
            <Typography variant="subtitle1" color="primary" gutterBottom fontWeight={600}>
              📱 Hướng dẫn sử dụng
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.75 } }}>
                <li>Đưa mã QR trên vé vào khung hình camera</li>
                <li>Giữ yên cho đến khi quét thành công</li>
                <li>Có thể dùng máy quét USB (tự động nhập)</li>
                <li>Nhấn <strong>Nhập tay</strong> nếu camera không hoạt động</li>
              </Box>
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default CheckInPage;