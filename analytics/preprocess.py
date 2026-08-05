"""
Preprocessing Module for Caterpillar Smart Rental Asset Tracking System
Reads datasets from datasets/ directory, validates, cleans, merges,
computes derived metrics, and outputs datasets/processed_dataset.csv with summary statistics.
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))

def load_file(filename_primary, filename_alt):
    path_primary = os.path.join(DATASETS_DIR, filename_primary)
    path_alt = os.path.join(DATASETS_DIR, filename_alt)
    
    if os.path.exists(path_primary):
        df = pd.read_csv(path_primary)
        print(f"Loaded {filename_primary} ({len(df)} rows)")
        return df, path_primary
    elif os.path.exists(path_alt):
        df = pd.read_csv(path_alt)
        print(f"Loaded {filename_alt} ({len(df)} rows)")
        return df, path_alt
    else:
        raise FileNotFoundError(f"Neither {filename_primary} nor {filename_alt} found in {DATASETS_DIR}")

def run_preprocessing():
    print("=" * 60)
    print("STARTING DATASET PREPROCESSING & DATA CLEANING PIPELINE")
    print("=" * 60)

    summary_stats = {
        "missing_equipment_ids_removed": 0,
        "invalid_site_ids_flagged": 0,
        "duplicate_telemetry_removed": 0,
        "missing_timestamps_removed": 0,
        "invalid_rental_dates_fixed": 0,
        "negative_hours_cleaned": 0,
        "out_of_range_fuel_cleaned": 0,
    }

    # 1. Load CSVs
    df_assets, path_assets = load_file("assets.csv", "equipment_master.csv")
    df_sites, path_sites = load_file("sites.csv", "site_master.csv")
    df_operators, path_operators = load_file("operators.csv", "operator_master.csv")
    df_rentals, path_rentals = load_file("rental_records.csv", "rental_records.csv")
    df_telemetry, path_telemetry = load_file("telemetry.csv", "telemetry_logs.csv")

    # Sync equipment_master, site_master, operator_master, telemetry_logs copies if missing
    for src_path, alt_name in [
        (path_assets, "equipment_master.csv"),
        (path_sites, "site_master.csv"),
        (path_operators, "operator_master.csv"),
        (path_telemetry, "telemetry_logs.csv")
    ]:
        alt_path = os.path.join(DATASETS_DIR, alt_name)
        if not os.path.exists(alt_path):
            pd.read_csv(src_path).to_csv(alt_path, index=False)

    print("\n--- Phase 1: Data Validation & Cleaning ---")

    # 2. Validate & Clean Telemetry
    initial_tel_count = len(df_telemetry)
    # Check missing Equipment_ID
    df_telemetry = df_telemetry.dropna(subset=["Equipment_ID"])
    summary_stats["missing_equipment_ids_removed"] += (initial_tel_count - len(df_telemetry))

    # Check missing Timestamps
    tel_before_ts = len(df_telemetry)
    df_telemetry = df_telemetry.dropna(subset=["Timestamp"])
    summary_stats["missing_timestamps_removed"] = tel_before_ts - len(df_telemetry)

    # Check duplicate telemetry records (by Equipment_ID + Timestamp)
    tel_before_dup = len(df_telemetry)
    df_telemetry = df_telemetry.drop_duplicates(subset=["Equipment_ID", "Timestamp"])
    summary_stats["duplicate_telemetry_removed"] = tel_before_dup - len(df_telemetry)

    # Check Fuel Percentage bounds (0 - 100)
    fuel_col = "Fuel_Remaining_Percentage" if "Fuel_Remaining_Percentage" in df_telemetry.columns else "fuel_level_pct"
    if fuel_col in df_telemetry.columns:
        invalid_fuel_mask = (df_telemetry[fuel_col] < 0) | (df_telemetry[fuel_col] > 100)
        summary_stats["out_of_range_fuel_cleaned"] = invalid_fuel_mask.sum()
        df_telemetry[fuel_col] = df_telemetry[fuel_col].clip(0.0, 100.0)

    # Check negative operating hours or engine hours
    for col in ["Operating_Hours", "Engine_Hours", "Idle_Hours"]:
        if col in df_telemetry.columns:
            neg_mask = df_telemetry[col] < 0
            summary_stats["negative_hours_cleaned"] += neg_mask.sum()
            df_telemetry[col] = df_telemetry[col].apply(lambda x: max(0.0, x) if pd.notnull(x) else 0.0)

    # 3. Validate & Clean Rentals
    initial_rent_count = len(df_rentals)
    df_rentals = df_rentals.dropna(subset=["Equipment_ID"])
    summary_stats["missing_equipment_ids_removed"] += (initial_rent_count - len(df_rentals))

    # Validate negative Engine_Hours_Day / Idle_Hours_Day in rentals
    for col in ["Engine_Hours_Day", "Idle_Hours_Day", "Rental_Days"]:
        if col in df_rentals.columns:
            neg_mask = df_rentals[col] < 0
            summary_stats["negative_hours_cleaned"] += neg_mask.sum()
            df_rentals[col] = df_rentals[col].apply(lambda x: max(0.0, x) if pd.notnull(x) else 0.0)

    # Validate site IDs
    valid_site_ids = set(df_sites["Site_ID"].astype(str))
    if "Site_ID" in df_rentals.columns:
        invalid_sites = df_rentals[~df_rentals["Site_ID"].astype(str).isin(valid_site_ids) & (df_rentals["Site_ID"] != "NULL")]
        summary_stats["invalid_site_ids_flagged"] = len(invalid_sites)

    print("\n--- Phase 2: Aggregating Telemetry Features per Equipment ---")
    
    # Aggregations from Telemetry by Equipment_ID
    tel_agg = df_telemetry.groupby("Equipment_ID").agg(
        Total_Telemetry_Logs=("Telemetry_ID", "count") if "Telemetry_ID" in df_telemetry.columns else ("Timestamp", "count"),
        Max_Operating_Hours=("Operating_Hours", "max") if "Operating_Hours" in df_telemetry.columns else ("Timestamp", "count"),
        Avg_Fuel_Remaining_Pct=("Fuel_Remaining_Percentage", "mean") if fuel_col in df_telemetry.columns else ("Timestamp", "count"),
        Total_Fuel_Used=("Fuel_Used_Total", "max") if "Fuel_Used_Total" in df_telemetry.columns else ("Timestamp", "count"),
        Critical_Engine_Condition_Count=("Engine_Condition", lambda x: (x == "CRITICAL").sum()) if "Engine_Condition" in df_telemetry.columns else ("Timestamp", lambda x: 0),
        Warning_Engine_Condition_Count=("Engine_Condition", lambda x: (x == "WARNING").sum()) if "Engine_Condition" in df_telemetry.columns else ("Timestamp", lambda x: 0),
        DTC_Count=("Diagnostic_Trouble_Code", lambda x: x.notnull().sum() if isinstance(x, pd.Series) else 0) if "Diagnostic_Trouble_Code" in df_telemetry.columns else ("Timestamp", lambda x: 0),
        Latest_Latitude=("Latitude", "last") if "Latitude" in df_telemetry.columns else ("Timestamp", "last"),
        Latest_Longitude=("Longitude", "last") if "Longitude" in df_telemetry.columns else ("Timestamp", "last"),
    ).reset_index()

    print("\n--- Phase 3: Merging Master Datasets into Single Processed View ---")
    
    # Merge Assets (Equipment) with Rentals on Equipment_ID
    merged = pd.merge(df_assets, df_rentals, on="Equipment_ID", how="outer", suffixes=("_asset", "_rental"))
    
    # Merge aggregated telemetry
    merged = pd.merge(merged, tel_agg, on="Equipment_ID", how="left")

    # Coalesce common columns if present
    for col in ["Type", "Equipment_Type"]:
        if col in merged.columns and "Equipment_Type" not in merged.columns:
            merged["Equipment_Type"] = merged[col]

    print("\n--- Phase 4: Calculating Derived Features ---")
    
    today = datetime.now()

    # Derived Column 1: Total Operating Hours
    if "Max_Operating_Hours" in merged.columns and merged["Max_Operating_Hours"].notnull().any():
        merged["Total_Operating_Hours"] = merged["Max_Operating_Hours"].fillna(0.0)
    elif "Engine_Hours_Day" in merged.columns and "Rental_Days" in merged.columns:
        merged["Total_Operating_Hours"] = (merged["Engine_Hours_Day"].fillna(0.0) * merged["Rental_Days"].fillna(0.0)).round(1)
    else:
        merged["Total_Operating_Hours"] = 120.0

    # Derived Columns 2 & 3: Utilization Percentage & Idle Percentage
    if "Engine_Hours_Day" in merged.columns and "Idle_Hours_Day" in merged.columns:
        total_daily = merged["Engine_Hours_Day"].fillna(0.0) + merged["Idle_Hours_Day"].fillna(0.0)
        merged["Utilization_Percentage"] = np.where(total_daily > 0, (merged["Engine_Hours_Day"] / total_daily * 100).round(2), 0.0)
        merged["Idle_Percentage"] = np.where(total_daily > 0, (merged["Idle_Hours_Day"] / total_daily * 100).round(2), 0.0)
    else:
        merged["Utilization_Percentage"] = 65.0
        merged["Idle_Percentage"] = 35.0

    # Derived Column 4: Fuel Consumption Rate (Gallons or Liters per Operating Hour)
    if "Total_Fuel_Used" in merged.columns and "Total_Operating_Hours" in merged.columns:
        merged["Fuel_Consumption_Rate"] = np.where(
            merged["Total_Operating_Hours"] > 0,
            (merged["Total_Fuel_Used"].fillna(0.0) / merged["Total_Operating_Hours"]).round(2),
            12.5
        )
    else:
        merged["Fuel_Consumption_Rate"] = 12.5

    # Derived Columns 5 & 6 & 7: Rental Age, Days Remaining, Expected Return Date
    def parse_date(val):
        if pd.isna(val) or str(val).strip() in ["", "NULL", "nan"]:
            return None
        try:
            return datetime.strptime(str(val).split()[0], "%Y-%m-%d")
        except Exception:
            return None

    check_in_dates = merged["Check_In_Date"].apply(parse_date) if "Check_In_Date" in merged.columns else pd.Series([today]*len(merged))
    check_out_dates = merged["Check_Out_Date"].apply(parse_date) if "Check_Out_Date" in merged.columns else pd.Series([today]*len(merged))

    rental_ages = []
    days_rem = []
    expected_returns = []

    for i in range(len(merged)):
        cin = check_in_dates.iloc[i]
        cout = check_out_dates.iloc[i]
        rdays = merged["Rental_Days"].iloc[i] if "Rental_Days" in merged.columns and pd.notnull(merged["Rental_Days"].iloc[i]) else 14

        if cin:
            age = (today - cin).days
        else:
            age = rdays

        rental_ages.append(max(0, age))

        if cout:
            exp_ret = cout
        elif cin:
            exp_ret = cin + pd.Timedelta(days=rdays)
        else:
            exp_ret = today + pd.Timedelta(days=7)

        expected_returns.append(exp_ret.strftime("%Y-%m-%d"))
        days_rem.append((exp_ret - today).days)

    merged["Rental_Age_Days"] = rental_ages
    merged["Days_Remaining"] = days_rem
    merged["Expected_Return_Date"] = expected_returns

    # Derived Column 8: Asset Health Score (Rule-based 0 to 100)
    health_scores = []
    for i in range(len(merged)):
        score = 100.0
        
        # Deduct for Critical/Warning conditions
        crit = merged["Critical_Engine_Condition_Count"].iloc[i] if "Critical_Engine_Condition_Count" in merged.columns and pd.notnull(merged["Critical_Engine_Condition_Count"].iloc[i]) else 0
        warn = merged["Warning_Engine_Condition_Count"].iloc[i] if "Warning_Engine_Condition_Count" in merged.columns and pd.notnull(merged["Warning_Engine_Condition_Count"].iloc[i]) else 0
        dtc = merged["DTC_Count"].iloc[i] if "DTC_Count" in merged.columns and pd.notnull(merged["DTC_Count"].iloc[i]) else 0
        idle_pct = merged["Idle_Percentage"].iloc[i]

        score -= (crit * 25.0)
        score -= (warn * 10.0)
        score -= (dtc * 5.0)
        
        if idle_pct > 70.0:
            score -= 15.0
        elif idle_pct > 50.0:
            score -= 8.0

        health_scores.append(round(max(10.0, min(100.0, score)), 1))

    merged["Asset_Health_Score"] = health_scores

    # 6. Export Processed Dataset
    output_path = os.path.join(DATASETS_DIR, "processed_dataset.csv")
    merged.to_csv(output_path, index=False)
    print(f"\nSaved processed dataset to: {output_path} ({len(merged)} records, {len(merged.columns)} columns)")

    # Print Summary Statistics Report
    print("\n" + "=" * 60)
    print("DATA PREPROCESSING & CLEANING SUMMARY REPORT")
    print("=" * 60)
    print(f"• Total Merged Records Processed: {len(merged)}")
    print(f"• Missing Equipment IDs Cleaned: {summary_stats['missing_equipment_ids_removed']}")
    print(f"• Missing Timestamps Cleaned: {summary_stats['missing_timestamps_removed']}")
    print(f"• Duplicate Telemetry Records Removed: {summary_stats['duplicate_telemetry_removed']}")
    print(f"• Invalid Fuel % Values Clipped (0-100): {summary_stats['out_of_range_fuel_cleaned']}")
    print(f"• Negative Hours Corrected: {summary_stats['negative_hours_cleaned']}")
    print(f"• Invalid / Unassigned Site IDs Flagged: {summary_stats['invalid_site_ids_flagged']}")
    print("-" * 60)
    print("Derived Features Calculated:")
    print("  1. Total_Operating_Hours")
    print("  2. Utilization_Percentage")
    print("  3. Idle_Percentage")
    print("  4. Fuel_Consumption_Rate")
    print("  5. Rental_Age_Days")
    print("  6. Days_Remaining")
    print("  7. Expected_Return_Date")
    print("  8. Asset_Health_Score")
    print("=" * 60)

    return summary_stats, output_path

if __name__ == "__main__":
    run_preprocessing()
