import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from datetime import datetime


def transactions_to_dataframe(transactions, subscriptions=None):
    """
    Convert your SQLAlchemy Transaction objects into a clean dataframe
    with engineered features.
    """

    df = pd.DataFrame([t.to_dict() for t in transactions])

    df["date"] = pd.to_datetime(df["date"])

    df["hour_of_day"] = df["date"].dt.hour
    df["day_of_week"] = df["date"].dt.dayofweek
    df["day_of_month"] = df["date"].dt.day
    
    subscription_names = set(s["merchant"] for s in subscriptions) if subscriptions else set()
    df["is_subscription_merchant"] = df["merchant"].apply(lambda m: 1 if m in subscription_names else 0)

    df = df.sort_values("date")
    df["time_since_last"] = (
        df.groupby("merchant")["date"].diff().dt.total_seconds().fillna(999999)
    )

    return df


def build_anomaly_model():
    """
    Creates an Isolation Forest pipeline with automatic preprocessing.
    """

    numeric_features = ["amount", "hour_of_day", "day_of_week",
                        "day_of_month", "is_subscription_merchant",
                        "time_since_last"]
    categorical_features = ["merchant", "category"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("num", "passthrough", numeric_features),
        ]
    )

    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,   # 5% anomalies — tune per user
        random_state=42
    )

    pipeline = Pipeline(steps=[
        ("preprocess", preprocessor),
        ("model", model)
    ])

    return pipeline


def apply_business_rules(df):
    rules = []

    # Very large purchase
    rules.append(df["amount"] > df["amount"].mean() + 4 * df["amount"].std())

    # Subscription charged twice in 10 days
    rules.append(
        (df["is_subscription_merchant"] == 1) & (df["time_since_last"] < 10 * 86400)
    )

    # Midnight purchase > $100
    rules.append((df["hour_of_day"] < 5) & (df["amount"] > 100))

    return pd.DataFrame({"rule_anomaly": np.any(rules, axis=0)})

def detect_anomalies(transactions, subscriptions=None):
    """
    Returns a list of (transaction_id, anomaly_score) for suspicious transactions.
    """

    df = transactions_to_dataframe(transactions, subscriptions)

    model = build_anomaly_model()
    model.fit(df)

    # Isolation Forest: negative scores = more anomalous
    scores = model.named_steps["model"].score_samples(
        model.named_steps["preprocess"].transform(df)
    )

    df["anomaly_score"] = scores

    df = df.sort_values("anomaly_score")
    anomalies = df[df["anomaly_score"] < df["anomaly_score"].quantile(0.05)]
    return anomalies[["id", "merchant", "amount", "date", "category", "anomaly_score"]]
