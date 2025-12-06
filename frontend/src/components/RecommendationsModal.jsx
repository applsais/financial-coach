function RecommendationsModal({ isOpen, onClose, summary }) {
  if (!isOpen) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6">AI-powered insights to help you optimize your spending and reach your financial goals.</p>

          <div className="space-y-4">
            {summary && (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-semibold text-purple-900 mb-2">Based on Your Spending:</h3>
                <ul className="list-disc list-inside text-sm text-purple-800 space-y-2">
                  <li>You're spending {formatCurrency(summary.total_expenses)} per month on expenses</li>
                  <li>Average transaction: {formatCurrency(summary.average_expense)}</li>
                  <li>Net income after expenses: {formatCurrency(summary.total_income - summary.total_expenses)}</li>
                </ul>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-900 mb-3">Smart Recommendations:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">💡</span>
                  <div>
                    <p className="font-medium text-green-900">Review Your Subscriptions</p>
                    <p className="text-sm text-green-700">Check for unused or duplicate subscriptions that could be cancelled</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">💡</span>
                  <div>
                    <p className="font-medium text-green-900">Set Category Budgets</p>
                    <p className="text-sm text-green-700">Create spending limits for high-expense categories</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">💡</span>
                  <div>
                    <p className="font-medium text-green-900">Track Spending Trends</p>
                    <p className="text-sm text-green-700">Monitor month-over-month changes to identify spending patterns</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">Coming Soon:</h3>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                <li>AI-generated personalized savings goals</li>
                <li>Automatic categorization improvements</li>
                <li>Spending vs. income ratio analysis</li>
                <li>Investment opportunity suggestions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendationsModal
