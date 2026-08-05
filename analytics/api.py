"""
FastAPI Analytics Exposure API
Run with: uvicorn api:app --reload

This API exposes pre-computed analytics results by reading the JSON
artifacts from the datasets directory. It does NOT perform live analytics.
"""

import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Smart Rental Analytics API",
    description="Exposes pre-computed analytics JSON artifacts for the frontend dashboard.",
    version="1.1.0"
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
        "mode": "Read-Only (Static Artifact Exposure)",
        "endpoints": [
            "/dashboard",
            "/utilization",
            "/anomalies",
            "/forecast",
            "/recommendations"
        ]
    }

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
def get_forecast():
    """Returns the pre-calculated moving average demand forecast."""
    return read_json_artifact("forecast.json")

@app.get("/recommendations")
def get_recommendations():
    """Returns the pre-calculated AI recommendations."""
    return read_json_artifact("recommendations.json")
