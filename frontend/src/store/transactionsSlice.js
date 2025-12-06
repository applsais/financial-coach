import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = 'http://localhost:8000'

// Async thunks for API calls
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (expensesOnly = true) => {
    const response = await fetch(`${API_URL}/api/transactions?expenses_only=${expensesOnly}`)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    return response.json()
  }
)

export const fetchSummary = createAsyncThunk(
  'transactions/fetchSummary',
  async () => {
    const response = await fetch(`${API_URL}/api/transactions/summary`)
    if (!response.ok) throw new Error('Failed to fetch summary')
    return response.json()
  }
)

export const fetchForecast = createAsyncThunk(
  'transactions/fetchForecast',
  async () => {
    const response = await fetch(`${API_URL}/api/forecast/monthly`)
    if (!response.ok) throw new Error('Failed to fetch forecast')
    return response.json()
  }
)

export const checkDataExists = createAsyncThunk(
  'transactions/checkDataExists',
  async (_, { getState }) => {
    const state = getState()

    if (state.transactions.transactions.length > 0) {
      return { has_data: true }
    }

    // If not in store, check API
    const response = await fetch(`${API_URL}/api/transactions/exists`)
    if (!response.ok) throw new Error('Failed to check data')
    return response.json()
  }
)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    summary: null,
    forecast: null,
    hasData: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(fetchSummary.pending, (state) => {
        state.error = null
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.error = action.error.message
      })

      .addCase(fetchForecast.fulfilled, (state, action) => {
        state.forecast = action.payload
      })
      .addCase(fetchForecast.rejected, (state, action) => {
        state.error = action.error.message
      })

      .addCase(checkDataExists.fulfilled, (state, action) => {
        state.hasData = action.payload.has_data
      })
  },
})

export const { clearError } = transactionsSlice.actions
export default transactionsSlice.reducer
