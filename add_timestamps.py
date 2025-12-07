import csv
import random
from datetime import datetime, time

MERCHANT_TIMES = {
    'Paycheck Deposit': [(9, 0)],  # 9 AM
    'Netflix': [(0, 0)],  # Midnight (subscription)
    'Spotify': [(0, 0)],
    'Planet Fitness': [(6, 0), (7, 0), (18, 0), (19, 0)],  # Morning or evening workouts
    'Amazon Prime': [(0, 0)],
    'Adobe Creative Cloud': [(0, 0)],
    'Rent Payment': [(0, 0)],
    'Electric Company': [(0, 0)],
    'Water Utility': [(0, 0)],
    'Internet Provider': [(0, 0)],
    'T-Mobile': [(0, 0)],
    'Starbucks': [(7, 30), (8, 0), (8, 30), (14, 0), (15, 0), (16, 0)],  # Morning or afternoon
    'Whole Foods': [(10, 0), (11, 0), (17, 0), (18, 0)],  # Mid-morning or evening
    'Shell Gas Station': [(8, 0), (17, 30), (18, 0)],  # Commute times
    'Chevron Gas': [(8, 0), (17, 30), (18, 0)],
    'Target': [(10, 0), (14, 0), (16, 0), (19, 0)],
    'Chipotle': [(12, 0), (12, 30), (13, 0)],  # Lunch
    'Panera Bread': [(12, 0), (12, 30), (13, 0)],
    'Subway': [(12, 0), (12, 30), (13, 0)],
    'Five Guys': [(12, 0), (12, 30), (13, 0), (18, 30), (19, 0)],
    'LinkedIn Premium': [(0, 0)],
    'Uber': [(8, 15), (9, 0), (17, 45), (18, 30), (22, 0), (23, 0)],  # Commute or late night
    'Lyft': [(8, 15), (9, 0), (17, 45), (18, 30), (22, 0), (23, 0)],
    'CVS Pharmacy': [(10, 0), (15, 0), (19, 0)],
    'Walgreens': [(10, 0), (15, 0), (19, 0)],
    'Trader Joe\'s': [(11, 0), (16, 0), (17, 0)],
    'Apple iCloud': [(0, 0)],
    'GitHub Pro': [(0, 0)],
    'Blue Apron': [(0, 0)],
    'Dollar Shave Club': [(0, 0)],
    'Audible': [(0, 0)],
    'Freelance Project': [(17, 0)],  # End of work day
    'Venmo from': [(14, 0), (20, 0)],  # Afternoon or evening
    'Bonus Payment': [(9, 0)],
    'Amazon.com': [(20, 0), (21, 0), (22, 0)],  # Evening shopping
    'Best Buy': [(13, 0), (14, 0), (15, 0)],
    'Halloween Costume Store': [(14, 0)],
    'New Years Party Supply': [(15, 0)],
}

def get_time_for_merchant(merchant):
    """Get a realistic time for a merchant"""
    for key, times in MERCHANT_TIMES.items():
        if merchant.startswith(key):
            hour, minute = random.choice(times)
            minute += random.randint(-15, 15)
            if minute < 0:
                minute = 0
                hour = max(0, hour - 1)
            elif minute >= 60:
                minute = minute - 60
                hour = min(23, hour + 1)
            return f"{hour:02d}:{minute:02d}:00"

    default_times = [(10, 0), (12, 0), (14, 0), (16, 0), (19, 0)]
    hour, minute = random.choice(default_times)
    return f"{hour:02d}:{minute:02d}:00"

with open('large_transactions.csv', 'r') as infile:
    reader = csv.DictReader(infile)
    rows = list(reader)

# Add timestamps
updated_rows = []
for row in rows:
    merchant = row['merchant']
    date_str = row['date']  # e.g., "2024-07-01"
    time_str = get_time_for_merchant(merchant)

    datetime_str = f"{date_str} {time_str}"
    row['date'] = datetime_str
    updated_rows.append(row)

with open('large_transactions.csv', 'w', newline='') as outfile:
    fieldnames = ['date', 'merchant', 'amount', 'description', 'category']
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(updated_rows)

print(f"Updated {len(updated_rows)} transactions with timestamps!")
