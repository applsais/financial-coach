import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTransactions, fetchSummary, fetchForecast, deleteAllTransactions } from '../store/transactionsSlice'
import Table from './Table'
import Trends from './Trends'
import UnusualModal from './modals/UnusualModal'
import RecommendationsModal from './modals/RecommendationsModal'
import SpendingTrendsModal from './modals/SpendingTrendsModal'
import ExploreModal from './modals/ExploreModal'
import { formatCurrency } from '../utils'

function Dashboard({ uploadResult, onUploadMore }) {
  const dispatch = useDispatch()
  
  const { transactions, summary, forecast, loading } = useSelector((state) => state.transactions)
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


  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to finish your session?')) {
      return
    }

    try {
      await dispatch(deleteAllTransactions()).unwrap()
      // Redirect to home page after deletion
      const currentUrl = window.location.href;
      window.location.replace(currentUrl);
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
                                            Math.abs(forecast.forecast.predicted_income) -
                                            Math.abs(forecast.forecast.predicted_expenses)
                                        )}
                                    </span>
                                </li>
                            </ul>
                        </div>
                        ) : (
                            <>
                            <p className="text-sm font-semibold text-blue-800 leading-none">Next Month Predictions</p>
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                            </>
                        )}
                    </div>
                    </div>
                </div>

                <div
                    onClick={() => setActiveModal('trends')}
                    className="bg-green-50 border-l-4 border-green-500 p-4 rounded cursor-pointer hover:bg-green-100 transition-colors">
                    <div className="flex items-start">
                    <div className="text-2xl mr-3 leading-none">📈</div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 leading-none">Spending Trends</p>
                        <p className="text-xs text-green-600 mt-1">Click to view budget recommendations & trends</p>
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

                <div
                    onClick={() => setActiveModal('explore')}
                    className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded cursor-pointer hover:bg-indigo-100 transition-colors">
                    <div className="flex items-start">
                    <div className="text-2xl mr-3 leading-none">🗺️</div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-indigo-800 leading-none">Explore Places</p>
                        <p className="text-xs text-indigo-600 mt-1">Discover affordable dining & grocery options nearby</p>
                    </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Transactions</h2>
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

        <SpendingTrendsModal
          isOpen={activeModal === 'trends'}
          onClose={() => setActiveModal(null)}
        />

        <ExploreModal
          isOpen={activeModal === 'explore'}
          onClose={() => setActiveModal(null)}
        />

      </div>
    </div>
  )
}

export default Dashboard
