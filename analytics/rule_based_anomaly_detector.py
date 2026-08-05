"""
Rule-Based Anomaly Detection Module for Caterpillar Smart Rental Asset Tracking System
Detects 8 rule-based operational & machine anomalies:
1. Missing Operator
2. Idle Hours > Engine Hours
3. Sudden Fuel Drop
4. GPS Jump outside assigned site
5. Diagnostic Trouble Codes (DTC)
6. Engine Condition = CRITICAL
7. Fuel Remaining < 15%
8. Equipment marked ACTIVE with Engine Hours = 0

Generates structured anomalies and exports datasets/anomalies.csv & datasets/anomalies.json.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))

def run_anomaly_detection():
    print("=" * 60)
    print("STARTING RULE-BASED ANOMALY DETECTION PIPELINE")
    print("=" * 60)

    # 1. Load Data
    processed_path = os.path.join(DATASETS_DIR, "processed_dataset.csv")
    telemetry_path = os.path.join(DATASETS_DIR, "telemetry.csv")
    if not os.path.exists(telemetry_path):
        telemetry_path = os.path.join(DATASETS_DIR, "telemetry_logs.csv")

    rentals_path = os.path.join(DATASETS_DIR, "rental_records.csv")
    sites_path = os.path.join(DATASETS_DIR, "sites.csv")
    if not os.path.exists(sites_path):
        sites_path = os.path.join(DATASETS_DIR, "site_master.csv")

    df_processed = pd.read_csv(processed_path) if os.path.exists(processed_path) else None
    df_telemetry = pd.read_csv(telemetry_path) if os.path.exists(telemetry_path) else None
    df_rentals = pd.read_csv(rentals_path) if os.path.exists(rentals_path) else None
    df_sites = pd.read_csv(sites_path) if os.path.exists(sites_path) else None

    site_coords = {}
    if df_sites is not None:
        for _, srow in df_sites.iterrows():
            site_coords[str(srow["Site_ID"])] = (float(srow["Latitude"]), float(srow["Longitude"]))

    anomalies_list = []
    today_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Helper function to append structured anomaly
    def add_anomaly(asset_id, anomaly_type, severity, description, timestamp, rec_action):
        anomalies_list.append({
            "Asset_ID": str(asset_id),
            "Anomaly_Type": anomaly_type,
            "Severity": severity,
            "Description": description,
            "Timestamp": str(timestamp),
            "Recommended_Action": rec_action
        })

    print("Evaluating 8 Rule-Based Operational Anomaly Rules...")

    # Rule 1: Missing Operator (from rental_records or processed_dataset)
    df_target_rentals = df_rentals if df_rentals is not None else df_processed
    if df_target_rentals is not None:
        op_col = "Last_Operator_ID" if "Last_Operator_ID" in df_target_rentals.columns else "Operator_ID"
        eq_col = "Equipment_ID"
        site_col = "Site_ID"
        date_col = "Check_In_Date" if "Check_In_Date" in df_target_rentals.columns else "Check_Out_Date"

        for _, row in df_target_rentals.iterrows():
            op_val = str(row.get(op_col, "")).strip()
            if pd.isna(row.get(op_col)) or op_val in ["", "NULL", "nan", "None"]:
                eq_id = row[eq_col]
                ts = row.get(date_col, today_str)
                add_anomaly(
                    asset_id=eq_id,
                    anomaly_type="Missing Operator",
                    severity="HIGH",
                    description=f"Equipment {eq_id} operating without assigned certified operator ID.",
                    timestamp=ts,
                    rec_action="Assign certified operator immediately or halt machine operation."
                )

    # Rule 2: Idle Hours > Engine Hours
    df_target_hours = df_processed if df_processed is not None else df_rentals
    if df_target_hours is not None:
        eng_col = "Engine_Hours_Day" if "Engine_Hours_Day" in df_target_hours.columns else "Engine_Hours"
        idle_col = "Idle_Hours_Day" if "Idle_Hours_Day" in df_target_hours.columns else "Idle_Hours"
        eq_col = "Equipment_ID"

        for _, row in df_target_hours.iterrows():
            eng_h = float(row.get(eng_col, 0.0)) if pd.notnull(row.get(eng_col)) else 0.0
            idle_h = float(row.get(idle_col, 0.0)) if pd.notnull(row.get(idle_col)) else 0.0

            if idle_h > eng_h and idle_h > 2.0:
                eq_id = row[eq_col]
                ts = row.get("Check_In_Date", today_str)
                add_anomaly(
                    asset_id=eq_id,
                    anomaly_type="Idle Hours > Engine Hours",
                    severity="MEDIUM",
                    description=f"Equipment {eq_id} recorded higher daily idle hours ({idle_h}h) than active engine work hours ({eng_h}h).",
                    timestamp=ts,
                    rec_action="Instruct site operator to shut down ignition during downtime to curb fuel wastage."
                )

    # Telemetry-based rules (Rules 3, 4, 5, 6, 7)
    if df_telemetry is not None:
        # Sort telemetry by Equipment_ID and Timestamp
        df_telemetry_sorted = df_telemetry.sort_values(by=["Equipment_ID", "Timestamp"])

        for eq_id, group in df_telemetry_sorted.groupby("Equipment_ID"):
            prev_fuel = None
            prev_ts = None

            for _, trow in group.iterrows():
                ts = trow.get("Timestamp", today_str)
                fuel_pct = float(trow.get("Fuel_Remaining_Percentage", 100.0)) if pd.notnull(trow.get("Fuel_Remaining_Percentage")) else 100.0
                dtc = str(trow.get("Diagnostic_Trouble_Code", "")).strip()
                engine_cond = str(trow.get("Engine_Condition", "")).strip()
                lat = float(trow.get("Latitude", 0.0)) if pd.notnull(trow.get("Latitude")) else 0.0
                lon = float(trow.get("Longitude", 0.0)) if pd.notnull(trow.get("Longitude")) else 0.0

                # Rule 3: Sudden Fuel Drop (> 25% drop between consecutive readings)
                if prev_fuel is not None and (prev_fuel - fuel_pct) > 25.0:
                    drop_val = round(prev_fuel - fuel_pct, 1)
                    add_anomaly(
                        asset_id=eq_id,
                        anomaly_type="Sudden Fuel Drop",
                        severity="HIGH",
                        description=f"Rapid fuel level drop of {drop_val}% detected between consecutive readings.",
                        timestamp=ts,
                        rec_action="Inspect fuel lines for leaks and audit site security for fuel theft/siphoning."
                    )
                prev_fuel = fuel_pct
                prev_ts = ts

                # Rule 4: GPS Jump outside assigned site geofence
                # Match asset site if available
                if lat != 0.0 and lon != 0.0:
                    # Check distance from any known site
                    site_distances = []
                    for sid, (slat, slon) in site_coords.items():
                        dist = np.sqrt((lat - slat)**2 + (lon - slon)**2)
                        site_distances.append(dist)

                    if site_distances and min(site_distances) > 0.15:  # ~15km threshold
                        add_anomaly(
                            asset_id=eq_id,
                            anomaly_type="GPS Jump outside assigned site",
                            severity="CRITICAL",
                            description=f"Asset GPS location ({lat:.4f}, {lon:.4f}) jumped far outside assigned site boundary.",
                            timestamp=ts,
                            rec_action="Verify equipment transit authorization or trigger anti-theft security protocol."
                        )

                # Rule 5: Diagnostic Trouble Codes (DTC)
                if dtc not in ["", "NULL", "nan", "None"]:
                    add_anomaly(
                        asset_id=eq_id,
                        anomaly_type="Diagnostic Trouble Codes",
                        severity="HIGH" if dtc in ["P0217", "P0087"] else "MEDIUM",
                        description=f"Diagnostic Trouble Code (DTC) '{dtc}' logged by engine ECM.",
                        timestamp=ts,
                        rec_action=f"Dispatch field technician for ECM diagnostic scan and DTC '{dtc}' service."
                    )

                # Rule 6: Engine Condition = CRITICAL
                if engine_cond.upper() == "CRITICAL":
                    add_anomaly(
                        asset_id=eq_id,
                        anomaly_type="Engine Condition = CRITICAL",
                        severity="CRITICAL",
                        description=f"Critical engine condition flagged due to extreme temperature or vibration spikes.",
                        timestamp=ts,
                        rec_action="Shut down engine immediately and dispatch emergency field mechanic."
                    )

                # Rule 7: Fuel Remaining below 15%
                if fuel_pct < 15.0:
                    add_anomaly(
                        asset_id=eq_id,
                        anomaly_type="Fuel Remaining below 15%",
                        severity="MEDIUM",
                        description=f"Low fuel remaining level ({fuel_pct}%). Risk of engine air-lock if tank empties.",
                        timestamp=ts,
                        rec_action="Schedule mobile fuel tender dispatch to job site."
                    )

    # Rule 8: Equipment marked ACTIVE with Engine Hours = 0
    if df_target_rentals is not None:
        for _, rrow in df_target_rentals.iterrows():
            eq_id = rrow.get("Equipment_ID")
            eng_h = float(rrow.get("Engine_Hours_Day", 0.0)) if pd.notnull(rrow.get("Engine_Hours_Day")) else 0.0
            r_status = str(rrow.get("Rental_Status", "")).upper()
            c_status = str(rrow.get("Current_Status", "")).upper()

            if (r_status == "ACTIVE" or c_status == "IN_USE") and eng_h == 0.0:
                ts = rrow.get("Check_In_Date", today_str)
                add_anomaly(
                    asset_id=eq_id,
                    anomaly_type="Equipment marked ACTIVE with Engine Hours = 0",
                    severity="MEDIUM",
                    description=f"Equipment {eq_id} is marked ACTIVE on lease but recorded 0 daily engine operating hours.",
                    timestamp=ts,
                    rec_action="Contact customer to confirm project start or process early contract return."
                )

    # Deduplicate anomalies by Asset_ID + Anomaly_Type + Timestamp to prevent duplicates
    df_anomalies = pd.DataFrame(anomalies_list)
    if not df_anomalies.empty:
        df_anomalies = df_anomalies.drop_duplicates(subset=["Asset_ID", "Anomaly_Type", "Timestamp"])
        # Sort by Severity priority
        severity_order = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}
        df_anomalies["Sev_Rank"] = df_anomalies["Severity"].map(severity_order)
        df_anomalies = df_anomalies.sort_values(by=["Sev_Rank", "Asset_ID"]).drop(columns=["Sev_Rank"])

    # Export CSV File
    csv_path = os.path.join(DATASETS_DIR, "anomalies.csv")
    df_anomalies.to_csv(csv_path, index=False)

    # Construct JSON response
    response_json = {
        "status": "SUCCESS",
        "total_anomalies_detected": len(df_anomalies),
        "anomalies": df_anomalies.to_dict(orient="records")
    }

    # Export JSON File
    json_path = os.path.join(DATASETS_DIR, "anomalies.json")
    with open(json_path, "w") as f:
        json.dump(response_json, f, indent=2)

    print(f"SUCCESS: Anomaly detection complete. Total {len(df_anomalies)} rule-based anomalies detected across 8 categories.")
    print(f"Saved: {csv_path} and {json_path}")

    return response_json

if __name__ == "__main__":
    result = run_anomaly_detection()
    print(json.dumps(result, indent=2))
