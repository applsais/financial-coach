from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
from datetime import datetime

from database import engine, get_db, Base
from models import Transaction
from schemas import TransactionResponse, UploadResponse

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Financial Coach API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
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

        # Add optional description column if not present
        if 'description' not in df.columns:
            df['description'] = None

        transactions_added = 0
        total_amount = 0.0

        # Process each row
        for _, row in df.iterrows():
            try:
                # Parse date
                transaction_date = pd.to_datetime(row['date']).date()

                # Create transaction
                transaction = Transaction(
                    date=transaction_date,
                    merchant=str(row['merchant']),
                    amount=float(row['amount']),
                    description=str(row['description']) if pd.notna(row['description']) else None
                )

                db.add(transaction)
                transactions_added += 1
                total_amount += float(row['amount'])

            except Exception as e:
                # Skip invalid rows and continue
                print(f"Error processing row: {e}")
                continue

        # Commit all transactions
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
    db: Session = Depends(get_db)
):
    """
    Get all transactions with pagination
    """
    transactions = db.query(Transaction)\
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
    Get summary statistics of all transactions
    """
    transactions = db.query(Transaction).all()

    if not transactions:
        return {
            "total_transactions": 0,
            "total_amount": 0.0,
            "average_transaction": 0.0,
            "date_range": None
        }

    total_amount = sum(t.amount for t in transactions)
    dates = [t.date for t in transactions if t.date]

    return {
        "total_transactions": len(transactions),
        "total_amount": round(total_amount, 2),
        "average_transaction": round(total_amount / len(transactions), 2),
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
