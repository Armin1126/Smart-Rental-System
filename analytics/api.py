"""
FastAPI Analytics Exposure API — v1.3.0
Run with: uvicorn api:app --port 8000

Exposes pre-computed analytics JSON artifacts and CSV datasets.
Also allows triggering the full synthetic telemetry data pipeline.
"""

import os
import json
import csv
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
    description="Exposes pre-computed analytics JSON artifacts, CSV datasets, and triggers synthetic telemetry generation.",
    version="1.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))


# ─── Helpers ──────────────────────────────────────────────────────────────────

def read_json_artifact(filename: str):
    filepath = os.path.join(DATASETS_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Artifact '{filename}' not found. Run the analytics pipeline first.")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading {filename}: {str(e)}")


def read_csv_file(filename: str) -> list[dict]:
    filepath = os.path.join(DATASETS_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Dataset '{filename}' not found. Run the analytics pipeline first.")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return list(reader)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading {filename}: {str(e)}")


# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {
        "service": "Smart Rental Analytics API",
        "status": "UP",
        "version": "1.3.0",
        "endpoints": [
            "/assets", "/sites", "/telemetry/{assetId}",
            "/dashboard", "/utilization", "/anomalies",
            "/forecast", "/recommendations", "/generate"
        ]
    }


# ─── Dataset CSV Endpoints ─────────────────────────────────────────────────────

@app.get("/assets")
def get_assets(site: str = None, equipment_type: str = None, status: str = None):
    """Returns all assets from assets.csv with optional filters."""
    rows = read_csv_file("assets.csv")
    if site:
        rows = [r for r in rows if r.get("Site_ID", "").upper() == site.upper()]
    if equipment_type:
        rows = [r for r in rows if equipment_type.lower() in r.get("Equipment_Type", "").lower()]
    if status:
        rows = [r for r in rows if r.get("Status", "").upper() == status.upper()]
    return {"total": len(rows), "assets": rows}


@app.get("/sites")
def get_sites():
    """Returns all sites from sites.csv."""
    rows = read_csv_file("sites.csv")
    return {"total": len(rows), "sites": rows}


@app.get("/telemetry/{asset_id}")
def get_telemetry(asset_id: str, limit: int = Query(default=50, ge=1, le=500)):
    """Returns telemetry logs for a specific asset ID."""
    rows = read_csv_file("telemetry.csv")
    filtered = [r for r in rows if r.get("Equipment_ID", "").upper() == asset_id.upper()]
    return {
        "asset_id": asset_id,
        "total_records": len(filtered),
        "telemetry": filtered[-limit:]  # Return most recent N records
    }


@app.get("/telemetry")
def get_all_telemetry(limit: int = Query(default=100, ge=1, le=1000)):
    """Returns all telemetry records (most recent first, up to limit)."""
    rows = read_csv_file("telemetry.csv")
    return {"total": len(rows), "telemetry": rows[-limit:]}


# ─── Analytics JSON Endpoints ─────────────────────────────────────────────────

@app.get("/dashboard")
def get_dashboard():
    """Returns the pre-calculated dashboard metrics summary."""
    return read_json_artifact("dashboard_analytics.json")


@app.get("/utilization")
def get_utilization():
    """Returns the under-utilization analysis."""
    return read_json_artifact("underutilized_assets.json")


@app.get("/anomalies")
def get_anomalies():
    """Returns the rule-based anomaly detection results."""
    return read_json_artifact("anomalies.json")


@app.get("/forecast")
def get_forecast_endpoint():
    """Returns the moving average demand forecast."""
    return read_json_artifact("forecast.json")


@app.get("/recommendations")
def get_recommendations_endpoint():
    """Returns the AI recommendations."""
    return read_json_artifact("recommendations.json")


# ─── Pipeline Trigger ─────────────────────────────────────────────────────────

@app.post("/generate")
@app.get("/generate")
def generate_synthetic_telemetry(records: int = Query(default=50, ge=10, le=500)):
    """Triggers the full synthetic telemetry data pipeline end-to-end."""
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
                "assets.csv", "sites.csv", "operators.csv",
                "rental_records.csv", "telemetry.csv",
                "processed_dataset.csv", "dashboard_analytics.json",
                "underutilized_assets.json", "anomalies.json",
                "forecast.json", "recommendations.json"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")
