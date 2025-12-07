from fastapi import HTTPException
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
def generalInsights(all_transactions):
    expenses = [t for t in all_transactions if t.amount < 0]
    income = [t for t in all_transactions if t.amount > 0]

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

    # Group income
    total_income = sum(t.amount for t in income)
    income_sources = {}
    for t in income:
        merchant = t.merchant or "Unknown Source"
        if merchant not in income_sources:
            income_sources[merchant] = 0
        income_sources[merchant] += t.amount

    total_expenses = sum(abs(t.amount) for t in expenses)

    category_summary = []
    for category, data in sorted(category_spending.items(), key=lambda x: x[1]["total"], reverse=True):
        percentage = (data["total"] / total_expenses * 100) if total_expenses > 0 else 0
        category_summary.append(f"- {category}: ${data['total']:.2f} ({percentage:.1f}% of spending, {data['count']} transactions)")

    income_summary = []
    for source, amount in income_sources.items():
        income_summary.append(f"- {source}: ${amount:.2f}")

    prompt = f"""You are a supportive and encouraging personal financial advisor. Analyze this user's spending and provide exactly 5 feedback items.

INCOME:
Total Monthly Income: ${total_income:.2f}
Sources:
{chr(10).join(income_summary)}

EXPENSES:
Total Monthly Spending: ${total_expenses:.2f}
Spending by Category:
{chr(10).join(category_summary)}

Net Income: ${total_income - total_expenses:.2f}

Provide exactly 5 feedback items. Each item must have:
- "type": either "positive" (celebrating good habits) or "concern" (gentle suggestions for improvement)
- "title": A short, encouraging title (max 8 words)
- "message": A respectful, supportive message with specific, actionable advice (2-3 sentences max)

IMPORTANT: Include a mix of positive reinforcement (celebrate good habits!) and gentle suggestions. Be very respectful, encouraging, and make the user feel proud of their progress while offering helpful advice. Use encouraging language like "Great job!", "You're doing well", "Consider trying", etc.

Return ONLY a JSON object with a "feedback" key containing an array of exactly 5 items. Example format:
{{
  "feedback": [
    {{"type": "positive", "title": "Great job on steady income!", "message": "You have consistent income coming in each month, which provides a stable foundation for your financial planning. This is wonderful!"}},
    {{"type": "concern", "title": "Opportunity to optimize shopping", "message": "Shopping is your largest expense category. Consider setting a monthly budget and tracking purchases to find areas where you can save without sacrificing quality."}}
  ]
}}"""

    try:

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",     
            messages=[
                {"role": "system", "content": "You are a supportive financial advisor. Return ONLY a valid JSON object with a 'feedback' array containing exactly 5 items. Be encouraging, respectful, and celebrate user's good financial habits while offering gentle suggestions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1200,
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        feedback_text = response.choices[0].message.content

        
        feedback_data = json.loads(feedback_text)
        feedback_items = feedback_data.get("feedback", [])
        if len(feedback_items) != 5:
            raise ValueError(f"Expected 5 feedback items, got {len(feedback_items)}")

        return {
            "feedback": feedback_items,
            "summary": {
                "total_income": round(total_income, 2),
                "total_expenses": round(total_expenses, 2),
                "net_income": round(total_income - total_expenses, 2),
                "category_breakdown": {
                    category: round(data["total"], 2)
                    for category, data in category_spending.items()
                }
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting feedback: {str(e)}")
