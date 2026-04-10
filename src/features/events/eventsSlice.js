import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventAPI from './eventAPI';

export const fetchCities = createAsyncThunk(
  'events/fetchCities',
  async (_, { getState, rejectWithValue }) => {
    const { cities } = getState().events;
    if (cities.length > 0) return cities;
    try {
      const response = await eventAPI.getAvailableCities();
      return response.data || [];
    } catch (error) {
      return rejectWithValue('Không thể tải danh sách thành phố');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    cities: [],
    citiesLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.citiesLoading = true;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.citiesLoading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state) => {
        state.citiesLoading = false;
      });
  },
});

export const selectCities = (state) => state.events.cities;
export const selectCitiesLoading = (state) => state.events.citiesLoading;

export default eventsSlice.reducer;
