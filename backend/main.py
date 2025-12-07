from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from prophet import Prophet
import pandas as pd
from ml.forecast import forecast
from ml.subscriptions import subscriptions
from ml.anomalies import detect_anomalies
from ml.generalInsights import generalInsights
import io
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database import engine, get_db, Base
from models import Transaction
from schemas import TransactionResponse, UploadResponse

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Financial Coach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Financial Coach API!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/transactions/exists")
async def check_transactions_exist(db: Session = Depends(get_db)):
    """
    Check if any transactions exist in the database
    """
    count = db.query(Transaction).count()
    return {"has_data": count > 0, "count": count}

@app.post("/api/transactions/upload", response_model=UploadResponse)
async def upload_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file containing transaction data.
    Expected CSV columns: date, merchant, amount, description
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        # Read the CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        # Validate required columns
        required_columns = ['date', 'merchant', 'amount']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )

        if 'description' not in df.columns:
            df['description'] = None

        transactions_added = 0
        total_amount = 0.0

        for _, row in df.iterrows():
            try:
                transaction_date = pd.to_datetime(row['date']).date()
                transaction = Transaction(
                    date=transaction_date,
                    merchant=str(row['merchant']),
                    amount=float(row['amount']),
                    category=str(row['category'])
                )

                db.add(transaction)
                transactions_added += 1
                total_amount += float(row['amount'])

            except Exception as e:
                print(f"Error processing row: {e}")
                continue

        db.commit()

        return UploadResponse(
            message=f"Successfully uploaded {transactions_added} transactions",
            transactions_added=transactions_added,
            total_amount=round(total_amount, 2)
        )

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    expenses_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all transactions with pagination
    Set expenses_only=true to get only negative amounts (spending)
    """
    query = db.query(Transaction)

    if expenses_only:
        query = query.filter(Transaction.amount < 0)

    transactions = query\
        .order_by(Transaction.date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

    return [
        TransactionResponse(
            id=t.id,
            date=t.date,
            merchant=t.merchant,
            amount=t.amount,
            description=t.description,
            category=t.category,
            created_at=t.created_at.isoformat() if t.created_at else None
        )
        for t in transactions
    ]

@app.get("/api/transactions/summary")
async def get_transaction_summary(db: Session = Depends(get_db)):
    """
    Get summary statistics focusing on expenses (negative amounts)
    """
    all_transactions = db.query(Transaction).all()
    expenses = [t for t in all_transactions if t.amount < 0]
    income = [t for t in all_transactions if t.amount >= 0]

    if not expenses:
        return {
            "total_transactions": 0,
            "total_expenses": 0.0,
            "total_income": sum(t.amount for t in income),
            "average_expense": 0.0,
            "date_range": None
        }

    total_expenses = abs(sum(t.amount for t in expenses))
    total_income = sum(t.amount for t in income)
    dates = [t.date for t in expenses if t.date]

    return {
        "total_transactions": len(expenses),
        "total_expenses": round(total_expenses, 2),
        "total_income": round(total_income, 2),
        "average_expense": round(total_expenses / len(expenses), 2),
        "date_range": {
            "start": min(dates).isoformat() if dates else None,
            "end": max(dates).isoformat() if dates else None
        }
    }

@app.delete("/api/transactions/all")
async def delete_all_transactions(db: Session = Depends(get_db)):
    """
    Delete all transactions (useful for testing)
    """
    count = db.query(Transaction).delete()
    db.commit()
    return {"message": f"Deleted {count} transactions"}


@app.get("/api/forecast/monthly")
async def forecast_monthly_expenses(db: Session = Depends(get_db)):
    """
    Forecast next month's total expenses and income using Prophet.
    Returns historical monthly totals + predictions for both.
    """

    all_transactions = db.query(Transaction).all()
    expenses = [t for t in all_transactions if t.amount < 0]
    income_transactions = [t for t in all_transactions if t.amount > 0]  # Changed from >= 0 to > 0

    if not expenses and not income_transactions:
        raise HTTPException(status_code=400, detail="Not enough data to forecast.")

    return forecast(expenses, income_transactions)


@app.get("/api/subscriptions")
async def get_recurring_expenses(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Detect recurring expenses (subscriptions) by finding merchants that:
    1. Charge once per month (exactly 1 transaction per month)
    2. Appear in at least 2 different months
    3. Have consistent amounts (variance < 25%)
    4. Optionally match known subscription keywords
    """
  
    expenses = db.query(Transaction).filter(Transaction.amount < 0).all()

    return subscriptions(expenses)

@app.get("/api/fraud-detections")
def detect_fraud(db: Session = Depends(get_db)):
    expenses = db.query(Transaction).filter(Transaction.amount < 0).all()

    subscription_data = subscriptions(expenses) 
    subs = subscription_data["subscriptions"]

    suspicious = detect_anomalies(expenses, subs)

    return suspicious.to_dict(orient="records")

@app.get("/api/general-feedback")
async def get_general_feedback(db: Session = Depends(get_db)):
    """
    Get AI-powered financial feedback based on spending patterns
    """

    all_transactions = db.query(Transaction).all()

    if not all_transactions:
        raise HTTPException(status_code=400, detail="No transaction data available")
    
    return generalInsights(all_transactions)


@app.get("/api/general-feedback-trends")
def detect_fraud(db: Session = Depends(get_db)):
    expenses = db.query(Transaction).filter(Transaction.amount < 0).all()

    subscription_data = subscriptions(expenses) 
    subs = subscription_data["subscriptions"]

    suspicious = detect_anomalies(expenses, subs)

    return suspicious.to_dict(orient="records")