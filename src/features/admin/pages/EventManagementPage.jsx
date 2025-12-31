import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Snackbar,
  Skeleton,
  Tabs,
  Tab,
  Badge,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  ConfirmationNumber as TicketIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  getEvents,
  getPendingEvents,
  getEventDetail,
  approveEvent,
  toggleEventFeatured,
  cancelEvent,
  deleteEvent,
} from "../api/adminAPI";
import { formatDate, formatDateTime } from "@/utils/helpers";

const statusConfig = {
  DRAFT: { label: "Bản nháp", color: "#9CA3AF" },
  PENDING: { label: "Chờ duyệt", color: "#F59E0B" },
  APPROVED: { label: "Đã duyệt", color: "#10B981" },
  PUBLISHED: { label: "Đã xuất bản", color: "#3B82F6" },
  CANCELLED: { label: "Đã hủy", color: "#EF4444" },
  COMPLETED: { label: "Hoàn thành", color: "#6B7280" },
  REJECTED: { label: "Từ chối", color: "#EF4444" },
};

const EventManagementPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("status") === "pending" ? 1 : 0;

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [tabValue, setTabValue] = useState(initialTab);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [eventDetail, setEventDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [stats] = useState({
    pending: 0,
    published: 0,
    cancelled: 0,
    featured: 0,
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (tabValue === 1) {
        response = await getPendingEvents({ page, size: rowsPerPage });
      } else {
        const params = {
          page,
          size: rowsPerPage,
          sortBy: "createdAt",
          sortDirection: "desc",
        };
        if (searchKeyword) params.keyword = searchKeyword;
        if (filterStatus) params.status = filterStatus;
        if (tabValue === 2) params.status = "PUBLISHED";
        if (tabValue === 3) params.status = "CANCELLED";
        if (tabValue === 4) params.isFeatured = true;
        response = await getEvents(params);
      }
      setEvents(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      showSnackbar("Lỗi khi tải danh sách events", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchKeyword, filterStatus, tabValue]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const handleMenuOpen = (event, eventItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventItem);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleViewDetail = async () => {
    handleMenuClose();
    setLoadingDetail(true);
    setViewDialogOpen(true);
    try {
      const detail = await getEventDetail(selectedEvent.id);
      setEventDetail(detail);
    } catch (error) {
      showSnackbar("Lỗi khi tải chi tiết", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprovalDialog = (action) => {
    setApprovalAction(action);
    setApprovalDialogOpen(true);
    handleMenuClose();
  };

  const handleApproveEvent = async () => {
    try {
      await approveEvent(selectedEvent.id, {
        approved: approvalAction === "approve",
        rejectionReason: approvalAction === "reject" ? rejectionReason : null,
      });
      showSnackbar(
        approvalAction === "approve" ? "Đã duyệt thành công" : "Đã từ chối"
      );
      setApprovalDialogOpen(false);
      setRejectionReason("");
      fetchEvents();
    } catch (error) {
      showSnackbar("Lỗi khi xử lý", "error");
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await toggleEventFeatured(selectedEvent.id);
      showSnackbar(
        selectedEvent.isFeatured ? "Đã bỏ nổi bật" : "Đã đánh dấu nổi bật"
      );
      fetchEvents();
    } catch (error) {
      showSnackbar("Lỗi", "error");
    }
    handleMenuClose();
  };

  const handleCancelEvent = async () => {
    try {
      await cancelEvent(selectedEvent.id, cancelReason);
      showSnackbar("Đã hủy event");
      setCancelDialogOpen(false);
      fetchEvents();
    } catch (error) {
      showSnackbar("Lỗi", "error");
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(selectedEvent.id);
      showSnackbar("Đã xóa event");
      setDeleteDialogOpen(false);
      fetchEvents();
    } catch (error) {
      showSnackbar("Lỗi", "error");
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Quản lý Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Duyệt và quản lý sự kiện
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchEvents}
        >
          Làm mới
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Tổng Events", value: totalElements, color: "#7C3AED" },
          { label: "Chờ duyệt", value: stats.pending, color: "#F59E0B" },
          { label: "Đã xuất bản", value: stats.published, color: "#3B82F6" },
          { label: "Đã hủy", value: stats.cancelled, color: "#EF4444" },
        ].map((stat, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card
              sx={{
                bgcolor: `${stat.color}10`,
                border: `1px solid ${stat.color}30`,
              }}
            >
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="h5" fontWeight={700} color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => {
            setTabValue(v);
            setPage(0);
          }}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label="Tất cả" />
          <Tab
            label={
              <Badge badgeContent={stats.pending} color="warning">
                Chờ duyệt
              </Badge>
            }
          />
          <Tab label="Đã xuất bản" />
          <Tab label="Đã hủy" />
          <Tab label="Nổi bật" />
        </Tabs>
        <Box sx={{ p: 2, display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchEvents()}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filterStatus}
              label="Trạng thái"
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(statusConfig).map(([k, { label }]) => (
                <MenuItem key={k} value={k}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell>Event</TableCell>
                <TableCell>Organizer</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Nổi bật</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      Không có event
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((evt) => (
                  <TableRow key={evt.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          variant="rounded"
                          src={evt.bannerUrl}
                          sx={{ width: 60, height: 40 }}
                        >
                          <EventIcon />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                            sx={{ maxWidth: 250 }}
                          >
                            {evt.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {evt.categoryName} • {evt.city}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{evt.organizerName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(evt.startDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusConfig[evt.status]?.label}
                        size="small"
                        sx={{
                          bgcolor: `${statusConfig[evt.status]?.color}20`,
                          color: statusConfig[evt.status]?.color,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {evt.isFeatured ? (
                        <StarIcon sx={{ color: "#F59E0B" }} />
                      ) : (
                        <StarBorderIcon sx={{ color: "grey.400" }} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, evt)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Số hàng:"
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetail}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        {selectedEvent?.status === "PENDING" && (
          <>
            <MenuItem onClick={() => handleApprovalDialog("approve")}>
              <ApproveIcon fontSize="small" sx={{ mr: 1 }} color="success" />
              Duyệt
            </MenuItem>
            <MenuItem onClick={() => handleApprovalDialog("reject")}>
              <RejectIcon fontSize="small" sx={{ mr: 1 }} color="error" />
              Từ chối
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleToggleFeatured}>
          {selectedEvent?.isFeatured ? (
            <>
              <StarBorderIcon fontSize="small" sx={{ mr: 1 }} />
              Bỏ nổi bật
            </>
          ) : (
            <>
              <StarIcon fontSize="small" sx={{ mr: 1, color: "#F59E0B" }} />
              Nổi bật
            </>
          )}
        </MenuItem>
        {selectedEvent?.status === "PUBLISHED" && (
          <MenuItem
            onClick={() => {
              setCancelDialogOpen(true);
              handleMenuClose();
            }}
          >
            <RejectIcon fontSize="small" sx={{ mr: 1 }} color="error" />
            Hủy Event
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            Chi tiết Event
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            eventDetail && (
              <Box sx={{ pt: 1 }}>
                {eventDetail.bannerUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={eventDetail.bannerUrl}
                    sx={{ borderRadius: 2, mb: 2 }}
                  />
                )}
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {eventDetail.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={statusConfig[eventDetail.status]?.label}
                    sx={{
                      bgcolor: `${statusConfig[eventDetail.status]?.color}20`,
                      color: statusConfig[eventDetail.status]?.color,
                    }}
                  />
                  {eventDetail.isFeatured && (
                    <Chip label="Nổi bật" color="warning" icon={<StarIcon />} />
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Organizer
                        </Typography>
                        <Typography variant="body2">
                          {eventDetail.organizerName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Thời gian
                        </Typography>
                        <Typography variant="body2">
                          {formatDateTime(eventDetail.startDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Địa điểm
                        </Typography>
                        <Typography variant="body2">
                          {eventDetail.venueName}, {eventDetail.city}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TicketIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Vé
                        </Typography>
                        <Typography variant="body2">
                          {eventDetail.totalTicketsSold || 0}/
                          {eventDetail.totalCapacity || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Mô tả
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {eventDetail.description}
                </Typography>
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          {eventDetail?.status === "PENDING" && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleApprovalDialog("reject");
                }}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleApprovalDialog("approve");
                }}
              >
                Duyệt
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalAction === "approve" ? "Duyệt Event" : "Từ chối Event"}
        </DialogTitle>
        <DialogContent>
          {approvalAction === "approve" ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              Duyệt event <strong>{selectedEvent?.title}</strong>?
            </Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                Từ chối event <strong>{selectedEvent?.title}</strong>
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Lý do"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color={approvalAction === "approve" ? "success" : "error"}
            onClick={handleApproveEvent}
            disabled={approvalAction === "reject" && !rejectionReason.trim()}
          >
            {approvalAction === "approve" ? "Duyệt" : "Từ chối"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Hủy Event</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
            Sẽ thông báo đến người mua vé!
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Lý do hủy"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Hủy bỏ</Button>
          <Button variant="contained" color="error" onClick={handleCancelEvent}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Không thể hoàn tác!
          </Alert>
          <Typography>
            Xóa event <strong>{selectedEvent?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteEvent}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventManagementPage;
