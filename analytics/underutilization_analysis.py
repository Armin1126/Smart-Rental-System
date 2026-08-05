"""
Under-Utilization Analysis Module
Analyzes processed_dataset.csv and flags equipment assets where:
- Utilization Percentage < 30%
OR
- Idle Percentage > 70%

Generates recommendations (Return Early, Reallocate, Monitor Usage)
and exports datasets/underutilized_assets.csv and datasets/underutilized_assets.json.
"""

import os
import json
import pandas as pd
import numpy as np

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))

def analyze_underutilization():
    processed_path = os.path.join(DATASETS_DIR, "processed_dataset.csv")
    if not os.path.exists(processed_path):
        raise FileNotFoundError(f"processed_dataset.csv not found in {DATASETS_DIR}. Run preprocess.py first.")

    df = pd.read_csv(processed_path)

    # Filtering condition: Utilization < 30% OR Idle > 70%
    util_col = "Utilization_Percentage"
    idle_col = "Idle_Percentage"
    eq_col = "Equipment_ID"
    type_col = "Equipment_Type" if "Equipment_Type" in df.columns else "Type"
    site_col = "Site_ID_asset" if "Site_ID_asset" in df.columns else ("Site_ID" if "Site_ID" in df.columns else "Site_ID_rental")

    underutilized_mask = (df[util_col] < 30.0) | (df[idle_col] > 70.0)
    flagged_df = df[underutilized_mask].copy()

    recommendations = []
    results_data = []

    for _, row in flagged_df.iterrows():
        eq_id = row[eq_col]
        eq_type = row[type_col] if type_col in row and pd.notnull(row[type_col]) else "Equipment"
        site_id = str(row[site_col]) if site_col in row and pd.notnull(row[site_col]) else "UNASSIGNED"
        util_pct = round(float(row[util_col]), 2)
        idle_pct = round(float(row[idle_col]), 2)

        # Rule-based Recommendation Assignment
        if util_pct < 15.0 or idle_pct > 85.0:
            rec = "Return Early"
            reason = "Extreme under-utilization (<15% active). Return asset to depot to stop daily rental charges."
        elif util_pct < 25.0:
            rec = "Reallocate"
            reason = "Low utilization (<25%). Reallocate to high-demand job site."
        else:
            rec = "Monitor Usage"
            reason = "High idle percentage (>70%). Alert site operator to optimize daily shift usage."

        recommendations.append(rec)

        results_data.append({
            "Asset_ID": eq_id,
            "Equipment_Type": eq_type,
            "Current_Site": site_id,
            "Utilization_Pct": util_pct,
            "Idle_Pct": idle_pct,
            "Recommendation": rec,
            "Recommendation_Reason": reason
        })

    results_df = pd.DataFrame(results_data)

    # Sort by lowest utilization first
    if not results_df.empty:
        results_df = results_df.sort_values(by="Utilization_Pct", ascending=True)

    # Export CSV File
    csv_path = os.path.join(DATASETS_DIR, "underutilized_assets.csv")
    results_df.to_csv(csv_path, index=False)

    # Construct JSON response
    response_json = {
        "status": "SUCCESS",
        "total_flagged_assets": len(results_df),
        "underutilized_assets": results_df.to_dict(orient="records")
    }

    # Export JSON File
    json_path = os.path.join(DATASETS_DIR, "underutilized_assets.json")
    with open(json_path, "w") as f:
        json.dump(response_json, f, indent=2)

    print(f"SUCCESS: Under-utilization analysis complete. Flagged {len(results_df)} underutilized assets.")
    print(f"Saved: {csv_path} and {json_path}")
    
    return response_json

def run_underutilization_analysis():
    return analyze_underutilization()

if __name__ == "__main__":
    analysis = analyze_underutilization()
    print(json.dumps(analysis, indent=2))

