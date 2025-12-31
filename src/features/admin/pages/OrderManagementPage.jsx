import { useState, useEffect, useCallback } from "react";
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  ShoppingCart as OrderIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { getOrders, getOrderDetail } from "../api/adminAPI";
import { formatCurrency, formatDateTime } from "@/utils/helpers";

const statusConfig = {
  PENDING: { label: "Chờ thanh toán", color: "#F59E0B" },
  COMPLETED: { label: "Đã thanh toán", color: "#10B981" },
  FAILED: { label: "Thất bại", color: "#EF4444" },
  CANCELLED: { label: "Đã hủy", color: "#6B7280" },
  EXPIRED: { label: "Hết hạn", color: "#9CA3AF" },
};

const OrderManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  console.log("Render OrderManagementPage", orders);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: rowsPerPage,
        sortBy: "createdAt",
        sortDirection: "desc",
      };
      if (searchKeyword) params.keyword = searchKeyword;
      if (filterStatus) params.paymentStatus = filterStatus;
      const response = await getOrders(params);
      setOrders(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      showSnackbar("Lỗi khi tải danh sách", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchKeyword, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleViewDetail = async (order) => {
    setLoadingDetail(true);
    setViewDialogOpen(true);
    try {
      const detail = await getOrderDetail(order.id);
      setOrderDetail(detail);
    } catch (error) {
      showSnackbar("Lỗi khi tải chi tiết", "error");
    } finally {
      setLoadingDetail(false);
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
            Quản lý Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xem và quản lý đơn hàng
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchOrders}
        >
          Làm mới
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm mã đơn, tên khách..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
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
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      Không có đơn hàng
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {order.orderCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "primary.main",
                          }}
                        >
                          {order.buyerName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {order.buyerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.buyerEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {order.eventTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary"
                      >
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusConfig[order.paymentStatus]?.label}
                        size="small"
                        sx={{
                          bgcolor: `${
                            statusConfig[order.paymentStatus]?.color
                          }20`,
                          color: statusConfig[order.paymentStatus]?.color,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(order)}
                      >
                        <ViewIcon fontSize="small" />
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số hàng:"
        />
      </Paper>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            Chi tiết đơn hàng
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            orderDetail && (
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <OrderIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Mã đơn
                        </Typography>
                        <Typography fontWeight={600}>
                          {orderDetail.orderCode}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <CalendarIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Ngày đặt
                        </Typography>
                        <Typography>
                          {formatDateTime(orderDetail.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Thông tin khách hàng
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Họ tên
                    </Typography>
                    <Typography>{orderDetail.buyerName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography>{orderDetail.buyerEmail}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Điện thoại
                    </Typography>
                    <Typography>{orderDetail.buyerPhone || "N/A"}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Thông tin vé
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography fontWeight={600}>
                    {orderDetail.eventTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {orderDetail.eventDate} • {orderDetail.eventVenue}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {orderDetail.tickets?.map((ticket, idx) => (
                      <Chip
                        key={idx}
                        label={`${ticket.zoneName} - ${
                          ticket.seatLabel || "Không đánh số"
                        }`}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Paper>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Box>
                      <Chip
                        label={statusConfig[orderDetail.paymentStatus]?.label}
                        sx={{
                          bgcolor: `${
                            statusConfig[orderDetail.paymentStatus]?.color
                          }20`,
                          color: statusConfig[orderDetail.paymentStatus]?.color,
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" color="text.secondary">
                      Tổng tiền
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      {formatCurrency(orderDetail.totalAmount)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
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

export default OrderManagementPage;
