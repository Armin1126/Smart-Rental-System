"""
Demand Forecasting Module
Predicts future equipment rental demand based on historical rental_records.csv.

Groups by Equipment Type, Site, and Month.
Trains a Moving Average model to forecast the next month's demand.
Exports datasets/forecast.csv and returns JSON response.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))

def run_demand_forecast():
    print("=" * 60)
    print("STARTING MOVING AVERAGE DEMAND FORECASTING PIPELINE")
    print("=" * 60)

    rentals_path = os.path.join(DATASETS_DIR, "rental_records.csv")
    if not os.path.exists(rentals_path):
        raise FileNotFoundError(f"rental_records.csv not found in {DATASETS_DIR}")

    df = pd.read_csv(rentals_path)

    # Clean data
    if "Check_In_Date" not in df.columns:
        raise ValueError("Check_In_Date column missing from rental_records.csv")
    
    df = df.dropna(subset=["Check_In_Date", "Type"])
    
    # Filter out NULL sites
    site_col = "Site_ID"
    df = df[df[site_col] != "NULL"]
    df = df[df[site_col].notnull()]

    # Extract Month (YYYY-MM)
    df["Month"] = pd.to_datetime(df["Check_In_Date"], errors="coerce").dt.to_period("M")
    df = df.dropna(subset=["Month"])

    # Aggregate counts by Equipment Type, Site, and Month
    monthly_demand = df.groupby(["Type", site_col, "Month"]).size().reset_index(name="Rental_Count")
    
    # Sort chronologically
    monthly_demand = monthly_demand.sort_values(by=["Type", site_col, "Month"])

    forecast_results = []
    
    # Identify the last month in the dataset to forecast the "next" month
    if monthly_demand.empty:
        next_month = pd.to_datetime(datetime.now()).to_period("M") + 1
    else:
        last_month = monthly_demand["Month"].max()
        next_month = last_month + 1

    next_month_str = str(next_month)

    # Calculate Moving Average Forecast per group
    # We use a 3-month moving average window
    window_size = 3

    grouped = monthly_demand.groupby(["Type", site_col])
    
    for (eq_type, site_id), group in grouped:
        # Create a complete time series for the group (fill missing months with 0)
        min_month = group["Month"].min()
        max_month = group["Month"].max()
        
        # Ensure we have at least 1 month
        if pd.isna(min_month):
            continue
            
        all_months = pd.period_range(start=min_month, end=max_month, freq='M')
        
        group_ts = group.set_index("Month").reindex(all_months).fillna(0).reset_index()
        group_ts = group_ts.rename(columns={"index": "Month"})
        
        counts = group_ts["Rental_Count"].values
        
        if len(counts) == 0:
            pred_rentals = 0
            confidence = 0.0
        elif len(counts) < window_size:
            # Not enough data for full window, use simple average
            pred_rentals = np.mean(counts)
            confidence = 50.0  # Low confidence due to limited data
        else:
            # Moving Average over the last 'window_size' months
            recent_counts = counts[-window_size:]
            pred_rentals = np.mean(recent_counts)
            
            # Calculate a basic confidence score
            # Lower variance in recent history = higher confidence
            std_dev = np.std(recent_counts)
            if pred_rentals > 0:
                cv = std_dev / pred_rentals # Coefficient of Variation
                # Map CV to 0-100 score. CV=0 -> 95% confidence, CV>1 -> <50% confidence
                confidence = max(20.0, 95.0 - (cv * 40.0))
            else:
                confidence = 80.0  # Confident that demand will remain 0

        # Round prediction
        pred_rentals_rounded = int(round(pred_rentals))
        
        forecast_results.append({
            "Site": site_id,
            "Equipment_Type": eq_type,
            "Forecast_Month": next_month_str,
            "Predicted_Rentals": pred_rentals_rounded,
            "Confidence_Score": round(confidence, 1)
        })

    # Convert to DataFrame
    forecast_df = pd.DataFrame(forecast_results)

    if not forecast_df.empty:
        # Sort by predicted rentals descending
        forecast_df = forecast_df.sort_values(by=["Predicted_Rentals", "Confidence_Score"], ascending=[False, False])
    
    # Export CSV File
    csv_path = os.path.join(DATASETS_DIR, "forecast.csv")
    forecast_df.to_csv(csv_path, index=False)

    # Construct JSON response
    response_json = {
        "status": "SUCCESS",
        "forecast_target_month": next_month_str,
        "total_predictions": len(forecast_df),
        "forecasts": forecast_df.to_dict(orient="records")
    }

    # Export JSON File
    json_path = os.path.join(DATASETS_DIR, "forecast.json")
    with open(json_path, "w") as f:
        json.dump(response_json, f, indent=2)

    print(f"SUCCESS: Moving Average demand forecast complete. Generated {len(forecast_df)} predictions for {next_month_str}.")
    print(f"Saved: {csv_path} and {json_path}")
    
    return response_json

def get_forecast():
    """Entry point for the API."""
    return run_demand_forecast()

if __name__ == "__main__":
    result = run_demand_forecast()
    print(json.dumps(result, indent=2))
