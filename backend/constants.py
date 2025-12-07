SUBSCRIPTION_KEYWORDS = [
    "netflix", "spotify", "hulu", "apple", "google", "prime",
    "amazon", "adobe", "microsoft", "patreon", "crunchyroll",
    "youtube", "cloud", "subscription", "fitness", "gym",
    "linkedin", "github", "icloud", "audible", "membership",
    "rent", "electric", "water", "internet", "t-mobile",
    "verizon", "at&t", "apron", "shave", "dollar"
]

# Common merchants that are frequently used and shouldn't be flagged
COMMON_MERCHANTS = {
    "amazon", "target", "walmart", "costco", "whole foods", "trader joe",
    "starbucks", "panera", "chipotle", "cvs", "walgreens", "shell", "chevron",
    "uber", "lyft", "doordash", "grubhub", "mcdonald", "subway", "kroger"
}

# Utilities and rent that should only occur once per month
MONTHLY_FIXED_EXPENSES = {
    "rent", "electric", "water", "gas", "internet", "utilities", "mortgage",
    "hoa", "insurance", "loan payment"
}
