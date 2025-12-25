import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import { Facebook, Instagram, Twitter, YouTube } from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';
import { Logo } from '@/assets/brand';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: '#1E1B4B', // Tím đen từ theme
        color: 'white',
        mt: 'auto' 
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Logo size="md" />
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
              Nền tảng đặt vé sự kiện hàng đầu Việt Nam. 
              Trải nghiệm đặt vé nhanh chóng, an toàn và tiện lợi.
            </Typography>
            <Box className="flex gap-1">
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#A78BFA' }
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#A78BFA' }
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#A78BFA' }
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#A78BFA' }
                }}
              >
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Khám phá
            </Typography>
            <Box className="flex flex-col gap-2">
              {['Sự kiện', 'Âm nhạc', 'Thể thao', 'Nghệ thuật'].map((item) => (
                <Link 
                  key={item}
                  to={ROUTES.EVENTS} 
                  style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                  }}
                  className="hover:text-purple-400"
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Hỗ trợ
            </Typography>
            <Box className="flex flex-col gap-2">
              {['Trung tâm trợ giúp', 'Liên hệ', 'FAQ'].map((item) => (
                <Link 
                  key={item}
                  to="#" 
                  style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                  }}
                  className="hover:text-purple-400"
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Legal */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Pháp lý
            </Typography>
            <Box className="flex flex-col gap-2">
              {['Điều khoản sử dụng', 'Chính sách bảo mật', 'Chính sách hoàn vé'].map((item) => (
                <Link 
                  key={item}
                  to="#" 
                  style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                  }}
                  className="hover:text-purple-400"
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* For Organizers */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Đối tác
            </Typography>
            <Box className="flex flex-col gap-2">
              <Link 
                to="#" 
                style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
                className="hover:text-purple-400"
              >
                Đăng ký tổ chức
              </Link>
              <Link 
                to="#" 
                style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
                className="hover:text-purple-400"
              >
                Hướng dẫn tạo sự kiện
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4, pt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            © {currentYear} TicketGo. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;