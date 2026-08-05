"""
FastAPI Analytics Exposure API
Run with: uvicorn api:app --reload

This API exposes pre-computed analytics JSON artifacts and allows triggering
live synthetic telemetry data pipeline generation.
"""

import os
import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from generate_full_dataset import build_datasets
from preprocess import run_preprocessing
from dashboard_analytics import calculate_dashboard_metrics
from underutilization_analysis import analyze_underutilization
from rule_based_anomaly_detector import run_anomaly_detection
from forecast import get_forecast
from recommendation import get_recommendations

app = FastAPI(
    title="Smart Rental Analytics API",
    description="Exposes pre-computed analytics JSON artifacts and triggers synthetic telemetry generation.",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))

def read_json_artifact(filename: str):
    """Helper function to safely read JSON artifacts."""
    filepath = os.path.join(DATASETS_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Analytics artifact {filename} not found. Please run the analytics pipeline first.")
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing {filename}: {str(e)}")

@app.get("/")
def read_root():
    return {
        "service": "Smart Rental Analytics API",
        "status": "UP",
        "mode": "Live Data Pipeline & Artifact Exposure",
        "endpoints": [
            "/dashboard",
            "/utilization",
            "/anomalies",
            "/forecast",
            "/recommendations",
            "/generate"
        ]
    }

@app.post("/generate")
@app.get("/generate")
def generate_synthetic_telemetry(records: int = Query(default=50, ge=10, le=500)):
    """Triggers dataset synthesis, preprocessing, anomaly detection, forecasting, and recommendation engines."""
    try:
        build_datasets()
        run_preprocessing()
        calculate_dashboard_metrics()
        analyze_underutilization()
        run_anomaly_detection()
        get_forecast()
        get_recommendations()

        return {
            "status": "SUCCESS",
            "message": "Full synthetic telemetry data pipeline executed successfully.",
            "records_generated": records,
            "artifacts_updated": [
                "assets.csv",
                "sites.csv",
                "operators.csv",
                "rental_records.csv",
                "telemetry.csv",
                "processed_dataset.csv",
                "dashboard_analytics.json",
                "underutilized_assets.json",
                "anomalies.json",
                "forecast.json",
                "recommendations.json"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")

@app.get("/dashboard")
def get_dashboard():
    """Returns the pre-calculated dashboard metrics summary."""
    return read_json_artifact("dashboard_analytics.json")

@app.get("/utilization")
def get_utilization():
    """Returns the pre-calculated under-utilization analysis."""
    return read_json_artifact("underutilized_assets.json")

@app.get("/anomalies")
def get_anomalies():
    """Returns the pre-calculated rule-based anomaly detection results."""
    return read_json_artifact("anomalies.json")

@app.get("/forecast")
def get_forecast_endpoint():
    """Returns the pre-calculated moving average demand forecast."""
    return read_json_artifact("forecast.json")

@app.get("/recommendations")
def get_recommendations_endpoint():
    """Returns the pre-calculated AI recommendations."""
    return read_json_artifact("recommendations.json")
