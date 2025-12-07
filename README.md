# Financial Coach

A smart financial coach application that uses AI to transform raw transaction data into personalized insights.

## Submission Materials

- Documentation is documentation.pdf
- Demo Video: https://youtu.be/gt67DFemMnw


## Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PNW-Hackathon
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv

   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

You'll need two terminal windows open:

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # or: source venv/bin/activate (macOS/Linux)
uvicorn main:app --reload
```
Backend will run at `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run at `http://localhost:5173`

### Usage

1. Open your browser to `http://localhost:5173`
2. Upload your transaction CSV file (see format below)
3. Explore your financial insights and AI-powered recommendations

## CSV Format

Your CSV file should contain the following columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| date | Yes | Transaction date (YYYY-MM-DD) | 2025-02-02 |
| merchant | Yes | Merchant name | Starbucks #4432 |
| amount | Yes | Transaction amount (negative for expenses) | -5.89 |
| description | No | Additional details | Morning coffee |

### Sample CSV
```csv
date,merchant,amount,description
2025-02-02,Starbucks #4432,-5.89,Morning coffee
2025-02-03,Amazon.com,-45.99,Books and supplies
2025-02-04,Shell Gas Station,-52.30,Fuel
2025-02-05,Paycheck,3000.00,Monthly salary
```

## Tech Stack

**Backend:**
- FastAPI - Web framework
- SQLAlchemy - ORM
- SQLite - Database
- Prophet - Time series forecasting
- OpenAI GPT - AI insights
- Scikit-learn - Anomaly detection

**Frontend:**
- React 19 - UI library
- Redux Toolkit - State management
- Vite - Build tool
- Tailwind CSS v4 - Styling

## Troubleshooting

**Port already in use:**
```bash
# Backend (change port)
uvicorn main:app --reload --port 8001

# Frontend (change port in vite.config.js)
```

**Module not found:**
```bash
cd backend
pip install -r requirements.txt
```

**Cannot connect to backend:**
- Ensure backend is running at `http://localhost:8000`
- Check CORS settings in `backend/main.py`

## License

MIT
