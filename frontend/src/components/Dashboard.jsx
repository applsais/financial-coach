import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTransactions, fetchSummary, fetchForecast } from '../store/transactionsSlice'
import Table from './Table'
import Trends from './Trends'
import UnusualModal from './modals/UnusualModal'
import RecommendationsModal from './modals/RecommendationsModal'

function Dashboard({ uploadResult, onUploadMore }) {
  const dispatch = useDispatch()
  const { transactions, summary, forecast, loading } = useSelector((state) => state.transactions)
  const [showSuccessMessage, setShowSuccessMessage] = useState(true)
  const [activeModal, setActiveModal] = useState(null)

  useEffect(() => {
    dispatch(fetchTransactions(true))
    dispatch(fetchSummary())
    dispatch(fetchForecast())
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(fetchTransactions(true))
    dispatch(fetchSummary())
    dispatch(fetchForecast())
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to finish your session?')) {
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/transactions/all', {
        method: 'DELETE',
      })

      if (response.ok) {
        onUploadMore()
      }
    } catch (err) {
      console.error('Error deleting transactions:', err)
      alert('Failed to delete transactions')
    }
  }

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Financial Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's your financial overview
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteAll}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              Finish Session
            </button>
            <button
              onClick={onUploadMore}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              Upload More Data
            </button>
          </div>
        </div>

        {/* Success Message */}
        {uploadResult && showSuccessMessage && (
          <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">{uploadResult.message}</p>
                  <p className="text-sm text-green-600 mt-1">
                    Total Amount: {formatCurrency(uploadResult.total_amount)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="flex-shrink-0 ml-4 inline-flex text-green-400 hover:text-green-600 focus:outline-none"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {summary && summary.total_transactions > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(summary.total_expenses)}
                  </div>
                </div>
                <div className="text-4xl">💸</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Income</div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(summary.total_income)}
                  </div>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Net Income</div>
                  <div className="text-3xl font-bold text-orange-600">
                    {formatCurrency(summary.total_income - summary.total_expenses)}
                  </div>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Expense Transactions</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {summary.total_transactions}
                  </div>
                </div>
                <div className="text-4xl">📝</div>
              </div>
            </div>
          </div>
        )}


        {/* Trends and Insights Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trends Card - 2/3 width */}
          <div className="lg:col-span-2">
            <Trends transactions={transactions} />
          </div>

          {/* Insights Card - 1/3 width */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Insights</h2>
            <div className="space-y-4">
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-sm">
                    <div className="flex items-start">
                    <div className="text-2xl mr-3 leading-none">🔮</div>
                    <div className="flex-1">
                        {forecast && forecast.forecast ? (
                        <div>
                            <p className="text-sm font-semibold text-blue-800 mb-2 leading-none">
                                Next Month Predictions
                            </p>

                            <ul className="text-xs text-blue-600 space-y-1 mt-2">
                                <li>
                                    <span className="font-semibold">Predicted Expenses:</span>{" "}
                                    <span className="font-bold">
                                        {formatCurrency(Math.abs(forecast.forecast.predicted_expenses))}
                                    </span>
                                </li>

                                <li>
                                    <span className="font-semibold">Predicted Income:</span>{" "}
                                    <span className="font-bold">
                                        {formatCurrency(Math.abs(forecast.forecast.predicted_income))}
                                    </span>
                                </li>

                                <li>
                                    <span className="font-semibold">Predicted Net Income:</span>{" "}
                                    <span className="font-bold">
                                        {formatCurrency(
                                            forecast.forecast.predicted_income -
                                            forecast.forecast.predicted_expenses
                                        )}
                                    </span>
                                </li>
                            </ul>
                        </div>
                        ) : (
                            <>
                            <p className="text-sm font-semibold text-blue-800 leading-none">Next Month Predictions</p>
                            <p className="text-xs text-blue-600 mt-1 italic">No forecast available</p>
                            </>
                        )}
                    </div>
                    </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex items-start">
                    <div className="text-2xl mr-3 leading-none">📈</div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 leading-none">Spending Trends</p>
                        <p className="text-xs text-green-600 mt-1">AI will analyze your month-over-month changes</p>
                    </div>
                    </div>
                </div>

                <div
                    onClick={() => setActiveModal('unusual')}
                    className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded cursor-pointer hover:bg-orange-100 transition-colors">
                    <div className="flex items-start">
                    <div className="text-2xl mr-3 leading-none">⚠️</div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-800 leading-none">Unusual Activity</p>
                        <p className="text-xs text-orange-600 mt-1">Click to view spending alerts</p>
                    </div>
                    </div>
                </div>

                <div
                    onClick={() => setActiveModal('recommendations')}
                    className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded cursor-pointer hover:bg-purple-100 transition-colors">
                    <div className="flex items-start">
                    <div className="text-2xl mr-3 leading-none">🎯</div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-800 leading-none">Recommendations</p>
                        <p className="text-xs text-purple-600 mt-1">Click for personalized tips and feedback!</p>
                    </div>
                    </div>
                </div>

                <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                    <div className="flex items-start">
                    <div className="text-2xl mr-3 leading-none">💰</div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-teal-800 leading-none">Savings Opportunities</p>
                        <p className="text-xs text-teal-600 mt-1">Discover ways to reduce expenses</p>
                    </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
            <button
            onClick={handleRefresh}
            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center"
            >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
            </button>
        </div>

        <Table transactions={transactions} loading={loading} />
        </div>

        {/* Modals */}
        <UnusualModal
          isOpen={activeModal === 'unusual'}
          onClose={() => setActiveModal(null)}
        />

        <RecommendationsModal
          isOpen={activeModal === 'recommendations'}
          onClose={() => setActiveModal(null)}
          summary={summary}
        />

      </div>
    </div>
  )
}

export default Dashboard
