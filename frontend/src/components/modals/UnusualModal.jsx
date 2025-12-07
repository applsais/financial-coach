import { useState, useEffect } from 'react'
import {formatCurrency} from '../../utils'

function UnusualModal({ isOpen, onClose }) {
  const [fraudData, setFraudData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchFraudDetections()
    }
  }, [isOpen])

  const fetchFraudDetections = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/api/fraud-detections')
      if (!response.ok) {
        throw new Error('Failed to fetch fraud detections')
      }
      const data = await response.json()
      setFraudData(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching fraud detections:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getSeverityColor = (score) => {
    const absScore = Math.abs(score)
    if (absScore > 0.4) return 'text-red-600 bg-red-50'
    if (absScore > 0.3) return 'text-orange-600 bg-orange-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  const getSeverityLabel = (score) => {
    const absScore = Math.abs(score)
    if (absScore > 0.4) return 'Severe'
    return 'Mild'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-900">Fraud Detection Results</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6">Our AI analyzes your spending patterns to detect unusual activity and potential fraud.</p>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {!loading && !error && fraudData.length === 0 && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800">No unusual activity detected</span>
              </div>
            </div>
          )}

          {!loading && !error && fraudData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fraudData.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.merchant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && fraudData.length > 0 && (
            <div className="mt-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <h3 className="font-semibold text-orange-900 mb-2">                This report is generated by AI and does not confirm fraud. Please use it with caution.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UnusualModal
