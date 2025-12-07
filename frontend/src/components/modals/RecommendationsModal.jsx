import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGeneralFeedback } from '../../store/generalFeedbackSlice'

function RecommendationsModal({ isOpen, onClose, summary }) {
  const dispatch = useDispatch()
  const { feedback, loading, error } = useSelector((state) => state.generalFeedback)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchGeneralFeedback())
    }
  }, [isOpen, dispatch])

  const getIcon = (type) => {
    return type === 'positive' ? '✨' : '💡'
  }

  const getStyles = (type) => {
    if (type === 'positive') {
      return {
        container: 'bg-green-50 border-l-4 border-green-500',
        title: 'text-green-900',
        message: 'text-green-700'
      }
    }
    return {
      container: 'bg-blue-50 border-l-4 border-blue-500',
      title: 'text-blue-900',
      message: 'text-blue-700'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-2xl font-bold text-gray-900">AI Financial Insights</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">Personalized insights to help you optimize your spending and reach your financial goals.</p>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {!loading && !error && feedback.length === 0 && (
            <div className="bg-gray-50 p-4 rounded text-center text-gray-600">
              No feedback available yet. Upload some transactions to get started!
            </div>
          )}

          {!loading && !error && feedback.length > 0 && (
            <div className="space-y-4">
              {feedback.map((item, index) => {
                const styles = getStyles(item.type)
                return (
                  <div key={index} className={`${styles.container} p-4 rounded`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getIcon(item.type)}</span>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${styles.title} mb-1`}>
                          {item.title}
                        </h3>
                        <p className={`text-sm ${styles.message}`}>
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecommendationsModal
