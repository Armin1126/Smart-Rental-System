"""
Synthetic Telemetry & Data Generator Module
"""
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from faker import Faker

fake = Faker()

def generate_telemetry_batch(num_records=50):
    records = []
    now = datetime.now()

    for i in range(num_records):
        records.append({
            "telemetry_id": i + 1,
            "asset_id": random.randint(1, 5),
            "timestamp": (now - timedelta(minutes=i * 10)).isoformat(),
            "engine_temp_celsius": round(random.uniform(75.0, 110.0), 2),
            "vibration_hz": round(random.uniform(15.0, 75.0), 2),
            "battery_voltage": round(random.uniform(11.8, 14.0), 2),
            "fuel_level_pct": round(random.uniform(10.0, 100.0), 2),
            "operating_hours": round(random.uniform(100.0, 2500.0), 1),
            "latitude": 37.7749 + random.uniform(-0.05, 0.05),
            "longitude": -122.4194 + random.uniform(-0.05, 0.05)
        })

    return pd.DataFrame(records)
