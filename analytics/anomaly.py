"""
Anomaly Detection Module
"""
from anomaly.detector import detect_telemetry_anomalies

def get_anomalies():
    return detect_telemetry_anomalies()
