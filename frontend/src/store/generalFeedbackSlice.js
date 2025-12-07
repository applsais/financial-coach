import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = 'http://localhost:8000'

export const fetchGeneralFeedback = createAsyncThunk(
  'generalFeedback/fetchGeneralFeedback',
  async (_, { getState }) => {
    const state = getState()

    if (state.generalFeedback.feedback.length > 0) {
      return {
        feedback: state.generalFeedback.feedback,
        summary: state.generalFeedback.summary,
        fromCache: true
      }
    }

    const response = await fetch(`${API_URL}/api/general-feedback`)
    if (!response.ok) throw new Error('Failed to fetch feedback')
    return response.json()
  }
)

const generalFeedbackSlice = createSlice({
  name: 'generalFeedback',
  initialState: {
    feedback: [],
    summary: null,
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
      .addCase(fetchGeneralFeedback.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGeneralFeedback.fulfilled, (state, action) => {
        state.loading = false
        state.feedback = action.payload.feedback || []
        state.summary = action.payload.summary || null
      })
      .addCase(fetchGeneralFeedback.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { clearError } = generalFeedbackSlice.actions
export default generalFeedbackSlice.reducer
