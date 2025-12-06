# Financial Coach - Smart Personal Finance Application

A smart financial coach application that uses AI to transform raw transaction data into personalized insights. Upload your transaction CSV files and gain control of your financial life.

## Features

### Phase 1: Transaction Upload & Storage (Current)
- CSV file upload for transaction data
- SQLite database storage with SQLAlchemy ORM
- Transaction summary statistics
- Beautiful, responsive UI with Tailwind CSS
- Real-time transaction viewing
- Data validation and error handling

### Coming Soon
- AI-powered spending analysis
- Category auto-detection
- Financial insights dashboard
- Personalized recommendations
- Spending trends and patterns
- Budget tracking

## Project Structure

```
PNW-Hackathon/
├── backend/                    # FastAPI backend
│   ├── venv/                  # Python virtual environment
│   ├── main.py                # Main API application
│   ├── database.py            # Database configuration
│   ├── models.py              # SQLAlchemy models
│   ├── schemas.py             # Pydantic schemas
│   ├── requirements.txt       # Python dependencies
│   └── financial_data.db      # SQLite database (created on first run)
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   └── index.css         # Tailwind CSS imports
│   └── package.json          # Node dependencies
├── sample_transactions.csv    # Sample data for testing
└── README.md
```

## Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Pandas** - Data processing and CSV parsing
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

The backend is already configured with a virtual environment and all dependencies installed.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Quick Start

1. **Start the backend** (Terminal 1):
   ```bash
   cd backend
   venv\Scripts\activate
   uvicorn main:app --reload
   ```

2. **Start the frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

4. **Upload a CSV file** - Use the provided `sample_transactions.csv` or create your own

## CSV Format

Your CSV file should contain the following columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| date | Yes | Transaction date | 2025-02-02 |
| merchant | Yes | Merchant name | Starbucks #4432 |
| amount | Yes | Transaction amount | 5.89 |
| description | No | Additional details | POS purchase |

### Sample CSV
```csv
date,merchant,amount,description
2025-02-02,Starbucks #4432,5.89,Morning coffee
2025-02-03,Amazon.com,45.99,Books and supplies
2025-02-04,Shell Gas Station,52.30,Fuel
```

A sample file is included: `sample_transactions.csv`

## API Endpoints

### Transactions
- `POST /api/transactions/upload` - Upload CSV file with transactions
- `GET /api/transactions` - Get all transactions (paginated)
- `GET /api/transactions/summary` - Get transaction statistics
- `DELETE /api/transactions/all` - Delete all transactions (for testing)

### Health
- `GET /` - Welcome message
- `GET /api/health` - Health check
- `GET /docs` - Interactive API documentation (Swagger UI)

### Example API Usage

**Upload CSV:**
```bash
curl -X POST "http://localhost:8000/api/transactions/upload" \
  -F "file=@sample_transactions.csv"
```

**Get Transactions:**
```bash
curl http://localhost:8000/api/transactions
```

**Get Summary:**
```bash
curl http://localhost:8000/api/transactions/summary
```

## Database Schema

### Transaction Model
```python
{
    "id": Integer (Primary Key)
    "date": Date (Required, Indexed)
    "merchant": String (Required, Indexed)
    "amount": Float (Required)
    "description": String (Optional)
    "category": String (Optional, for future AI categorization)
    "created_at": DateTime (Auto-generated)
    "updated_at": DateTime (Auto-updated)
}
```

## Features Breakdown

### Current Features
- ✅ CSV file upload
- ✅ Data validation
- ✅ SQLite database storage
- ✅ Transaction listing
- ✅ Summary statistics (total, average, date range)
- ✅ Responsive UI
- ✅ Error handling
- ✅ Real-time updates

### Planned Features (Next Phase)
- 🔄 AI-powered category detection
- 🔄 Spending insights and trends
- 🔄 Visual analytics dashboard
- 🔄 Budget recommendations
- 🔄 Anomaly detection
- 🔄 Export functionality
- 🔄 Multi-user support
- 🔄 Data filtering and search

## Development

### Backend Development
- Auto-reload is enabled with `--reload` flag
- Edit files in `backend/` to see changes
- View API docs at `http://localhost:8000/docs`
- Database is auto-created on first run

### Frontend Development
- Hot Module Replacement (HMR) enabled
- Edit `frontend/src/App.jsx` for UI changes
- Tailwind CSS v4 - use utility classes directly

### Database Management
The SQLite database (`financial_data.db`) is created automatically on first run. To reset:
```bash
# Stop the backend server
# Delete the database file
rm backend/financial_data.db
# Restart the server - it will create a fresh database
```

Or use the API endpoint:
```bash
curl -X DELETE http://localhost:8000/api/transactions/all
```

## Troubleshooting

### Backend Issues
**Error: Module not found**
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

**Port 8000 already in use**
```bash
uvicorn main:app --reload --port 8001
```
Update CORS in `main.py` accordingly.

### Frontend Issues
**Error: Cannot connect to backend**
- Ensure backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify CORS settings in `backend/main.py`

**CSV upload fails**
- Ensure CSV has required columns: `date`, `merchant`, `amount`
- Check date format (YYYY-MM-DD)
- Verify file is a valid CSV

### Database Issues
**Database locked**
- Close any database viewers
- Restart the backend server
- SQLite only supports single-writer access

## Next Steps for Development

1. **AI Integration**
   - Add OpenAI/Anthropic API for transaction categorization
   - Implement spending pattern analysis
   - Create personalized insights

2. **Enhanced Analytics**
   - Monthly/weekly spending trends
   - Category breakdown charts
   - Comparison with previous periods

3. **User Features**
   - Budget setting and tracking
   - Alerts for unusual spending
   - Savings goals
   - Export reports

4. **Technical Improvements**
   - PostgreSQL for production
   - User authentication
   - Rate limiting
   - Caching
   - Unit and integration tests

## License

MIT

## Contributing

This is a hackathon project. Feel free to fork and enhance!
