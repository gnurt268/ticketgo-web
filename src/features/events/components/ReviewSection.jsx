import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  Button,
  TextField,
  Avatar,
  Divider,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Skeleton,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FilterAltOff as FilterAltOffIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks';
import axiosInstance from '@/api/axiosInstance';
import { formatDate } from '@/utils/helpers';

const PAGE_SIZE = 10;

const ReviewSection = ({ eventId, isEventEnded }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter state
  const [filterRating, setFilterRating] = useState(null); // null | 1..5
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | highest | lowest
  const [withCommentOnly, setWithCommentOnly] = useState(false);

  // Review form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    const response = await axiosInstance.get(`/reviews/event/${eventId}/summary`);
    setSummary(response.data);
  }, [eventId]);

  // Initial summary load
  useEffect(() => {
    if (!eventId || !isEventEnded) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/reviews/event/${eventId}/summary`);
        if (active) setSummary(response.data);
      } catch (err) {
        console.error('Error fetching review summary:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [eventId, isEventEnded]);

  // Fetch reviews on filter/sort/page change
  useEffect(() => {
    if (!eventId || !isEventEnded) return;
    let active = true;
    (async () => {
      try {
        setReviewsLoading(true);
        const response = await axiosInstance.get(`/reviews/event/${eventId}`, {
          params: {
            page: page - 1,
            size: PAGE_SIZE,
            sort: sortBy,
            ...(filterRating != null ? { rating: filterRating } : {}),
            ...(withCommentOnly ? { withComment: true } : {}),
          },
        });
        if (!active) return;
        setReviews(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalFiltered(response.data.totalElements || 0);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        if (active) setReviewsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [eventId, isEventEnded, page, sortBy, filterRating, withCommentOnly, refreshKey]);

  const handleFilterRating = (value) => {
    setFilterRating(value);
    setPage(1);
  };
  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };
  const handleWithCommentChange = (checked) => {
    setWithCommentOnly(checked);
    setPage(1);
  };
  const handleResetFilters = () => {
    setFilterRating(null);
    setSortBy('newest');
    setWithCommentOnly(false);
    setPage(1);
  };

  const isFilterActive = filterRating != null || withCommentOnly || sortBy !== 'newest';

  const handleOpenDialog = (review = null) => {
    if (review) {
      // Edit mode
      setEditingReview(review);
      setFormRating(review.rating);
      setFormTitle(review.title || '');
      setFormComment(review.comment || '');
    } else {
      // Create mode
      setEditingReview(null);
      setFormRating(5);
      setFormTitle('');
      setFormComment('');
    }
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingReview(null);
    setError('');
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      setError('');

      const data = {
        eventId,
        rating: formRating,
        title: formTitle || null,
        comment: formComment || null,
      };

      if (editingReview) {
        // Update
        await axiosInstance.put(`/reviews/${editingReview.id}`, data);
      } else {
        // Create
        await axiosInstance.post('/reviews', data);
      }

      await fetchSummary();
      setRefreshKey((k) => k + 1);

      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);

      await fetchSummary();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Don't show if event hasn't ended
  if (!isEventEnded) {
    return null;
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={150} sx={{ mt: 2 }} />
      </Paper>
    );
  }

  const avgRating = summary?.averageRating || 0;
  const totalReviews = summary?.totalReviews || 0;
  const ratingDistribution = summary?.ratingDistribution || {};
  const canReview = summary?.canReview || false;
  const userReview = summary?.userReview;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Đánh giá sự kiện
      </Typography>

      {/* Rating Summary */}
      <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
        {/* Left: Average */}
        <Box sx={{ textAlign: 'center', minWidth: 120 }}>
          <Typography variant="h2" fontWeight={700} color="primary.main">
            {avgRating.toFixed(1)}
          </Typography>
          <Rating value={avgRating} precision={0.1} readOnly size="medium" />
          <Typography variant="body2" color="text.secondary">
            {totalReviews} đánh giá
          </Typography>
        </Box>

        {/* Right: Distribution */}
        <Box sx={{ flex: 1 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ minWidth: 20 }}>{star}</Typography>
                <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                <LinearProgress 
                  variant="determinate" 
                  value={percent} 
                  sx={{ 
                    flex: 1, 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' }
                  }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30 }}>
                  {count}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* User's Review or Write Button */}
      {isAuthenticated ? (
        userReview ? (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="primary.main" gutterBottom>
                  Đánh giá của bạn
                </Typography>
                <Rating value={userReview.rating} readOnly size="small" />
                {userReview.title && (
                  <Typography fontWeight={600} sx={{ mt: 1 }}>{userReview.title}</Typography>
                )}
                {userReview.comment && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{userReview.comment}</Typography>
                )}
              </Box>
              <Box>
                <IconButton size="small" onClick={() => handleOpenDialog(userReview)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteReview(userReview.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        ) : canReview ? (
          <Button 
            variant="contained" 
            onClick={() => handleOpenDialog()}
            sx={{ mb: 3 }}
          >
            Viết đánh giá
          </Button>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            {summary?.cannotReviewReason || 'Bạn không thể đánh giá sự kiện này'}
          </Alert>
        )
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Đăng nhập để viết đánh giá
        </Alert>
      )}

      {/* Reviews List */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Tất cả đánh giá ({totalReviews})
      </Typography>

      {/* Filters */}
      {totalReviews > 0 && (
        <Box sx={{ mb: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label="Tất cả"
                size="small"
                color={filterRating == null ? 'primary' : 'default'}
                variant={filterRating == null ? 'filled' : 'outlined'}
                onClick={() => handleFilterRating(null)}
              />
              {[5, 4, 3, 2, 1].map((star) => (
                <Chip
                  key={star}
                  size="small"
                  color={filterRating === star ? 'primary' : 'default'}
                  variant={filterRating === star ? 'filled' : 'outlined'}
                  onClick={() => handleFilterRating(star)}
                  icon={<StarIcon sx={{ fontSize: 14, color: filterRating === star ? 'inherit' : '#F59E0B' }} />}
                  label={`${star} (${ratingDistribution[star] || 0})`}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="review-sort-label">Sắp xếp</InputLabel>
                <Select
                  labelId="review-sort-label"
                  label="Sắp xếp"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="oldest">Cũ nhất</MenuItem>
                  <MenuItem value="highest">Đánh giá cao</MenuItem>
                  <MenuItem value="lowest">Đánh giá thấp</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={withCommentOnly}
                    onChange={(e) => handleWithCommentChange(e.target.checked)}
                  />
                }
                label="Có nhận xét"
              />

              {isFilterActive && (
                <IconButton size="small" onClick={handleResetFilters} title="Xoá bộ lọc">
                  <FilterAltOffIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {reviewsLoading ? 'Đang tải...' : `Hiển thị ${totalFiltered} đánh giá`}
          </Typography>
        </Box>
      )}

      {reviewsLoading ? (
        <Box>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {isFilterActive ? 'Không có đánh giá nào khớp với bộ lọc' : 'Chưa có đánh giá nào'}
          </Typography>
          {isFilterActive && (
            <Button size="small" onClick={handleResetFilters} sx={{ mt: 1 }}>
              Xoá bộ lọc
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {reviews.map((review) => (
            <Box key={review.id} sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={review.userAvatarUrl || undefined} sx={{ bgcolor: 'primary.main' }}>
                  {review.userName?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography fontWeight={600}>{review.userName}</Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(review.createdAt)}
                  </Typography>
                  {review.title && (
                    <Typography fontWeight={500} sx={{ mt: 1 }}>{review.title}</Typography>
                  )}
                  {review.comment && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{review.comment}</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            <IconButton onClick={handleCloseDialog}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography gutterBottom>Đánh giá của bạn</Typography>
            <Rating
              value={formRating}
              onChange={(_, value) => setFormRating(value || 5)}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            label="Tiêu đề (tùy chọn)"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="VD: Sự kiện tuyệt vời!"
          />

          <TextField
            fullWidth
            label="Nội dung đánh giá (tùy chọn)"
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            multiline
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? 'Đang gửi...' : editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReviewSection;