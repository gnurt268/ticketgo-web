import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  Skeleton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Visibility,
  Send,
  Public,
  Cancel as CancelIcon,
  MoreVert,
  Refresh,
  EventBusy,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import organizerAPI from '../organizerAPI';
import { formatDateTime, getErrorMessage } from '@/utils/helpers';

const STATUS_META = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PENDING: { label: 'Chờ duyệt', color: 'warning' },
  APPROVED: { label: 'Đã duyệt', color: 'info' },
  PUBLISHED: { label: 'Đang mở bán', color: 'success' },
  CANCELLED: { label: 'Đã hủy', color: 'error' },
  COMPLETED: { label: 'Hoàn tất', color: 'default' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...Object.entries(STATUS_META).map(([value, meta]) => ({
    value,
    label: meta.label,
  })),
];

const PAGE_SIZE = 10;

const OrganizerEventListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(0);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [keyword, setKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuEvent, setMenuEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };
      if (status) params.status = status;
      if (keyword) params.keyword = keyword;
      const res = await organizerAPI.getMyEvents(params);
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, status, keyword]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const urlStatus = searchParams.get('status') || '';
    if (urlStatus !== status) {
      setStatus(urlStatus);
      setPage(0);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(0);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatus(val);
    setPage(0);
    const next = new URLSearchParams(searchParams);
    if (val) next.set('status', val);
    else next.delete('status');
    setSearchParams(next, { replace: true });
  };

  const handleOpenMenu = (e, event) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuEvent(event);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuEvent(null);
  };

  const runAction = async (fn, successMsg) => {
    if (!menuEvent) return;
    const target = menuEvent;
    handleCloseMenu();
    try {
      setActionLoading(true);
      await fn(target);
      toast.success(successMsg);
      loadEvents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = () =>
    runAction((e) => organizerAPI.submitForApproval(e.id), 'Đã gửi duyệt');

  const handlePublish = () =>
    runAction((e) => organizerAPI.publishEvent(e.id), 'Đã xuất bản sự kiện');

  const handleCancel = () => {
    if (!menuEvent) return;
    const reason = window.prompt('Lý do hủy sự kiện (không bắt buộc):');
    if (reason === null) return;
    runAction((e) => organizerAPI.cancelEvent(e.id, reason), 'Đã hủy sự kiện');
  };

  const events = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Sự kiện của tôi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng: {data?.totalElements ?? 0} sự kiện
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/organizer/events/create')}
        >
          Tạo sự kiện mới
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm theo tên, địa điểm, thành phố..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TextField
            select
            size="small"
            value={status}
            onChange={handleStatusChange}
            sx={{ minWidth: 200 }}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip title="Làm mới">
            <IconButton onClick={loadEvents} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.lighter', color: 'error.dark' }}>
          {error}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell>Sự kiện</TableCell>
                <TableCell>Bắt đầu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Đã bán</TableCell>
                <TableCell align="center" width={100}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton variant="rectangular" height={40} />
                    </TableCell>
                  </TableRow>
                ))
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <EventBusy sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Chưa có sự kiện nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Hãy tạo sự kiện đầu tiên của bạn
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/organizer/events/create')}
                      >
                        Tạo sự kiện
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((ev) => {
                  const meta = STATUS_META[ev.status] || { label: ev.status, color: 'default' };
                  return (
                    <TableRow
                      key={ev.id}
                      hover
                      onClick={() => navigate(`/organizer/events/${ev.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                              backgroundImage: ev.posterUrl
                                ? `url(${ev.posterUrl})`
                                : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                              noWrap
                              title={ev.title}
                            >
                              {ev.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {ev.venue}
                              {ev.city ? ` · ${ev.city}` : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(ev.startDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={meta.label}
                          color={meta.color}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ev.totalTicketsSold ?? 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, ev)}
                          disabled={actionLoading}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(_, p) => setPage(p - 1)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            navigate(`/organizer/events/${menuEvent?.id}`);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        {menuEvent?.status === 'DRAFT' && (
          <MenuItem
            onClick={() => {
              navigate(`/organizer/events/${menuEvent?.id}/edit`);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Chỉnh sửa</ListItemText>
          </MenuItem>
        )}
        {menuEvent?.status === 'DRAFT' && (
          <MenuItem onClick={handleSubmit}>
            <ListItemIcon>
              <Send fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Gửi duyệt</ListItemText>
          </MenuItem>
        )}
        {menuEvent?.status === 'APPROVED' && (
          <MenuItem onClick={handlePublish}>
            <ListItemIcon>
              <Public fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Xuất bản (mở bán)</ListItemText>
          </MenuItem>
        )}
        {menuEvent?.status &&
          !['CANCELLED', 'COMPLETED'].includes(menuEvent.status) && (
            <MenuItem onClick={handleCancel} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <CancelIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Hủy sự kiện</ListItemText>
            </MenuItem>
          )}
      </Menu>
    </Box>
  );
};

export default OrganizerEventListPage;
