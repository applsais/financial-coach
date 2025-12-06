import pandas as pd
from constants import SUBSCRIPTION_KEYWORDS


def subscriptions(expenses):
    if len(expenses) < 2:
        return {
            "subscriptions": [],
            "total_monthly_cost": 0.0,
            "message": "Not enough data to detect recurring expenses"
        }

    df = pd.DataFrame([{
        "merchant": t.merchant,
        "amount": abs(t.amount),
        "date": t.date,
        "category": t.category
    } for t in expenses])

    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")

    subscriptions = []

    for merchant in df["merchant"].unique():
        merchant_data = df[df["merchant"] == merchant]

        monthly_groups = merchant_data.groupby("month")
        transaction_counts_per_month = monthly_groups.size()

        if (transaction_counts_per_month > 1).any():
            continue

        months_active = len(transaction_counts_per_month)
        if months_active < 2:
            continue

        avg_amount = float(merchant_data["amount"].mean())
        std_amount = float(merchant_data["amount"].std())

        if not pd.isna(std_amount) and avg_amount > 0:
            if (std_amount / avg_amount) > 0.25:
                continue

        recent = merchant_data.sort_values("date", ascending=False).iloc[0]

        merchant_lower = merchant.lower()
        is_known_service = bool(any(kw in merchant_lower for kw in SUBSCRIPTION_KEYWORDS))

        subscriptions.append({
            "merchant": merchant,
            "average_amount": round(avg_amount, 2),
            "months_active": int(months_active),
            "frequency_per_month": 1.0,  #Once a month
            "is_known_service": is_known_service,
            "last_charged": recent["date"].strftime("%Y-%m-%d"),
            "category": recent["category"],
            "estimated_monthly_cost": round(avg_amount, 2)
        })

    subscriptions.sort(key=lambda x: x["estimated_monthly_cost"], reverse=True)
    total_monthly = sum(sub["estimated_monthly_cost"] for sub in subscriptions)

    return {
        "subscriptions": subscriptions,
        "total_subscriptions": len(subscriptions),
        "total_monthly_cost": round(total_monthly, 2),
        "message": f"Found {len(subscriptions)} recurring expenses"
    }