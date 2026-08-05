"""
Analytics & Machine Learning Module for Smart Rental Asset Tracking
Processes telemetry data using Pandas, NumPy, and Scikit-Learn.
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from synthetic_data_generator import generate_synthetic_telemetry, generate_rental_history

class AssetAnalyticsEngine:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self._is_trained = False

    def train_baseline_risk_model(self, df: pd.DataFrame = None):
        """Trains a scikit-learn classifier to predict maintenance risk from IoT telemetry."""
        if df is None:
            df = generate_synthetic_telemetry(300)

        features = ['operating_hours', 'engine_temp_c', 'vibration_hz', 'battery_voltage', 'fuel_level_pct']
        X = df[features]
        y = df['maintenance_risk_flag']

        self.model.fit(X, y)
        self._is_trained = True
        return {"status": "Model trained successfully", "feature_names": features, "samples_trained": len(df)}

    def predict_asset_risk(self, telemetry_input: dict) -> dict:
        """Predicts maintenance risk probability for a single asset telemetry reading."""
        if not self._is_trained:
            self.train_baseline_risk_model()

        features = [
            telemetry_input.get('operating_hours', 500.0),
            telemetry_input.get('engine_temp_c', 85.0),
            telemetry_input.get('vibration_hz', 25.0),
            telemetry_input.get('battery_voltage', 12.8),
            telemetry_input.get('fuel_level_pct', 75.0)
        ]

        X_input = np.array(features).reshape(1, -1)
        prob = self.model.predict_proba(X_input)[0][1]
        prediction = int(self.model.predict(X_input)[0])

        return {
            "risk_score": float(round(prob, 4)),
            "high_risk_flag": bool(prediction),
            "recommendation": "Schedule Immediate Maintenance Inspection" if prediction == 1 else "Asset Operating Normally"
        }

    def compute_fleet_summary(self) -> dict:
        """Calculates aggregated metrics across synthetic telemetry and rental records."""
        df_telemetry = generate_synthetic_telemetry(100)
        df_rentals = generate_rental_history(25)

        avg_hours = float(np.mean(df_telemetry['operating_hours']))
        avg_temp = float(np.mean(df_telemetry['engine_temp_c']))
        high_risk_count = int(df_telemetry['maintenance_risk_flag'].sum())
        total_revenue = float(df_rentals['total_revenue'].sum())

        return {
            "total_telemetry_samples": len(df_telemetry),
            "average_operating_hours": round(avg_hours, 2),
            "average_engine_temperature_c": round(avg_temp, 2),
            "flagged_maintenance_alerts": high_risk_count,
            "simulated_rental_revenue": round(total_revenue, 2)
        }

analytics_engine = AssetAnalyticsEngine()
