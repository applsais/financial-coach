from prophet import Prophet
import pandas as pd

def forecast(expenses, income_transactions):
    result = {"history": [], "forecast": {}}
    monthly_data = {}
    
    if len(expenses) >= 2:
        expense_df = pd.DataFrame([{
            "date": t.date,
            "amount": abs(t.amount)
        } for t in expenses])

        expense_df["date"] = pd.to_datetime(expense_df["date"])
        expense_df["month"] = expense_df["date"].dt.to_period("M")
        monthly_expenses = expense_df.groupby("month")["amount"].sum().reset_index()
        monthly_expenses["month"] = monthly_expenses["month"].dt.to_timestamp()

        prophet_expense_df = monthly_expenses.rename(columns={"month": "ds", "amount": "y"})
        
        if len(prophet_expense_df) >= 2:  
            expense_model = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
            expense_model.fit(prophet_expense_df)

            future_expenses = expense_model.make_future_dataframe(periods=1, freq="MS")  # Changed from "M"
            expense_forecast = expense_model.predict(future_expenses)

            next_expense_pred = expense_forecast.tail(1).iloc[0]

            for _, row in prophet_expense_df.iterrows():
                month_key = row["ds"].strftime("%Y-%m")
                if month_key not in monthly_data:
                    monthly_data[month_key] = {"month": month_key, "total_expenses": 0, "total_income": 0}
                monthly_data[month_key]["total_expenses"] = float(row["y"])

            result["forecast"]["month"] = next_expense_pred["ds"].strftime("%Y-%m")
            result["forecast"]["predicted_expenses"] = round(float(next_expense_pred["yhat"]), 2)
            result["forecast"]["expenses_lower_bound"] = round(float(next_expense_pred["yhat_lower"]), 2)
            result["forecast"]["expenses_upper_bound"] = round(float(next_expense_pred["yhat_upper"]), 2)

    # Forecast income
    if len(income_transactions) >= 2:
        income_df = pd.DataFrame([{
            "date": t.date,
            "amount": t.amount
        } for t in income_transactions])

        income_df["date"] = pd.to_datetime(income_df["date"])
        income_df["month"] = income_df["date"].dt.to_period("M")
        monthly_income = income_df.groupby("month")["amount"].sum().reset_index()
        monthly_income["month"] = monthly_income["month"].dt.to_timestamp()

        prophet_income_df = monthly_income.rename(columns={"month": "ds", "amount": "y"})
        
        if len(prophet_income_df) >= 2:  
            income_model = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
            income_model.fit(prophet_income_df)

            future_income = income_model.make_future_dataframe(periods=1, freq="MS") 
            income_forecast = income_model.predict(future_income)

            next_income_pred = income_forecast.tail(1).iloc[0]

            for _, row in prophet_income_df.iterrows():
                month_key = row["ds"].strftime("%Y-%m")
                if month_key not in monthly_data:
                    monthly_data[month_key] = {"month": month_key, "total_expenses": 0, "total_income": 0}
                monthly_data[month_key]["total_income"] = float(row["y"])

            if "month" not in result["forecast"]:
                result["forecast"]["month"] = next_income_pred["ds"].strftime("%Y-%m")

            result["forecast"]["predicted_income"] = round(float(next_income_pred["yhat"]), 2)
            result["forecast"]["income_lower_bound"] = round(float(next_income_pred["yhat_lower"]), 2)
            result["forecast"]["income_upper_bound"] = round(float(next_income_pred["yhat_upper"]), 2)

    result["history"] = sorted(monthly_data.values(), key=lambda x: x["month"])

    return result