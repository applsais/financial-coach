import { configureStore } from '@reduxjs/toolkit'
import transactionsReducer from './transactionsSlice'
import generalFeedbackReducer from './generalFeedbackSlice'
import trendsReducer from './trendsSlice'

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    generalFeedback: generalFeedbackReducer,
    trends: trendsReducer,
  },
})
