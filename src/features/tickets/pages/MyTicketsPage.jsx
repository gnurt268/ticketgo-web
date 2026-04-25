import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  Button,
  TextField,
  InputAdornment,
  alpha,
} from '@mui/material';
import {
  ConfirmationNumber,
  Search,
  EventAvailable,
  History,
  LocalActivity,
} from '@mui/icons-material';
import { EmptyState } from '@/components/common';
import { TicketCard, TicketDetailModal } from '../components';
import ticketAPI from '../ticketAPI';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (activeTab === 0) {
        response = await ticketAPI.getUpcomingTickets();
      } else {
        response = await ticketAPI.getPastTickets();
      }

      setTickets(response.data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Không thể tải danh sách vé. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery('');
  };

  const handleTicketClick = async (ticket) => {
    try {
      const response = await ticketAPI.getTicketById(ticket.id);
      setSelectedTicket(response.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching ticket detail:', err);
      setSelectedTicket(ticket);
      setModalOpen(true);
    }
  };

  const handleShowQR = async (ticket) => {
    try {
      const response = await ticketAPI.getTicketById(ticket.id);
      setSelectedTicket(response.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setSelectedTicket(ticket);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  const handleTransferred = (updatedTicket) => {
    if (updatedTicket) {
      setSelectedTicket(updatedTicket);
    }
    fetchTickets();
  };

  // Filter tickets by search query
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.eventTitle?.toLowerCase().includes(query) ||
      ticket.ticketCode?.toLowerCase().includes(query) ||
      ticket.zoneName?.toLowerCase().includes(query)
    );
  });

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ConfirmationNumber sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700}>
              Vé của tôi
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Quản lý tất cả vé sự kiện của bạn
          </Typography>
        </Box>

        {/* Tabs & Search */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 1,
                px: 2,
              },
            }}
          >
            <Tab
              icon={<EventAvailable sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Sắp tới"
            />
            <Tab
              icon={<History sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Đã qua"
            />
          </Tabs>

          <TextField
            placeholder="Tìm theo tên sự kiện, mã vé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              width: { xs: '100%', sm: 280 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={140}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchTickets}>
                Thử lại
              </Button>
            }
          >
            {error}
          </Alert>
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={LocalActivity}
            title={
              searchQuery
                ? 'Không tìm thấy vé'
                : activeTab === 0
                ? 'Bạn chưa có vé nào sắp tới'
                : 'Bạn chưa có vé nào đã qua'
            }
            description={
              searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Khám phá các sự kiện hấp dẫn và đặt vé ngay!'
            }
            actionLabel={!searchQuery ? 'Khám phá sự kiện' : ''}
            onAction={!searchQuery ? () => navigate('/events') : null}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={handleTicketClick}
                onShowQR={handleShowQR}
              />
            ))}
          </Box>
        )}

        {/* Ticket Detail Modal */}
        <TicketDetailModal
          open={modalOpen}
          onClose={handleCloseModal}
          ticketId={selectedTicket?.id}
          initialData={selectedTicket}
          onTransferred={handleTransferred}
        />
      </Container>
    </Box>
  );
};

export default MyTicketsPage;