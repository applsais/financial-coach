import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkDataExists } from './store/transactionsSlice'
import './App.css'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'

function App() {
  const dispatch = useDispatch()
  const { hasData } = useSelector((state) => state.transactions)
  const [currentScreen, setCurrentScreen] = useState('loading') // 'loading', 'onboarding', or 'dashboard'
  const [uploadResult, setUploadResult] = useState(null)

  useEffect(() => {
    // Check if data exists (checks Redux store first, then API if needed)
    dispatch(checkDataExists())
  }, [dispatch])

  useEffect(() => {
    // Update screen based on hasData from Redux
    if (currentScreen === 'loading') {
      setCurrentScreen(hasData ? 'dashboard' : 'onboarding')
    }
  }, [hasData, currentScreen])

  const handleUploadComplete = (result) => {
    setUploadResult(result)
    setCurrentScreen('dashboard')
  }

  const handleUploadMore = () => {
    setUploadResult(null)
    setCurrentScreen('onboarding')
  }

  const handleGoToDashboard = () => {
    setCurrentScreen('dashboard')
  }

  if (currentScreen === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading Financial Coach...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentScreen === 'onboarding' ? (
        <Onboarding onComplete={handleUploadComplete} onGoToDashboard={handleGoToDashboard} />
      ) : (
        <Dashboard uploadResult={uploadResult} onUploadMore={handleUploadMore} />
      )}
    </>
  )
}

export default App
