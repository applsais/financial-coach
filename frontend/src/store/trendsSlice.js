import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = 'http://localhost:8000'

// Async thunk for API call with caching check
export const fetchTrends = createAsyncThunk(
  'trends/fetchTrends',
  async (_, { getState }) => {
    const state = getState()

    // If we already have trends cached, skip the API call
    if (state.trends.budget_plan.length > 0) {
      return {
        calculated_trends: state.trends.calculated_trends,
        budget_plan: state.trends.budget_plan,
        summary: state.trends.summary,
        fromCache: true
      }
    }

    // Otherwise, fetch from API
    const response = await fetch(`${API_URL}/api/general-feedback-trends`)
    if (!response.ok) throw new Error('Failed to fetch trends')
    return response.json()
  }
)

const trendsSlice = createSlice({
  name: 'trends',
  initialState: {
    calculated_trends: [],
    budget_plan: [],
    summary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearTrends: (state) => {
      state.calculated_trends = []
      state.budget_plan = []
      state.summary = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrends.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.loading = false
        state.calculated_trends = action.payload.calculated_trends || []
        state.budget_plan = action.payload.budget_plan || []
        state.summary = action.payload.summary || null
      })
      .addCase(fetchTrends.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { clearError, clearTrends } = trendsSlice.actions
export default trendsSlice.reducer
