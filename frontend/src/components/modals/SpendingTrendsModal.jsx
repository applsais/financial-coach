import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTrends } from '../../store/trendsSlice'

function SpendingTrendsModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { calculated_trends, budget_plan, summary, loading, error } = useSelector((state) => state.trends)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchTrends())
    }
  }, [isOpen, dispatch])

  const getTrendColor = (trend) => {
    if (trend === 'increasing') return 'text-red-600'
    if (trend === 'decreasing') return 'text-green-600'
    return 'text-gray-600'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Spending Trends & Budget Plan</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
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

          {!loading && !error && (
            <>
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-1">Avg Monthly Income</div>
                    <div className="text-3xl font-bold text-green-900">{formatCurrency(summary.avg_monthly_income)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <div className="text-sm text-orange-700 font-medium mb-1">Avg Monthly Expenses</div>
                    <div className="text-3xl font-bold text-orange-900">{formatCurrency(summary.avg_monthly_expenses)}</div>
                  </div>
                </div>
              )}

              {/* Budget Recommendations Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Budget Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budget_plan.map((item, index) => (
                    <div key={index} className="bg-white border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <h4 className="font-bold text-gray-900">{item.category}</h4>
                            <span className={`text-xs font-medium ${getTrendColor(item.trend)}`}>
                              {item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Recommended Budget</div>
                          <div className="text-xl font-bold text-purple-600">{formatCurrency(item.budget_amount)}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated Trends Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  All Category Trends
                </h3>
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trend
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          First Month
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Latest Month
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...calculated_trends]
                        .sort((a, b) => {
                          // Sort by trend type: increasing first, then decreasing, then stable
                          const trendOrder = { increasing: 0, decreasing: 1, stable: 2 }
                          return trendOrder[a.trend] - trendOrder[b.trend]
                        })
                        .map((trend, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{trend.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trend.trend === 'increasing' ? 'bg-red-100 text-red-800' :
                              trend.trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                            {formatCurrency(trend.first_value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(trend.last_value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                            {formatCurrency(trend.average)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Footer */}
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> These budget recommendations are based on your spending patterns and income.
                  Adjust them according to your personal financial goals and priorities.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpendingTrendsModal
