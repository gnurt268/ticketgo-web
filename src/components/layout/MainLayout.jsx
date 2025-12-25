import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <Box className="min-h-screen flex flex-col">
      <Header />
      <Box component="main" className="flex-1">
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
