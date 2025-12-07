import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { checkDataExists } from '../store/transactionsSlice'

function Onboarding({ onComplete, onGoToDashboard }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const hasExistingData = useSelector((state) => state.transactions.hasData)

  // Check if data already exists in Redux store
  useEffect(() => {
    dispatch(checkDataExists())
  }, [dispatch])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid CSV file')
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      setError(null)

      const response = await fetch('http://localhost:8000/api/transactions/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const result = await response.json()

      // Call onComplete to transition to dashboard
      onComplete(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen w-full  flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
 
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">💰</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Financial Coach
          </h1>
          <p className="text-xl text-gray-600">
            Upload your transactions and let AI transform your financial data into actionable insights
          </p>
          <p className="mt-2 text-lg font-semibold text-gray-700">
            We never store or share your sensitive data.
          </p>
          {hasExistingData && (
            <button
              onClick={onGoToDashboard}
              className="mt-6 inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </button>
          )}
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Get Started</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <input
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor="fileInput"
              className="cursor-pointer inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Choose CSV File
            </label>

            {file && (
              <div className="mt-6">
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium text-gray-900">{file.name}</span>
                </p>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-md text-lg"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload & Continue'
              )}
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* CSV Format Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">CSV Format Requirements:</h3>
            <p className="text-sm text-blue-700">
              Your CSV file should contain the following columns:
              <code className="block mt-2 bg-blue-100 p-2 rounded font-mono text-xs">
                date, merchant, amount, description
              </code>
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Example: 2025-02-02, Starbucks #4432, 5.89, POS purchase
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-sm text-gray-600 font-medium">AI-Powered Insights</p>
          </div>
          <div>
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-600 font-medium">Smart Analytics</p>
          </div>
          <div>
            <div className="text-3xl mb-2">💡</div>
            <p className="text-sm text-gray-600 font-medium">Personalized Tips</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
