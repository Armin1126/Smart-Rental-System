"""
FastAPI Analytics Engine API Entry Point
Run with: uvicorn api:app --reload
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from synthetic_data_generator import generate_data
from forecast import get_forecast
from anomaly import get_anomalies
from recommendation import get_recommendations
from dashboard_analytics import calculate_dashboard_metrics

app = FastAPI(
    title="Smart Rental Analytics Service",
    description="Python FastAPI service for IoT telemetry data synthesis, demand forecasting, anomaly detection, dashboard metrics, and recommendation engine.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "Smart Rental Analytics API",
        "status": "UP",
        "endpoints": ["/health", "/dashboard-analytics", "/generate", "/forecast", "/anomalies", "/recommendations", "/docs"]
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "engine": "FastAPI + Pandas + Scikit-Learn"}

@app.get("/dashboard-analytics")
def get_dashboard_analytics_endpoint():
    """Calculates operational metrics, fleet utilization, and breakdowns from processed_dataset.csv."""
    return calculate_dashboard_metrics()

@app.post("/generate")
def generate_synthetic_telemetry_endpoint(records: int = Query(default=50, ge=10, le=500)):
    """Triggers synthetic telemetry generation batch using Faker & NumPy."""
    data = generate_data(records)
    return {
        "status": "SUCCESS",
        "record_count": len(data),
        "data": data
    }

@app.get("/forecast")
def get_demand_forecast_endpoint():
    """Returns predictive equipment demand forecasts."""
    return get_forecast()

@app.get("/anomalies")
def get_telemetry_anomalies_endpoint():
    """Returns detected telemetry vibration and temperature anomalies."""
    return get_anomalies()

@app.get("/recommendations")
def get_ai_recommendations_endpoint():
    """Returns equipment reallocation and predictive maintenance recommendations."""
    return get_recommendations()
