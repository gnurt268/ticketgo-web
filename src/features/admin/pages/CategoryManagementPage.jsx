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
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Skeleton,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/adminAPI";
import { categoryIconSrc } from "@/features/events/useCategories";
import { CATEGORY_ICON_OPTIONS } from "@/features/events/categoryIcons";

const CategoryManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data || []);
    } catch (error) {
      showSnackbar("Lỗi khi tải danh sách", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        iconUrl: category.iconUrl || "",
      });
    } else {
      setEditMode(false);
      setSelectedCategory(null);
      setFormData({ name: "", description: "", iconUrl: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await updateCategory(selectedCategory.id, formData);
        showSnackbar("Cập nhật thành công");
      } else {
        await createCategory(formData);
        showSnackbar("Tạo mới thành công");
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (error) {
      showSnackbar("Lỗi khi lưu", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(selectedCategory.id);
      showSnackbar("Đã xóa category");
      setDeleteDialogOpen(false);
      fetchCategories();
    } catch (error) {
      showSnackbar("Không thể xóa category đang có events", "error");
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
            Quản lý Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý danh mục sự kiện
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCategories}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm mới
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell>ID</TableCell>
                <TableCell>Tên Category</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Số Events</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      Chưa có category nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} hover>
                    <TableCell>{cat.id}</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          component="img"
                          src={categoryIconSrc(cat)}
                          alt=""
                          sx={{
                            width: 32,
                            height: 32,
                            p: 0.5,
                            borderRadius: 1,
                            bgcolor: "grey.100",
                            flexShrink: 0,
                          }}
                        />
                        <Typography fontWeight={600}>{cat.name}</Typography>
                        {!cat.isActive && (
                          <Chip
                            label="Ẩn"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 300 }}
                      >
                        {cat.description || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<EventIcon />}
                        label={cat.eventCount || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(cat)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Chỉnh sửa Category" : "Thêm Category mới"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên Category"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Mô tả"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mt: 2 }}
            multiline
            rows={3}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
            Icon danh mục
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {CATEGORY_ICON_OPTIONS.map((opt) => {
              const selected = formData.iconUrl === opt.path;
              return (
                <Tooltip title={opt.label} key={opt.path}>
                  <Box
                    onClick={() =>
                      setFormData({ ...formData, iconUrl: opt.path })
                    }
                    sx={{
                      width: 56,
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 2,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: selected ? "primary.main" : "divider",
                      bgcolor: selected ? "action.selected" : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: "primary.light" },
                    }}
                  >
                    <Box
                      component="img"
                      src={opt.path}
                      alt={opt.label}
                      sx={{ width: 28, height: 28 }}
                    />
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.name.trim()}
          >
            {editMode ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Chỉ có thể xóa category không có events!
          </Alert>
          <Typography>
            Xóa category <strong>{selectedCategory?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
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

export default CategoryManagementPage;
