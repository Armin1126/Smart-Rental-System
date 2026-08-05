"""
FastAPI Application for Smart Rental Analytics Engine
Run server with: uvicorn api:app --reload
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from synthetic_data_generator import generate_synthetic_telemetry, generate_rental_history
from analytics import analytics_engine

app = FastAPI(
    title="Smart Rental Analytics Service",
    description="Python FastAPI service providing predictive asset maintenance analytics & synthetic telemetry",
    version="1.0.0"
)

# Enable CORS for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TelemetryPayload(BaseModel):
    operating_hours: Optional[float] = 1200.0
    engine_temp_c: Optional[float] = 88.5
    vibration_hz: Optional[float] = 32.0
    battery_voltage: Optional[float] = 12.6
    fuel_level_pct: Optional[float] = 60.0

@app.get("/")
def read_root():
    return {
        "service": "Smart Rental Analytics API",
        "status": "UP",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "summary": "/analytics/summary",
            "synthetic_telemetry": "/generate-synthetic-data",
            "predict_risk": "/analytics/predict-risk"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "engine": "FastAPI + Scikit-Learn"}

@app.get("/analytics/summary")
def get_fleet_summary():
    """Returns aggregated fleet health metrics and simulated revenue stats."""
    return analytics_engine.compute_fleet_summary()

@app.post("/generate-synthetic-data")
def trigger_data_generation(records: int = Query(default=50, ge=10, le=500)):
    """Generates synthetic IoT telemetry data using Faker and NumPy."""
    df_telemetry = generate_synthetic_telemetry(records)
    return {
        "record_count": len(df_telemetry),
        "data_sample": df_telemetry.head(10).to_dict(orient="records")
    }

@app.post("/analytics/predict-risk")
def predict_maintenance_risk(payload: TelemetryPayload):
    """Predicts asset maintenance risk score using Scikit-Learn classifier."""
    result = analytics_engine.predict_asset_risk(payload.model_dump())
    return {
        "input_telemetry": payload.model_dump(),
        "prediction_result": result
    }
