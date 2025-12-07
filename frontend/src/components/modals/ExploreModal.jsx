import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'

function ExploreModal({ isOpen, onClose }) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const transactions = useSelector((state) => state.transactions.transactions)

  const categories = [
    { value: 'all', label: 'All Places', icon: '🗺️' },
    { value: 'fast_food', label: 'Fast Food', icon: '🍔' },
    { value: 'restaurants', label: 'Restaurants', icon: '🍽️' },
    { value: 'grocery', label: 'Grocery Stores', icon: '🛒' },
    { value: 'convenience', label: 'Convenience Stores', icon: '🏪' },
    { value: 'health', label: 'Health Stores', icon: '💊' },
    { value: 'general', label: 'General Stores', icon: '🏬' },
    { value: 'gym', label: 'Gyms & Fitness', icon: '💪' },
  ]

  const topSpendingCategories = useMemo(() => { //Optimization. Would migrate to redux in the future
    if (!transactions || transactions.length === 0) return []

    const categorySpending = {}

    transactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const category = transaction.category || 'Other'
        const amount = Math.abs(transaction.amount)

        if (!categorySpending[category]) {
          categorySpending[category] = 0
        }
        categorySpending[category] += amount
      }
    })


    return Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
  }, [transactions])

  useEffect(() => {
    if (isOpen) {
      fetchNearbyPlaces()
    }
  }, [isOpen, selectedCategory])

  const buildQuery = (latitude, longitude, category) => {
    let queryParts = []

    if (category === 'all' || category === 'fast_food') {
      queryParts.push(`node["amenity"="fast_food"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["amenity"="street_food"](around:2000, ${latitude}, ${longitude});`)
    }

    if (category === 'all' || category === 'restaurants') {
      queryParts.push(`node["amenity"="restaurant"]["cheap"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["amenity"="restaurant"]["price"="cheap"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["amenity"="restaurant"]["price"="low"](around:2000, ${latitude}, ${longitude});`)
    }

    if (category === 'all' || category === 'grocery') {
      queryParts.push(`node["shop"="supermarket"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["shop"="greengrocer"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["shop"="grocery"](around:2000, ${latitude}, ${longitude});`)
    }

    if (category === 'all' || category === 'convenience') {
      queryParts.push(`node["shop"="convenience"](around:2000, ${latitude}, ${longitude});`)
    }

    if (category === 'all' || category === 'health') {
      queryParts.push(`node["shop"="health_food"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["shop"="herbalist"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["shop"="nutrition_supplements"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["amenity"="pharmacy"](around:2000, ${latitude}, ${longitude});`)
    }

    if (category === 'all' || category === 'general') {
      queryParts.push(`node["shop"="general"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["shop"="department_store"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["shop"="variety_store"](around:2000, ${latitude}, ${longitude});`)
    }

    if (category === 'all' || category === 'gym') {
      queryParts.push(`node["leisure"="fitness_centre"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["leisure"="sports_centre"](around:2000, ${latitude}, ${longitude});`)
      queryParts.push(`node["amenity"="gym"](around:2000, ${latitude}, ${longitude});`)
    }

    return `
      [out:json];
      (
        ${queryParts.join('\n        ')}
      );
      out tags center;
    `
  }

  const fetchNearbyPlaces = () => {
    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ latitude, longitude })

        try {
          const query = buildQuery(latitude, longitude, selectedCategory)

          const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query)
          const res = await fetch(url)
          const data = await res.json()

          const placesData = data.elements.map((el) => {
            const t = el.tags || {}
            return {
              name: t.name || "Unnamed Place",
              type: t.amenity || t.shop || "Unknown",
              lat: el.lat || el.center?.lat,
              lon: el.lon || el.center?.lon,

              website:
                t.website ||
                t["contact:website"] ||
                t.url ||
                t["contact:facebook"] ||
                t["contact:instagram"] ||
                null,
            }
          })

          setPlaces(placesData)
          setLoading(false)
        } catch (err) {
          console.error('Error fetching places:', err)
          setError('Failed to fetch nearby places')
          setLoading(false)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setError('Unable to get your location. Please enable location services.')
        setLoading(false)
      }
    )
  }

  const getCategoryIcon = (type) => {
    if (type === 'fast_food' || type === 'street_food') return '🍔'
    if (type === 'restaurant') return '🍽️'
    if (type === 'supermarket') return '🛒'
    if (type === 'convenience') return '🏪'
    if (type === 'grocery' || type === 'greengrocer') return '🥬'
    if (type === 'health_food' || type === 'herbalist' || type === 'nutrition_supplements') return '💊'
    if (type === 'pharmacy') return '⚕️'
    if (type === 'general' || type === 'department_store' || type === 'variety_store') return '🏬'
    if (type === 'fitness_centre' || type === 'sports_centre' || type === 'gym') return '💪'
    return '📍'
  }

  const getCategoryLabel = (type) => {
    if (type === 'fast_food') return 'Fast Food'
    if (type === 'street_food') return 'Street Food'
    if (type === 'restaurant') return 'Restaurant'
    if (type === 'supermarket') return 'Supermarket'
    if (type === 'convenience') return 'Convenience Store'
    if (type === 'grocery') return 'Grocery'
    if (type === 'greengrocer') return 'Greengrocer'
    if (type === 'health_food') return 'Health Food Store'
    if (type === 'herbalist') return 'Herbalist'
    if (type === 'nutrition_supplements') return 'Nutrition Supplements'
    if (type === 'pharmacy') return 'Pharmacy'
    if (type === 'general') return 'General Store'
    if (type === 'department_store') return 'Department Store'
    if (type === 'variety_store') return 'Variety Store'
    if (type === 'fitness_centre') return 'Fitness Centre'
    if (type === 'sports_centre') return 'Sports Centre'
    if (type === 'gym') return 'Gym'
    return type
  }

  const openInMaps = (lat, lon, name) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
    window.open(url, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <h2 className="text-2xl font-bold text-gray-900">Explore Nearby Places</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">Discover affordable dining and grocery options near you!</p>

          {topSpendingCategories.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                💡 Your top spending categories
              </p>
              <div className="flex flex-wrap gap-2">
                {topSpendingCategories.map((item, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                  >
                    📊 {item.category} - ${item.amount.toFixed(0)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && places.length === 0 && (
            <div className="bg-gray-50 p-8 rounded text-center text-gray-600">
              <p className="text-lg mb-2">No places found nearby</p>
              <p className="text-sm">Try allowing location access or check back later.</p>
            </div>
          )}

          {!loading && !error && places.length > 0 && (
            <>
              <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-800">
                  <strong>📍 Found {places.length} places</strong> near you
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {places.map((place, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-indigo-300 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getCategoryIcon(place.type)}</span>
                        <div>
                          <h3 className="font-bold text-gray-900">{place.name}</h3>
                          <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full mt-1">
                            {getCategoryLabel(place.type)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => openInMaps(place.lat, place.lon, place.name)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Directions
                      </button>
                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExploreModal
