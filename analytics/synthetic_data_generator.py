"""
Synthetic Data Generator for Smart Rental Asset Tracking System
Generates realistic IoT sensor telemetry, operating metrics, and rental logs.
"""
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from faker import Faker

fake = Faker()

ASSET_CATEGORIES = ['Heavy Equipment', 'Aerial Lifts', 'Generators & Power', 'Earthmoving', 'Compaction']
ASSET_MODELS = [
    'CAT 320 Hydraulic Excavator',
    'Genie S-60 XC Boom Lift',
    'Atlas Copco XAS 188 Compressor',
    'JCB 3CX Backhoe Loader',
    'BOMAG BW 120 AD-5 Roller'
]

def generate_synthetic_telemetry(num_records: int = 100) -> pd.DataFrame:
    """Generates synthetic IoT telemetry data for asset monitoring."""
    np.random.seed(42)
    random.seed(42)

    now = datetime.now()
    records = []

    for i in range(num_records):
        asset_id = f"AST-{random.randint(101, 120)}"
        timestamp = now - timedelta(minutes=random.randint(0, 1440))
        operating_hours = round(random.uniform(50.0, 3500.0), 2)
        engine_temp_c = round(random.uniform(70.0, 115.0), 2)  # Normal ~85-95, High >105
        vibration_hz = round(random.uniform(10.0, 85.0), 2)     # Normal ~20-40, Anomaly >70
        battery_voltage = round(random.uniform(11.5, 14.2), 2)
        fuel_level_pct = round(random.uniform(5.0, 100.0), 2)
        
        # Risk indicator threshold
        high_risk = 1 if (engine_temp_c > 102.0 or vibration_hz > 68.0) else 0

        records.append({
            "telemetry_id": f"TEL-{1000 + i}",
            "asset_id": asset_id,
            "timestamp": timestamp.isoformat(),
            "operating_hours": operating_hours,
            "engine_temp_c": engine_temp_c,
            "vibration_hz": vibration_hz,
            "battery_voltage": battery_voltage,
            "fuel_level_pct": fuel_level_pct,
            "maintenance_risk_flag": high_risk
        })

    df = pd.DataFrame(records)
    return df

def generate_rental_history(num_rentals: int = 20) -> pd.DataFrame:
    """Generates synthetic historical rental agreements dataset."""
    rentals = []
    for i in range(num_rentals):
        start_date = fake.date_between(start_date='-60d', end_date='today')
        duration = random.randint(1, 30)
        end_date = start_date + timedelta(days=duration)
        daily_rate = random.choice([150, 250, 450, 600])

        rentals.append({
            "rental_id": f"RNT-2026-{100 + i}",
            "customer_name": fake.company(),
            "asset_model": random.choice(ASSET_MODELS),
            "category": random.choice(ASSET_CATEGORIES),
            "start_date": str(start_date),
            "end_date": str(end_date),
            "rental_days": duration,
            "daily_rate": daily_rate,
            "total_revenue": duration * daily_rate
        })

    return pd.DataFrame(rentals)

if __name__ == "__main__":
    df_telemetry = generate_synthetic_telemetry(20)
    print("Sample Telemetry Generated:")
    print(df_telemetry.head())
