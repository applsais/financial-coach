import { useState, useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function Trends({ transactions }) {
  const [viewType, setViewType] = useState('category') // 'category' or 'date'
  const [selectedMonth, setSelectedMonth] = useState('all') // 'all' or specific month like '2024-12'

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(value))
  }

  // Get available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set()
    transactions.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.add(monthKey)
    })
    return Array.from(months).sort().reverse() // Most recent first
  }, [transactions])

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions

    return transactions.filter(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      return monthKey === selectedMonth
    })
  }, [transactions, selectedMonth])

  // Optimization to prevent re-render
  const categoryData = useMemo(() => {
    const categoryTotals = {}
    filteredTransactions.forEach(t => {
      const category = t.category || 'Miscellaneous'
      const amount = Math.abs(t.amount)
      categoryTotals[category] = (categoryTotals[category] || 0) + amount
    })

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTransactions])

  const dateData = useMemo(() => {
    const monthlyTotals = {}
    filteredTransactions.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { name: monthName, value: 0, key: monthKey }
      }
      monthlyTotals[monthKey].value += Math.abs(t.amount)
    })

    return Object.values(monthlyTotals).sort((a, b) => a.key.localeCompare(b.key))
  }, [filteredTransactions])

  // Format month for display
  const formatMonthDisplay = (monthKey) => {
    if (monthKey === 'all') return 'All Time'
    const [year, month] = monthKey.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }


  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#8808eaff', '#84cc16', '#0f301bff', '#d5ee11ff', '#14b8a6', '#06b6d4', '#0ea5e9']

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-green-600 font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available for trends visualization</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Spending Trends</h2>

        {/* Toggle Buttons */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewType('category')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewType === 'category'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            By Category
          </button>
          <button
            onClick={() => setViewType('date')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewType === 'date'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            By Date
          </button>
        </div>
      </div>

      {/* Month Filter */}
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filter by Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Time</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {formatMonthDisplay(month)}
            </option>
          ))}
        </select>
        {selectedMonth !== 'all' && (
          <button
            onClick={() => setSelectedMonth('all')}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Category View */}
      {viewType === 'category' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  style={{ fontSize: '10px' }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Date View */}
      {viewType === 'date' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#10b981" name="Total Spending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {viewType === 'category' && categoryData.slice(0, 4).map((cat, index) => (
          <div key={cat.name} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <p className="text-xs text-gray-600 font-medium">{cat.name}</p>
            </div>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(cat.value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Trends
