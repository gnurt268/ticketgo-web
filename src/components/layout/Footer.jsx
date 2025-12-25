import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import { Facebook, Instagram, Twitter, YouTube } from '@mui/icons-material';
import { ROUTES } from '@/utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className="bg-gray-900 text-white mt-auto">
      <Container maxWidth="lg" className="py-12">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" className="font-bold text-blue-400 mb-4">
              TicketGo
            </Typography>
            <Typography variant="body2" className="text-gray-400 mb-4">
              Nền tảng đặt vé sự kiện hàng đầu Việt Nam. 
              Trải nghiệm đặt vé nhanh chóng, an toàn và tiện lợi.
            </Typography>
            <Box className="flex gap-2">
              <IconButton size="small" className="text-gray-400 hover:text-white">
                <Facebook />
              </IconButton>
              <IconButton size="small" className="text-gray-400 hover:text-white">
                <Instagram />
              </IconButton>
              <IconButton size="small" className="text-gray-400 hover:text-white">
                <Twitter />
              </IconButton>
              <IconButton size="small" className="text-gray-400 hover:text-white">
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" className="font-semibold mb-4">
              Khám phá
            </Typography>
            <Box className="flex flex-col gap-2">
              <Link to={ROUTES.EVENTS} className="text-gray-400 hover:text-white text-sm">
                Sự kiện
              </Link>
              <Link to={ROUTES.EVENTS} className="text-gray-400 hover:text-white text-sm">
                Âm nhạc
              </Link>
              <Link to={ROUTES.EVENTS} className="text-gray-400 hover:text-white text-sm">
                Thể thao
              </Link>
              <Link to={ROUTES.EVENTS} className="text-gray-400 hover:text-white text-sm">
                Nghệ thuật
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" className="font-semibold mb-4">
              Hỗ trợ
            </Typography>
            <Box className="flex flex-col gap-2">
              <Link to="#" className="text-gray-400 hover:text-white text-sm">
                Trung tâm trợ giúp
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white text-sm">
                Liên hệ
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white text-sm">
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* Legal */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" className="font-semibold mb-4">
              Pháp lý
            </Typography>
            <Box className="flex flex-col gap-2">
              <Link to="#" className="text-gray-400 hover:text-white text-sm">
                Điều khoản sử dụng
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white text-sm">
                Chính sách bảo mật
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white text-sm">
                Chính sách hoàn vé
              </Link>
            </Box>
          </Grid>

          {/* For Organizers */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" className="font-semibold mb-4">
              Đối tác
            </Typography>
            <Box className="flex flex-col gap-2">
              <Link to={ROUTES.REGISTER} className="text-gray-400 hover:text-white text-sm">
                Đăng ký tổ chức
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white text-sm">
                Hướng dẫn tạo sự kiện
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box className="border-t border-gray-800 mt-8 pt-8 text-center">
          <Typography variant="body2" className="text-gray-500">
            © {currentYear} TicketGo. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
