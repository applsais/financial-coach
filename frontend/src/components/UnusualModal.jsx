function UnusualModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-900">Unusual Activity Detection</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6">Our AI monitors your spending patterns to detect unusual activity and potential anomalies.</p>

          <div className="space-y-4">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <h3 className="font-semibold text-orange-900 mb-2">What We Monitor:</h3>
              <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                <li>Sudden spikes in spending compared to your average</li>
                <li>Transactions from unusual merchants or locations</li>
                <li>Multiple large purchases in a short timeframe</li>
                <li>Charges that deviate from your typical patterns</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Activity Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">No unusual activity detected in the last 30 days</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">Coming Soon:</h3>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                <li>Real-time email/SMS alerts for suspicious transactions</li>
                <li>Customizable spending thresholds</li>
                <li>Category-specific anomaly detection</li>
                <li>Comparison with similar user spending patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnusualModal
