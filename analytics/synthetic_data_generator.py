"""
Synthetic Telemetry & Data Generator Module
Run standalone or import via FastAPI /generate endpoint
"""
from generator.data_generator import generate_telemetry_batch

def generate_data(num_records=50):
    df = generate_telemetry_batch(num_records)
    return df.to_dict(orient="records")

if __name__ == "__main__":
    data = generate_data(10)
    print(f"Generated {len(data)} sample telemetry records.")
