import { useState, useEffect } from 'react'
import Table from './Table'

function Dashboard({ uploadResult, onUploadMore }) {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(true)

  useEffect(() => {
    fetchTransactions()
    fetchSummary()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/transactions/summary')
      if (!response.ok) throw new Error('Failed to fetch summary')
      const data = await response.json()
      setSummary(data)
    } catch (err) {
      console.error('Error fetching summary:', err)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/transactions/all', {
        method: 'DELETE',
      })

      if (response.ok) {
        // Redirect to onboarding after deletion
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
              Delete All Data
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {summary.total_transactions}
                  </div>
                </div>
                <div className="text-4xl">📝</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Spent</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(summary.total_amount)}
                  </div>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>


            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-lime-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Date Range</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {summary.date_range?.start && formatDate(summary.date_range.start)}
                    <div className="text-xs text-gray-500">to</div>
                    {summary.date_range?.end && formatDate(summary.date_range.end)}
                  </div>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
            <button
              onClick={fetchTransactions}
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

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">🎯</div>
              <h3 className="font-bold text-gray-800">AI Insights</h3>
            </div>
            <p className="text-sm text-gray-600">Coming soon: Get personalized spending insights powered by AI</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">📈</div>
              <h3 className="font-bold text-gray-800">Trends</h3>
            </div>
            <p className="text-sm text-gray-600">Coming soon: Visualize your spending patterns over time</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">💡</div>
              <h3 className="font-bold text-gray-800">Recommendations</h3>
            </div>
            <p className="text-sm text-gray-600">Coming soon: Get smart tips to improve your finances</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
