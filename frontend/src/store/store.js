import { configureStore } from '@reduxjs/toolkit'
import transactionsReducer from './transactionsSlice'
import generalFeedbackReducer from './generalFeedbackSlice'

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    generalFeedback: generalFeedbackReducer,
  },
})
