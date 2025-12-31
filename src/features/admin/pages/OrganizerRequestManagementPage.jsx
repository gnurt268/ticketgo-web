import { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  IconButton, Button, Chip, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider, Snackbar, Alert, Skeleton, Avatar,
  Card, CardContent, Tabs, Tab, Badge, Tooltip, Link,
} from '@mui/material';
import {
  Search as SearchIcon, Visibility as ViewIcon, Refresh as RefreshIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon, Close as CloseIcon,
  Business as BusinessIcon, Person as PersonIcon, Email as EmailIcon,
  Phone as PhoneIcon, LocationOn as LocationIcon, Link as LinkIcon,
  Description as DescriptionIcon, CalendarToday as CalendarIcon,
  HourglassEmpty as PendingIcon, VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import { formatDateTime } from '@/utils/helpers';
import axiosInstance from '@/api/axiosInstance';

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', color: '#F59E0B', icon: <PendingIcon /> },
  APPROVED: { label: 'Đã duyệt', color: '#10B981', icon: <ApproveIcon /> },
  REJECTED: { label: 'Từ chối', color: '#EF4444', icon: <RejectIcon /> },
  CANCELLED: { label: 'Đã hủy', color: '#6B7280', icon: <RejectIcon /> },
};

const organizationTypeLabels = {
  INDIVIDUAL: 'Cá nhân',
  COMPANY: 'Công ty',
  ORGANIZATION: 'Tổ chức',
};

// API functions
const getOrganizerRequests = async (params) => {
  const response = await axiosInstance.get('/admin/organizer-requests', { params });
  return response.data;
};

const getPendingOrganizerRequests = async (params) => {
  const response = await axiosInstance.get('/admin/organizer-requests/pending', { params });
  return response.data;
};

const getOrganizerRequestDetail = async (id) => {
  const response = await axiosInstance.get(`/admin/organizer-requests/${id}`);
  return response.data;
};

const reviewOrganizerRequest = async (id, data) => {
  const response = await axiosInstance.post(`/admin/organizer-requests/${id}/review`, data);
  return response.data;
};

const getOrganizerRequestStats = async () => {
  const response = await axiosInstance.get('/admin/organizer-requests/statistics');
  return response.data;
};

const OrganizerRequestManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0 });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (tabValue === 1) {
        response = await getPendingOrganizerRequests({ page, size: rowsPerPage });
      } else {
        const params = { page, size: rowsPerPage, sortBy: 'createdAt', sortDirection: 'desc' };
        if (searchKeyword) params.keyword = searchKeyword;
        if (filterStatus) params.status = filterStatus;
        if (tabValue === 2) params.status = 'APPROVED';
        if (tabValue === 3) params.status = 'REJECTED';
        response = await getOrganizerRequests(params);
      }
      
      setRequests(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      showSnackbar('Lỗi khi tải danh sách', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchKeyword, filterStatus, tabValue]);

  const fetchStats = async () => {
    try {
      const data = await getOrganizerRequestStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => { fetchRequests(); fetchStats(); }, [fetchRequests]);

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleViewDetail = async (request) => {
    setSelectedRequest(request);
    setLoadingDetail(true);
    setViewDialogOpen(true);
    try {
      const detail = await getOrganizerRequestDetail(request.id);
      setRequestDetail(detail);
    } catch (error) {
      showSnackbar('Lỗi khi tải chi tiết', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleReviewDialog = (request, action) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setRejectionReason('');
    setAdminNotes('');
    setReviewDialogOpen(true);
  };

  const handleReview = async () => {
    try {
      await reviewOrganizerRequest(selectedRequest.id, {
        approved: reviewAction === 'approve',
        rejectionReason: reviewAction === 'reject' ? rejectionReason : null,
        adminNotes,
      });
      showSnackbar(reviewAction === 'approve' ? 'Đã duyệt yêu cầu thành công' : 'Đã từ chối yêu cầu');
      setReviewDialogOpen(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      showSnackbar('Lỗi khi xử lý', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Quản lý đăng ký Organizer</Typography>
          <Typography variant="body2" color="text.secondary">Duyệt yêu cầu trở thành nhà tổ chức sự kiện</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { fetchRequests(); fetchStats(); }}>Làm mới</Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Tổng yêu cầu', value: stats.totalRequests || 0, color: '#7C3AED' },
          { label: 'Chờ duyệt', value: stats.pendingRequests || 0, color: '#F59E0B' },
          { label: 'Đã duyệt', value: stats.approvedRequests || 0, color: '#10B981' },
          { label: 'Từ chối', value: stats.rejectedRequests || 0, color: '#EF4444' },
        ].map((stat, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card sx={{ bgcolor: `${stat.color}10`, border: `1px solid ${stat.color}30` }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" fontWeight={700} color={stat.color}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs & Filters */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => { setTabValue(v); setPage(0); setFilterStatus(''); }} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Tất cả" />
          <Tab label={<Badge badgeContent={stats.pendingRequests} color="warning">Chờ duyệt</Badge>} />
          <Tab label="Đã duyệt" />
          <Tab label="Từ chối" />
        </Tabs>
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <TextField size="small" placeholder="Tìm kiếm tên tổ chức, email..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchRequests()} sx={{ minWidth: 300 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select value={filterStatus} label="Trạng thái" onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(statusConfig).map(([k, { label }]) => <MenuItem key={k} value={k}>{label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Người đăng ký</TableCell>
                <TableCell>Tên tổ chức</TableCell>
                <TableCell>Loại hình</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày gửi</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? [...Array(5)].map((_, i) => (
                <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              )) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><Typography color="text.secondary">Không có yêu cầu nào</Typography></TableCell></TableRow>
              ) : requests.map((req) => (
                <TableRow key={req.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{req.userFullName?.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{req.userFullName}</Typography>
                        <Typography variant="caption" color="text.secondary">{req.userEmail}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{req.organizationName}</Typography>
                    {req.businessField && <Typography variant="caption" color="text.secondary">{req.businessField}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip label={organizationTypeLabels[req.organizationType] || req.organizationType || 'N/A'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={statusConfig[req.status]?.icon} 
                      label={statusConfig[req.status]?.label} 
                      size="small" 
                      sx={{ bgcolor: `${statusConfig[req.status]?.color}20`, color: statusConfig[req.status]?.color }} 
                    />
                  </TableCell>
                  <TableCell><Typography variant="body2">{req.createdAt}</Typography></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small" onClick={() => handleViewDetail(req)}><ViewIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    {req.status === 'PENDING' && (
                      <>
                        <Tooltip title="Duyệt">
                          <IconButton size="small" color="success" onClick={() => handleReviewDialog(req, 'approve')}><ApproveIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Từ chối">
                          <IconButton size="small" color="error" onClick={() => handleReviewDialog(req, 'reject')}><RejectIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Số hàng:" />
      </Paper>

      {/* View Detail Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Chi tiết yêu cầu đăng ký Organizer
            <IconButton onClick={() => setViewDialogOpen(false)}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? <Skeleton variant="rectangular" height={300} /> : requestDetail && (
            <Box sx={{ pt: 1 }}>
              {/* User Info */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" /> Thông tin người đăng ký
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Họ tên</Typography>
                    <Typography>{requestDetail.userFullName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography>{requestDetail.userEmail}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                    <Typography>{requestDetail.userPhone || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Organization Info */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon fontSize="small" /> Thông tin tổ chức
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Tên tổ chức</Typography>
                    <Typography fontWeight={600}>{requestDetail.organizationName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Loại hình</Typography>
                    <Typography>{organizationTypeLabels[requestDetail.organizationType] || requestDetail.organizationType || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Lĩnh vực</Typography>
                    <Typography>{requestDetail.businessField || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Mã số thuế</Typography>
                    <Typography>{requestDetail.taxCode || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Điện thoại liên hệ</Typography>
                    <Typography>{requestDetail.contactPhone || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Website</Typography>
                    {requestDetail.website ? (
                      <Link href={requestDetail.website} target="_blank" rel="noopener">{requestDetail.website}</Link>
                    ) : (
                      <Typography>N/A</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                    <Typography>{requestDetail.address || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Mô tả tổ chức</Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{requestDetail.organizationDescription || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Lý do đăng ký</Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{requestDetail.reason || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Status Info */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                    <Box>
                      <Chip 
                        label={statusConfig[requestDetail.status]?.label} 
                        sx={{ bgcolor: `${statusConfig[requestDetail.status]?.color}20`, color: statusConfig[requestDetail.status]?.color }} 
                      />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Ngày gửi</Typography>
                    <Typography>{requestDetail.createdAt}</Typography>
                  </Box>
                </Box>
                {requestDetail.status === 'REJECTED' && requestDetail.rejectionReason && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Lý do từ chối:</Typography>
                    <Typography variant="body2">{requestDetail.rejectionReason}</Typography>
                  </Alert>
                )}
                {requestDetail.reviewedByName && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Xử lý bởi: {requestDetail.reviewedByName} - {requestDetail.reviewedAt}
                    </Typography>
                    {requestDetail.adminNotes && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>Ghi chú: {requestDetail.adminNotes}</Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          {requestDetail?.status === 'PENDING' && (
            <>
              <Button variant="outlined" color="error" onClick={() => { setViewDialogOpen(false); handleReviewDialog(requestDetail, 'reject'); }}>Từ chối</Button>
              <Button variant="contained" color="success" onClick={() => { setViewDialogOpen(false); handleReviewDialog(requestDetail, 'approve'); }}>Duyệt</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{reviewAction === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}</DialogTitle>
        <DialogContent>
          {reviewAction === 'approve' ? (
            <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
              Xác nhận duyệt yêu cầu của <strong>{selectedRequest?.userFullName}</strong>?<br/>
              Tổ chức: <strong>{selectedRequest?.organizationName}</strong><br/><br/>
              User sẽ được chuyển thành role ORGANIZER và có thể tạo sự kiện.
            </Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                Từ chối yêu cầu của <strong>{selectedRequest?.userFullName}</strong>
              </Alert>
              <TextField fullWidth multiline rows={3} label="Lý do từ chối *" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Nhập lý do từ chối để người dùng biết cần bổ sung gì..." />
            </>
          )}
          <TextField fullWidth multiline rows={2} label="Ghi chú của Admin (nội bộ)" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} sx={{ mt: 2 }} placeholder="Ghi chú này chỉ admin thấy..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            color={reviewAction === 'approve' ? 'success' : 'error'} 
            onClick={handleReview}
            disabled={reviewAction === 'reject' && !rejectionReason.trim()}
          >
            {reviewAction === 'approve' ? 'Duyệt' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OrganizerRequestManagementPage;