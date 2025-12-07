import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from constants import COMMON_MERCHANTS, MONTHLY_FIXED_EXPENSES


def transactions_to_dataframe(transactions, subscriptions=None):

    df = pd.DataFrame([t.to_dict() for t in transactions])

    df["date"] = pd.to_datetime(df["date"])

    df["hour_of_day"] = df["date"].dt.hour
    df["day_of_week"] = df["date"].dt.dayofweek
    df["day_of_month"] = df["date"].dt.day
    df["month"] = df["date"].dt.to_period("M")

    subscription_lookup = {}
    if subscriptions:
        for s in subscriptions:
            subscription_lookup[s["merchant"]] = {
                "is_known_service": s.get("is_known_service", False),
                "frequency_per_month": s.get("frequency_per_month", 1)
            }

    df["is_subscription_merchant"] = df["merchant"].apply(
        lambda m: 1 if m in subscription_lookup else 0
    )
    df["is_known_service"] = df["merchant"].apply(
        lambda m: 1 if m in subscription_lookup and subscription_lookup[m]["is_known_service"] else 0
    )
    df["excessive_subscription_charges"] = df["merchant"].apply(
        lambda m: 1 if m in subscription_lookup and subscription_lookup[m]["frequency_per_month"] > 1 else 0
    )
    df["is_common_merchant"] = df["merchant"].apply(
        lambda m: 1 if any(common in m.lower() for common in COMMON_MERCHANTS) else 0
    )
    df["is_fixed_expense"] = df["merchant"].apply(
        lambda m: 1 if any(fixed in m.lower() for fixed in MONTHLY_FIXED_EXPENSES) else 0
    )
    df = df.sort_values("date")
    df["time_since_last"] = (
        df.groupby("merchant")["date"].diff().dt.total_seconds().fillna(999999)
    )
    df["time_since_any"] = df["date"].diff().dt.total_seconds().fillna(999999)

    return df


def build_anomaly_model():

    numeric_features = ["amount", "hour_of_day", "day_of_week",
                        "day_of_month", "is_subscription_merchant",
                        "is_known_service", "excessive_subscription_charges",
                        "is_fixed_expense",
                        "time_since_last", "time_since_any"]
    categorical_features = ["merchant", "category"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("num", "passthrough", numeric_features),
        ]
    )

    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,  
        random_state=42
    )

    pipeline = Pipeline(steps=[
        ("preprocess", preprocessor),
        ("model", model)
    ])

    return pipeline


def apply_rules(df):
    rules = []

    # Rule 1: Rapid-fire transactions (multiple transactions within 5 minutes)
    # Focus on very close time proximity (hour and minute close)
    # EXCLUDE known services and subscriptions
    rapid_fire = (
        (df["time_since_any"] < 300) &  # Within 5 minutes
        (df["is_known_service"] == 0) &
        (df["is_subscription_merchant"] == 0)
    )
    rules.append(rapid_fire)

    # Rule 2: Duplicate/similar charges from same merchant within minutes
    # This catches card skimming - same merchant charging multiple times quickly
    # EXCLUDE subscription services and known services
    duplicate_charges = (
        (df["time_since_last"] < 300) &  # Within 5 minutes of last charge from same merchant
        (df["is_subscription_merchant"] == 0) &
        (df["is_known_service"] == 0)
    )
    rules.append(duplicate_charges)

    # Rule 3: Very large purchases (> 3 standard deviations from mean)
    # EXCLUDE subscriptions and known services
    very_large = (
        (df["amount"] > df["amount"].mean() + 3 * df["amount"].std()) &
        (df["is_known_service"] == 0) &
        (df["is_subscription_merchant"] == 0)
    )
    rules.append(very_large)

    # Rule 4: Late-night/early morning large purchases (2 AM - 5 AM, > $500)
    # EXCLUDE known services and subscriptions
    late_night_large = (
        (df["hour_of_day"] >= 2) &
        (df["hour_of_day"] < 5) &
        (df["amount"] > 500) &
        (df["is_known_service"] == 0) &
        (df["is_subscription_merchant"] == 0)
    )
    rules.append(late_night_large)

    # Rule 5: Check for monthly fixed expenses appearing more than twice in same month
    # This catches rent/utilities being charged multiple times
    # Count occurrences per merchant per month
    monthly_counts = df[df["is_fixed_expense"] == 1].groupby(["merchant", "month"]).size()
    excessive_fixed = df.apply(
        lambda row: (
            row["is_fixed_expense"] == 1 and
            monthly_counts.get((row["merchant"], row["month"]), 0) > 2
        ),
        axis=1
    )
    rules.append(excessive_fixed)

    # Rule 6: Flag subscriptions charging more than once per month
    # If frequency_per_month > 1, it means subscription is charging multiple times (fraud!)
    excessive_subscriptions = df["excessive_subscription_charges"] == 1
    rules.append(excessive_subscriptions)

    return pd.DataFrame({"rule_anomaly": np.any(rules, axis=0)})

def detect_anomalies(transactions, subscriptions=None):
    """
    Returns a list of (transaction_id, anomaly_score) for suspicious transactions.
    Filters out common merchants and focuses on genuinely suspicious patterns.
    """

    df = transactions_to_dataframe(transactions, subscriptions)

    model = build_anomaly_model()
    model.fit(df)

    scores = model.named_steps["model"].score_samples(
        model.named_steps["preprocess"].transform(df)
    )

    df["anomaly_score"] = scores

    rule_results = apply_rules(df)
    df["rule_anomaly"] = rule_results["rule_anomaly"]
    df = df.sort_values("anomaly_score")
    ml_anomalies = df["anomaly_score"] < df["anomaly_score"].quantile(0.10)

    # Only flag anomalies if:
    # - Business rule flagged it (high priority)
    # - OR Model flagged 
    suspicious = df[
        (
            (df["rule_anomaly"] == True) |
            ((ml_anomalies) & (df["is_known_service"] == 0))
        )
    ]

    suspicious = suspicious.sort_values("anomaly_score")
    return suspicious[["id", "merchant", "amount", "date", "category", "anomaly_score"]]
