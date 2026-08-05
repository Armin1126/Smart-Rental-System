"""
Recommendation Engine Module
Combines under-utilization, demand forecast, overdue status, and availability
to generate actionable AI-driven recommendations.
"""

import os
import json
import pandas as pd
from datetime import datetime

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))

def get_recommendations():
    print("=" * 60)
    print("STARTING RECOMMENDATION ENGINE")
    print("=" * 60)

    # 1. Load Processed Dataset (Primary Source)
    processed_path = os.path.join(DATASETS_DIR, "processed_dataset.csv")
    if not os.path.exists(processed_path):
        raise FileNotFoundError(f"processed_dataset.csv not found in {DATASETS_DIR}")
    
    df = pd.read_csv(processed_path)

    # 2. Load Forecast Data
    forecast_path = os.path.join(DATASETS_DIR, "forecast.csv")
    forecast_df = pd.DataFrame()
    if os.path.exists(forecast_path):
        forecast_df = pd.read_csv(forecast_path)

    recommendations = []

    # Prepare forecast lookup map: Equipment_Type -> List of Sites with predicted demand > 0
    demand_lookup = {}
    if not forecast_df.empty:
        high_demand = forecast_df[forecast_df["Predicted_Rentals"] > 0]
        for _, row in high_demand.iterrows():
            eq_type = row["Equipment_Type"]
            site = row["Site"]
            pred = row["Predicted_Rentals"]
            if eq_type not in demand_lookup:
                demand_lookup[eq_type] = []
            demand_lookup[eq_type].append({"Site": site, "Demand": pred})
            
        # Sort demand locations by highest demand first
        for eq_type in demand_lookup:
            demand_lookup[eq_type] = sorted(demand_lookup[eq_type], key=lambda x: x["Demand"], reverse=True)

    # 3. Evaluate each asset
    for idx, row in df.iterrows():
        asset_id = row.get("Equipment_ID", "UNKNOWN")
        eq_type = row.get("Equipment_Type", "UNKNOWN")
        site_id = row.get("Current_Site", row.get("Site_ID", "UNKNOWN"))
        utilization = float(row.get("Utilization_Percentage", 100.0))
        fuel_remaining = float(row.get("Fuel_Remaining_Percentage", 100.0))
        health_score = float(row.get("Asset_Health_Score", 100.0))
        days_remaining = float(row.get("Days_Remaining", 0))
        status = str(row.get("Rental_Status", "ACTIVE")).upper()
        
        recs_for_asset = []

        # Rule A: Refuel
        if fuel_remaining < 15.0:
            recs_for_asset.append({
                "Recommendation_Type": "Refuel",
                "Priority": "High",
                "Reason": f"Fuel level critically low ({fuel_remaining:.1f}%)."
            })

        # Rule B: Schedule Maintenance
        if health_score < 60.0:
            recs_for_asset.append({
                "Recommendation_Type": "Schedule Maintenance",
                "Priority": "Critical",
                "Reason": f"Asset health score is degraded ({health_score:.1f}/100)."
            })

        # Rule C: Overdue & Extension
        if status == "OVERDUE" or days_remaining < 0:
            if utilization > 50.0:
                recs_for_asset.append({
                    "Recommendation_Type": "Extend Rental",
                    "Priority": "Medium",
                    "Reason": f"Asset is {abs(int(days_remaining))} days overdue but highly utilized ({utilization:.1f}%). Contact customer to extend contract."
                })
            else:
                recs_for_asset.append({
                    "Recommendation_Type": "Return Early",
                    "Priority": "Medium",
                    "Reason": f"Asset is overdue and poorly utilized. Trigger immediate retrieval."
                })
        
        # Rule D: Under-utilization & Reallocation (Move Asset)
        if utilization < 30.0 and status != "COMPLETED":
            # Check if another site needs it
            target_sites = demand_lookup.get(eq_type, [])
            # Filter out the current site
            target_sites = [s for s in target_sites if s["Site"] != site_id]
            
            if len(target_sites) > 0:
                best_site = target_sites[0]["Site"]
                demand_val = target_sites[0]["Demand"]
                recs_for_asset.append({
                    "Recommendation_Type": "Move Asset",
                    "Priority": "High",
                    "Reason": f"Asset is underutilized ({utilization:.1f}%) at {site_id}. Predicted demand of {demand_val} at {best_site}."
                })
            else:
                if status != "OVERDUE": # Don't duplicate the overdue rule
                    recs_for_asset.append({
                        "Recommendation_Type": "Return Early",
                        "Priority": "Low",
                        "Reason": f"Asset is underutilized ({utilization:.1f}%) and there is no forecasted demand at other sites."
                    })

        # Append to global list
        for rec in recs_for_asset:
            recommendations.append({
                "Equipment_ID": asset_id,
                "Equipment_Type": eq_type,
                "Current_Site": site_id,
                "Action": rec["Recommendation_Type"],
                "Priority": rec["Priority"],
                "Justification": rec["Reason"]
            })

    # 4. Convert to DataFrame and Export
    rec_df = pd.DataFrame(recommendations)
    
    # Priority sorting mapping
    priority_map = {"Critical": 1, "High": 2, "Medium": 3, "Low": 4}
    
    if not rec_df.empty:
        rec_df["Sort_Val"] = rec_df["Priority"].map(priority_map)
        rec_df = rec_df.sort_values(by=["Sort_Val", "Equipment_ID"]).drop(columns=["Sort_Val"])

    csv_path = os.path.join(DATASETS_DIR, "recommendations.csv")
    rec_df.to_csv(csv_path, index=False)
    
    # Construct JSON response
    response_json = {
        "status": "SUCCESS",
        "total_recommendations": len(rec_df),
        "recommendations": rec_df.to_dict(orient="records")
    }

    # Export JSON File
    json_path = os.path.join(DATASETS_DIR, "recommendations.json")
    with open(json_path, "w") as f:
        json.dump(response_json, f, indent=2)

    print(f"SUCCESS: Generated {len(rec_df)} recommendations.")
    print(f"Saved: {csv_path} and {json_path}")
    
    return response_json

if __name__ == "__main__":
    result = get_recommendations()
    print(json.dumps(result, indent=2))
