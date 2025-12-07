from fastapi import HTTPException
import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
from collections import defaultdict

load_dotenv()
def trends(all_transactions):

    expenses = [t for t in all_transactions if t.amount < 0]
    income = [t for t in all_transactions if t.amount > 0]

    monthly_data = defaultdict(lambda: {
        "income": 0,
        "expenses": 0,
        "categories": defaultdict(float)
    })

    for t in expenses:
        month_key = t.date.strftime("%Y-%m")  
        category = t.category or "Uncategorized"
        monthly_data[month_key]["expenses"] += abs(t.amount)
        monthly_data[month_key]["categories"][category] += abs(t.amount)

    for t in income:
        month_key = t.date.strftime("%Y-%m")
        monthly_data[month_key]["income"] += t.amount

    sorted_months = sorted(monthly_data.keys())
    calculated_trends = []

    if len(sorted_months) >= 2:
        first_month_income = monthly_data[sorted_months[0]]["income"]
        last_month_income = monthly_data[sorted_months[-1]]["income"]
        income_trend = "stable"
        # 5% margin of change
        if last_month_income > first_month_income * 1.05: 
            income_trend = "increasing"
        elif last_month_income < first_month_income * 0.95:
            income_trend = "decreasing"

        avg_monthly_income = sum(monthly_data[m]["income"] for m in sorted_months) / len(sorted_months)

        calculated_trends.append({
            "category": "Income",
            "trend": income_trend,
            "first_value": round(first_month_income, 2),
            "last_value": round(last_month_income, 2),
            "average": round(avg_monthly_income, 2)
        })

    if len(sorted_months) >= 2:
        first_month_expenses = monthly_data[sorted_months[0]]["expenses"]
        last_month_expenses = monthly_data[sorted_months[-1]]["expenses"]
        expenses_trend = "stable"
        if last_month_expenses > first_month_expenses * 1.05:
            expenses_trend = "increasing"
        elif last_month_expenses < first_month_expenses * 0.95:
            expenses_trend = "decreasing"

        avg_monthly_expenses = sum(monthly_data[m]["expenses"] for m in sorted_months) / len(sorted_months)

        calculated_trends.append({
            "category": "Total Expenses",
            "trend": expenses_trend,
            "first_value": round(first_month_expenses, 2),
            "last_value": round(last_month_expenses, 2),
            "average": round(avg_monthly_expenses, 2)
        })

    all_categories = set()
    for month in sorted_months:
        all_categories.update(monthly_data[month]["categories"].keys())

    for category in all_categories:
        category_by_month = []
        for month in sorted_months:
            amount = monthly_data[month]["categories"].get(category, 0)
            category_by_month.append(amount)

        if len(category_by_month) >= 2:
            first_value = category_by_month[0]
            last_value = category_by_month[-1]
            avg_value = sum(category_by_month) / len(category_by_month)

            cat_trend = "stable"
            if last_value > first_value * 1.1:
                cat_trend = "increasing"
            elif last_value < first_value * 0.9:
                cat_trend = "decreasing"

            calculated_trends.append({
                "category": category,
                "trend": cat_trend,
                "first_value": round(first_value, 2),
                "last_value": round(last_value, 2),
                "average": round(avg_value, 2)
            })

    category_spending = {}
    for t in expenses:
        category = t.category or "Uncategorized"
        if category not in category_spending:
            category_spending[category] = {
                "total": 0,
                "count": 0,
                "transactions": []
            }
        category_spending[category]["total"] += abs(t.amount)
        category_spending[category]["count"] += 1
        category_spending[category]["transactions"].append({
            "merchant": t.merchant,
            "amount": abs(t.amount),
            "date": t.date.isoformat()
        })

    total_income = sum(t.amount for t in income)
    income_sources = {}
    for t in income:
        merchant = t.merchant or "Unknown Source"
        if merchant not in income_sources:
            income_sources[merchant] = 0
        income_sources[merchant] += t.amount

    total_expenses = sum(abs(t.amount) for t in expenses)

    monthly_summary = []
    for month in sorted_months:
        data = monthly_data[month]
        month_name = datetime.strptime(month, "%Y-%m").strftime("%B %Y")
        monthly_summary.append(f"\n{month_name}:")
        monthly_summary.append(f"  Total Income: ${data['income']:.2f}")
        monthly_summary.append(f"  Total Expenses: ${data['expenses']:.2f}")
        monthly_summary.append(f"  Net Income: ${data['income'] - data['expenses']:.2f}")

        if data['categories']:
            monthly_summary.append(f"  Top Categories:")
            for category, amount in sorted(data['categories'].items(), key=lambda x: x[1], reverse=True)[:5]:
                monthly_summary.append(f"    - {category}: ${amount:.2f}")

    category_summary = []
    for category, data in sorted(category_spending.items(), key=lambda x: x[1]["total"], reverse=True):
        percentage = (data["total"] / total_expenses * 100) if total_expenses > 0 else 0
        category_summary.append(f"- {category}: ${data['total']:.2f} ({percentage:.1f}% of spending, {data['count']} transactions)")

    income_summary = []
    for source, amount in income_sources.items():
        income_summary.append(f"- {source}: ${amount:.2f}")

    # Format calculated trends for the prompt
    trends_summary = []
    for trend in calculated_trends:
        trend_desc = f"{trend['category']}: {trend['trend']}"
        if trend['trend'] != 'stable':
            trend_desc += f" (from ${trend['first_value']:.2f} to ${trend['last_value']:.2f})"
        else:
            trend_desc += f" (average: ${trend['average']:.2f})"
        trends_summary.append(f"- {trend_desc}")

    avg_monthly_income = sum(monthly_data[m]["income"] for m in sorted_months) / len(sorted_months) if sorted_months else 0
    avg_monthly_expenses = sum(monthly_data[m]["expenses"] for m in sorted_months) / len(sorted_months) if sorted_months else 0

    prompt = f"""You are a financial budgeting advisor. Based on the user's spending trends and income, provide budget recommendations.

CALCULATED TRENDS:
{chr(10).join(trends_summary)}

AVERAGE MONTHLY INCOME: ${avg_monthly_income:.2f}
AVERAGE MONTHLY EXPENSES: ${avg_monthly_expenses:.2f}

SPENDING BY CATEGORY (Overall):
{chr(10).join(category_summary)}

Based on this data, provide exactly 5 budget recommendations. For each spending category (or income/overall), provide:
- How much the user SHOULD spend per month in that category given their income
- A brief budgeting plan or strategy

Each recommendation must have:
- "category": The category name (e.g., "Groceries", "Dining", "Income", "Overall")
- "trend": "increasing", "decreasing", or "stable" (based on the calculated trends above)
- "recommendation": A short statement (1-2 sentences) about whether spending went up or down, and how much they should budget for this category per month
- "budget_amount": The recommended monthly budget amount for this category as a number (e.g., 400 for $400)

Focus on practical, actionable budget amounts. Consider the 50/30/20 rule (50% needs, 30% wants, 20% savings) when appropriate.

Return ONLY a JSON object with a "budget_plan" key containing an array of exactly 5 items. Example format:
{{
  "budget_plan": [
    {{"category": "Groceries", "trend": "increasing", "recommendation": "Your grocery spending has gone up recently. Based on your monthly income, you should budget around $450 per month for groceries.", "budget_amount": 450}},
    {{"category": "Overall", "trend": "stable", "recommendation": "Your total expenses are stable. Aim to keep total monthly spending under $2,500 to maintain a healthy savings rate.", "budget_amount": 2500}}
  ]
}}"""

    try:

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial budgeting advisor. Return ONLY a valid JSON object with a 'budget_plan' array containing exactly 5 budget recommendations."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1200,
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        budget_text = response.choices[0].message.content

        budget_data = json.loads(budget_text)
        budget_items = budget_data.get("budget_plan", [])
        if len(budget_items) != 5:
            raise ValueError(f"Expected 5 budget items, got {len(budget_items)}")

        return {
            "calculated_trends": calculated_trends,
            "budget_plan": budget_items,
            "summary": {
                "total_income": round(total_income, 2),
                "total_expenses": round(total_expenses, 2),
                "net_income": round(total_income - total_expenses, 2),
                "avg_monthly_income": round(avg_monthly_income, 2),
                "avg_monthly_expenses": round(avg_monthly_expenses, 2),
                "category_breakdown": {
                    category: round(data["total"], 2)
                    for category, data in category_spending.items()
                }
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting feedback: {str(e)}")
