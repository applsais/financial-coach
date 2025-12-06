from pydantic import BaseModel
from datetime import date
from typing import Optional

class TransactionBase(BaseModel):
    date: date
    merchant: str
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    message: str
    transactions_added: int
    total_amount: float
