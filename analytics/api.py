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
    """Returns all assets with enriched metrics from processed_dataset.csv or assets.csv."""
    try:
        rows = read_csv_file("processed_dataset.csv")
    except Exception:
        rows = read_csv_file("assets.csv")

    mapped = []
    for r in rows:
        site_id = r.get("Site_ID_asset") or r.get("Site_ID") or r.get("Site_ID_rental") or "S001"
        eq_id = r.get("Equipment_ID") or "EQX1001"
        eq_type = r.get("Equipment_Type") or r.get("Type") or "Excavator"
        
        # Map fields so both raw assets.csv and processed_dataset.csv work seamlessly
        item = {
            "Equipment_ID": eq_id,
            "Equipment_Code": r.get("Equipment_Code", ""),
            "Equipment_Type": eq_type,
            "Make": r.get("Make", "Caterpillar"),
            "Model": r.get("Model", "CAT 320"),
            "Year": r.get("Year", "2024"),
            "Site_ID": site_id,
            "Status": r.get("Status", "AVAILABLE"),
            "Engine_Hours": float(r.get("Max_Operating_Hours") or r.get("Total_Operating_Hours") or r.get("Engine_Hours_Day") or 1250.0),
            "Fuel_Capacity_Liters": float(r.get("Avg_Fuel_Remaining_Pct") or 75.0),
            "Daily_Rate_USD": float(r.get("Daily_Rental_Rate") or 450.0),
            "Health_Score": float(r.get("Asset_Health_Score") or 92.5),
            "Utilization_Pct": float(r.get("Utilization_Percentage") or 65.0),
            "Idle_Pct": float(r.get("Idle_Percentage") or 35.0),
            "Latitude": float(r.get("Latest_Latitude") or r.get("Latitude") or 37.7749),
            "Longitude": float(r.get("Latest_Longitude") or r.get("Longitude") or -122.4194),
        }
        mapped.append(item)

    if site:
        mapped = [r for r in mapped if r["Site_ID"].upper() == site.upper()]
    if equipment_type:
        mapped = [r for r in mapped if equipment_type.lower() in r["Equipment_Type"].lower()]
    if status:
        mapped = [r for r in mapped if r["Status"].upper() == status.upper()]

    return {"total": len(mapped), "assets": mapped}


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
