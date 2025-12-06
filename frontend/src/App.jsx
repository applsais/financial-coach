import { useState, useEffect } from 'react'
import './App.css'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'

function App() {
  const [currentScreen, setCurrentScreen] = useState('loading') // 'loading', 'onboarding', or 'dashboard'
  const [uploadResult, setUploadResult] = useState(null)

  useEffect(() => {
    checkExistingData()
  }, [])

  const checkExistingData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/transactions/exists')
      const data = await response.json()

      if (data.has_data) {
        setCurrentScreen('dashboard')
      } else {
        setCurrentScreen('onboarding')
      }
    } catch (error) {
      console.error('Error checking for existing data:', error)
      // Default to onboarding if there's an error
      setCurrentScreen('onboarding')
    }
  }

  const handleUploadComplete = (result) => {
    setUploadResult(result)
    setCurrentScreen('dashboard')
  }

  const handleUploadMore = () => {
    setUploadResult(null)
    setCurrentScreen('onboarding')
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
        <Onboarding onComplete={handleUploadComplete} />
      ) : (
        <Dashboard uploadResult={uploadResult} onUploadMore={handleUploadMore} />
      )}
    </>
  )
}

export default App
