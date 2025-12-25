import { Box, Container, Typography } from '@mui/material';

const HomePage = () => {
  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" className="font-bold mb-4">
        Chào mừng đến với TicketGo
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Khám phá và đặt vé cho các sự kiện hấp dẫn nhất.
      </Typography>
    </Container>
  );
};

export default HomePage;
