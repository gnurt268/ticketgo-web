import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCities, selectCities } from '../eventsSlice';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Pagination,
  Chip,
  Button,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  LocationOn,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import eventAPI from '../eventAPI';
import { EventCard, EventCardSkeleton } from '../components';

// Filter options
const SORT_OPTIONS = [
  { value: 'startDate,asc', label: 'Ngày diễn ra (Sớm nhất)' },
  { value: 'startDate,desc', label: 'Ngày diễn ra (Muộn nhất)' },
  { value: 'title,asc', label: 'Tên A-Z' },
  { value: 'title,desc', label: 'Tên Z-A' },
];

const CATEGORIES = [
  { value: '', label: 'Tất cả danh mục' },
  { value: '1', label: 'Nhạc sống' },
  { value: '2', label: 'Sân khấu & Nghệ thuật' },
  { value: '3', label: 'Thể thao' },
  { value: '4', label: 'Khác' },
];

const EventListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const cities = useSelector(selectCities);

  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  // Get params from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const keyword = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const sortBy = searchParams.get('sort') || 'startDate,asc';
  const featured = searchParams.get('featured') || '';

  // Local filter state
  const [searchInput, setSearchInput] = useState(keyword);

  // Fetch cities (cached in Redux — only fetches once across the app)
  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);

  // Fetch events when params change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const [sortField, sortDirection] = sortBy.split(',');
        const params = {
          page: currentPage - 1,
          size: 12,
          sortBy: sortField,
          sortDirection: sortDirection || 'asc',
          ...(keyword && { keyword }),
          ...(categoryId && { categoryId }),
          ...(city && { city }),
          ...(featured && { isFeatured: true }),
        };

        const response = await eventAPI.getEvents(params);
        setEvents(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage, keyword, categoryId, city, sortBy, featured]);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  // Update URL params
  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset page when filters change (except when changing page itself)
    if (!('page' in newParams)) {
      params.set('page', '1');
    }

    setSearchParams(params);
  };

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleCategoryChange = (e) => {
    updateParams({ category: e.target.value });
  };

  const handleCityChange = (e) => {
    updateParams({ city: e.target.value });
  };

  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value });
  };

  const handlePageChange = (_, page) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  // Check if any filter is active
  const hasActiveFilters = keyword || categoryId || city || featured;

  // Get active filter labels
  const getActiveFilterLabels = () => {
    const labels = [];
    if (keyword) labels.push(`Tìm: "${keyword}"`);
    if (categoryId) {
      const cat = CATEGORIES.find(c => c.value === categoryId);
      if (cat) labels.push(cat.label);
    }
    if (city) labels.push(city);
    if (featured) labels.push('Nổi bật');
    return labels;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)',
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            Khám phá sự kiện
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Tìm kiếm và đặt vé cho các sự kiện hấp dẫn nhất
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Search & Filters */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          {/* Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ display: 'flex', gap: 2, mb: 2 }}
          >
            <TextField
              fullWidth
              placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchInput('')}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ px: 4, borderRadius: 2 }}
            >
              Tìm kiếm
            </Button>
            <Button
              variant="outlined"
              startIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              Bộ lọc
            </Button>
          </Box>

          {/* Filters */}
          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={categoryId}
                    label="Danh mục"
                    onChange={handleCategoryChange}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Thành phố</InputLabel>
                  <Select
                    value={city}
                    label="Thành phố"
                    onChange={handleCityChange}
                  >
                    <MenuItem value="">Tất cả thành phố</MenuItem>
                    {cities.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sắp xếp</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sắp xếp"
                    onChange={handleSortChange}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>

          {/* Active Filters */}
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                Đang lọc:
              </Typography>
              {getActiveFilterLabels().map((label, index) => (
                <Chip
                  key={index}
                  label={label}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={clearAllFilters}
                sx={{ ml: 1 }}
              >
                Xóa tất cả
              </Button>
            </Box>
          )}
        </Paper>

        {/* Results Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {loading ? (
              <Skeleton width={150} />
            ) : (
              `Tìm thấy ${totalElements} sự kiện`
            )}
          </Typography>
        </Box>

        {/* Events Grid */}
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                  <EventCardSkeleton />
                </Grid>
              ))
            : events.map((event) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={event.id}>
                  <EventCard event={event} />
                </Grid>
              ))}
        </Grid>

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              px: 3,
            }}
          >
            <CalendarMonth sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy sự kiện nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </Typography>
            <Button variant="outlined" onClick={clearAllFilters}>
              Xóa bộ lọc
            </Button>
          </Box>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 500,
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default EventListPage;