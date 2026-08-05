"""
Realistic Synthetic Dataset Generator for Caterpillar-Inspired Smart Rental Asset Tracking System
Generates:
1. datasets/assets.csv
2. datasets/sites.csv
3. datasets/operators.csv
4. datasets/rental_records.csv
5. datasets/telemetry.csv
"""
import os
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)
np.random.seed(42)

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))

EQUIPMENT_TYPES = [
    ("Excavator", "CAT 320", 450.00),
    ("Bulldozer", "CAT D6", 520.00),
    ("Wheel Loader", "CAT 950M", 480.00),
    ("Motor Grader", "CAT 14M", 550.00),
    ("Backhoe Loader", "CAT 420", 280.00),
    ("Dump Truck", "CAT 745", 600.00),
    ("Compactor", "CAT CB2.7", 220.00),
    ("Skid Steer", "CAT 259D3", 180.00)
]

SITE_DEFINITIONS = [
    ("S001", "San Francisco Main Depot", 37.7749, -122.4194),
    ("S002", "Silicon Valley Equipment Hub", 37.3382, -121.8863),
    ("S003", "Oakland Port Yard", 37.8044, -122.2712),
    ("S004", "Sacramento Equipment Yard", 38.5816, -121.4944),
    ("S005", "San Jose North Job Site", 37.3861, -121.9642),
    ("S006", "Fresno Industrial Depot", 36.7468, -119.7726),
    ("S007", "Redding Heavy Yard", 40.5865, -122.3917),
    ("S008", "Bakersfield Fleet Hub", 35.3733, -119.0187)
]

DTC_CODES = ["P0017", "P0087", "P0217", "P0300", "P0420", "P0562"]

def build_datasets():
    print("Building Caterpillar Smart Rental datasets...")

    # 1. Site Master (sites.csv)
    sites_data = []
    for site_id, name, lat, lon in SITE_DEFINITIONS:
        sites_data.append({
            "Site_ID": site_id,
            "Site_Name": name,
            "Address": fake.street_address(),
            "City": name.split()[0],
            "State": "CA",
            "Country": "USA",
            "Latitude": lat,
            "Longitude": lon,
            "Status": "ACTIVE"
        })
    df_sites = pd.DataFrame(sites_data)

    # 2. Operator Master (operators.csv)
    operators_data = []
    for i in range(1, 31):
        op_id = f"OP-{100 + i}"
        site_id = random.choice(SITE_DEFINITIONS)[0]
        operators_data.append({
            "Operator_ID": op_id,
            "Operator_Name": fake.name(),
            "Email": fake.company_email(),
            "Phone": fake.phone_number(),
            "Role": random.choice(["FIELD_OPERATOR", "FIELD_OPERATOR", "MANAGER"]),
            "Status": "ACTIVE",
            "Site_ID": site_id
        })
    df_operators = pd.DataFrame(operators_data)

    # 3. Equipment Master (assets.csv)
    num_equipment = 40
    equipment_data = []
    equipment_ids = []

    for i in range(1, num_equipment + 1):
        eq_id = f"EQ-{1000 + i}"
        equipment_ids.append(eq_id)
        eq_type, model, default_rate = random.choice(EQUIPMENT_TYPES)
        site_id, site_name, base_lat, base_lon = random.choice(SITE_DEFINITIONS)
        year = random.randint(2018, 2024)

        equipment_data.append({
            "Equipment_ID": eq_id,
            "Equipment_Code": f"AST-{100 + i}",
            "Equipment_Type": eq_type,
            "Make": "Caterpillar",
            "Model": model,
            "Year": year,
            "Daily_Rental_Rate": default_rate,
            "Site_ID": site_id,
            "Latitude": base_lat + random.uniform(-0.01, 0.01),
            "Longitude": base_lon + random.uniform(-0.01, 0.01),
            "Status": "AVAILABLE"
        })
    df_assets = pd.DataFrame(equipment_data)

    # 4. Rental Records (rental_records.csv) ~100 records
    num_rentals = 100
    rentals_data = []
    now = datetime.now()

    # Pre-select anomaly assets
    rapid_fuel_drop_assets = set(random.sample(equipment_ids, int(num_equipment * 0.05)))
    idle_heavy_assets = set(random.sample(equipment_ids, int(num_equipment * 0.15)))
    critical_engine_assets = set(random.sample(equipment_ids, int(num_equipment * 0.05)))

    for i in range(1, num_rentals + 1):
        rental_id = f"RNT-2026-{1000 + i}"
        eq_row = df_assets.sample(1).iloc[0]
        eq_id = eq_row["Equipment_ID"]

        site_info = random.choice(SITE_DEFINITIONS)
        site_id, site_name, base_lat, base_lon = site_info

        # 10% missing operator IDs for unauthorized/unassigned usage
        if random.random() < 0.10:
            operator_id = ""
            operator_name = ""
        else:
            op_row = df_operators.sample(1).iloc[0]
            operator_id = op_row["Operator_ID"]
            operator_name = op_row["Operator_Name"]

        cust_id = f"CUST-{random.randint(1001, 1030)}"
        cust_name = fake.company()

        rental_days = random.randint(5, 45)
        # Random checkout in last 12 months
        days_ago = random.randint(10, 350)
        checkout_date = (now - timedelta(days=days_ago)).date()
        expected_return = checkout_date + timedelta(days=rental_days)

        # Status distribution: ~10% OVERDUE, rest ACTIVE or RETURNED
        rand_val = random.random()
        if rand_val < 0.10:
            rental_status = "OVERDUE"
            actual_return = ""
            current_status = "IN_USE"
        elif checkout_date + timedelta(days=rental_days) < now.date() and random.random() < 0.70:
            rental_status = "RETURNED"
            actual_return = expected_return + timedelta(days=random.randint(-2, 3))
            current_status = "IDLE"
        else:
            rental_status = "ACTIVE"
            actual_return = ""
            # Current Status distribution: ~15% IDLE, ~5% MAINTENANCE, rest IN_USE
            cs_val = random.random()
            if cs_val < 0.15:
                current_status = "IDLE"
            elif cs_val < 0.20 or eq_id in critical_engine_assets:
                current_status = "MAINTENANCE"
            else:
                current_status = "IN_USE"

        rentals_data.append({
            "Rental_ID": rental_id,
            "Equipment_ID": eq_id,
            "Equipment_Type": eq_row["Equipment_Type"],
            "Make": "Caterpillar",
            "Model": eq_row["Model"],
            "Year": eq_row["Year"],
            "Site_ID": site_id,
            "Site_Name": site_name,
            "Latitude": round(base_lat + random.uniform(-0.01, 0.01), 6),
            "Longitude": round(base_lon + random.uniform(-0.01, 0.01), 6),
            "Customer_ID": cust_id,
            "Customer_Name": cust_name,
            "Operator_ID": operator_id,
            "Operator_Name": operator_name,
            "Check_Out_Date": str(checkout_date),
            "Expected_Return_Date": str(expected_return),
            "Actual_Return_Date": str(actual_return) if actual_return else "",
            "Rental_Days": rental_days,
            "Rental_Status": rental_status,
            "Daily_Rental_Rate": eq_row["Daily_Rental_Rate"],
            "Current_Status": current_status
        })

    df_rentals = pd.DataFrame(rentals_data)

    # 5. Telemetry Logs (telemetry.csv) ~5000 rows
    print("Generating telemetry logs with embedded machine anomalies...")
    telemetry_data = []
    telemetry_id_counter = 1

    # Generate telemetry streams for selected active / overdue rentals
    active_rentals = df_rentals[df_rentals["Rental_Status"].isin(["ACTIVE", "OVERDUE"])].copy()
    if len(active_rentals) < 15:
        active_rentals = df_rentals.head(30)

    rows_per_rental = max(50, 5000 // len(active_rentals))

    for _, rental in active_rentals.iterrows():
        eq_id = rental["Equipment_ID"]
        base_lat = rental["Latitude"]
        base_lon = rental["Longitude"]

        start_dt = datetime.strptime(rental["Check_Out_Date"], "%Y-%m-%d") + timedelta(hours=8)
        end_dt = datetime.now() if not rental["Actual_Return_Date"] else datetime.strptime(rental["Actual_Return_Date"], "%Y-%m-%d")

        cum_engine_hours = round(random.uniform(500.0, 3000.0), 1)
        cum_idle_hours = round(cum_engine_hours * (random.uniform(0.6, 1.2) if eq_id in idle_heavy_assets else random.uniform(0.15, 0.35)), 1)
        cum_fuel_total = round(cum_engine_hours * random.uniform(12.0, 18.0), 1)

        fuel_pct = 95.0
        def_pct = round(random.uniform(60.0, 100.0), 1)
        payload_total = 0.0
        load_count = 0

        # Simulate timestamps every 30 mins
        current_time = start_dt
        step = 0

        while step < rows_per_rental and current_time < end_dt:
            # Ignition & Motion behavior
            hour_of_day = current_time.hour
            is_work_hours = (7 <= hour_of_day <= 18)

            if is_work_hours and random.random() < 0.85:
                ignition = "ON"
                speed = round(random.uniform(2.5, 35.0), 1)
                engine_inc = 0.5  # 30 mins = 0.5h
                
                # Idle anomaly vs active working
                if eq_id in idle_heavy_assets or random.random() < 0.30:
                    idle_inc = 0.5
                else:
                    idle_inc = round(random.uniform(0.05, 0.15), 2)

                fuel_burn = round(random.uniform(4.0, 8.0), 2)
            else:
                ignition = "OFF"
                speed = 0.0
                engine_inc = 0.0
                idle_inc = 0.0
                fuel_burn = 0.1

            # Rapid fuel drop anomaly
            if eq_id in rapid_fuel_drop_assets and 10 <= step <= 25:
                fuel_burn *= 3.5

            cum_engine_hours += engine_inc
            cum_idle_hours += idle_inc
            cum_fuel_total += fuel_burn

            fuel_pct -= (fuel_burn / 2.5)
            if fuel_pct < 5.0:
                fuel_pct = 98.0  # Refueled

            def_pct -= 0.1
            if def_pct < 10.0:
                def_pct = 90.0

            # GPS Status & location drift
            if random.random() < 0.03:
                gps_status = "OFFLINE"
            else:
                gps_status = "ONLINE"

            # GPS location jump anomaly (out of site boundary)
            if random.random() < 0.02:
                cur_lat = base_lat + random.uniform(0.15, 0.45)
                cur_lon = base_lon + random.uniform(0.15, 0.45)
            else:
                cur_lat = base_lat + (random.uniform(-0.005, 0.005) if ignition == "ON" else 0.0)
                cur_lon = base_lon + (random.uniform(-0.005, 0.005) if ignition == "ON" else 0.0)

            # Engine Condition & DTC Codes
            if eq_id in critical_engine_assets:
                engine_condition = "CRITICAL"
                dtc = random.choice(DTC_CODES)
                temp_c = round(random.uniform(102.0, 118.0), 1)
                vib_hz = round(random.uniform(62.0, 88.0), 1)
            elif random.random() < 0.10:
                engine_condition = "WARNING"
                dtc = random.choice(DTC_CODES)
                temp_c = round(random.uniform(92.0, 101.0), 1)
                vib_hz = round(random.uniform(40.0, 60.0), 1)
            else:
                engine_condition = "GOOD"
                dtc = ""
                temp_c = round(random.uniform(82.0, 94.0), 1)
                vib_hz = round(random.uniform(18.0, 38.0), 1)

            if ignition == "ON":
                load_count += random.choice([0, 1])
                payload_total += round(random.uniform(0.0, 15.0), 1) if load_count > 0 else 0.0

            telemetry_data.append({
                "Telemetry_ID": f"TEL-{10000 + telemetry_id_counter}",
                "Timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                "Equipment_ID": eq_id,
                "Latitude": round(cur_lat, 6),
                "Longitude": round(cur_lon, 6),
                "Speed": speed,
                "Operating_Hours": round(cum_engine_hours, 1),
                "Engine_Hours": round(cum_engine_hours, 1),
                "Idle_Hours": round(cum_idle_hours, 1),
                "Fuel_Used_Total": round(cum_fuel_total, 1),
                "Fuel_Used_Last_24H": round(fuel_burn * 24, 1),
                "Fuel_Remaining_Percentage": round(max(1.0, min(100.0, fuel_pct)), 1),
                "DEF_Remaining_Percentage": round(max(5.0, min(100.0, def_pct)), 1),
                "Engine_Condition": engine_condition,
                "Load_Count": load_count,
                "Payload_Total": round(payload_total, 1),
                "Diagnostic_Trouble_Code": dtc,
                "GPS_Status": gps_status,
                "Ignition_Status": ignition
            })

            telemetry_id_counter += 1
            step += 1
            current_time += timedelta(minutes=30)

            if len(telemetry_data) >= 5000:
                break

        if len(telemetry_data) >= 5000:
            break

    df_telemetry = pd.DataFrame(telemetry_data)

    # Write files to datasets/ keeping existing filenames!
    print("Saving dataset CSV files to datasets/...")
    df_assets.to_csv(os.path.join(DATASETS_DIR, "assets.csv"), index=False)
    df_sites.to_csv(os.path.join(DATASETS_DIR, "sites.csv"), index=False)
    df_operators.to_csv(os.path.join(DATASETS_DIR, "operators.csv"), index=False)
    df_rentals.to_csv(os.path.join(DATASETS_DIR, "rental_records.csv"), index=False)
    df_telemetry.to_csv(os.path.join(DATASETS_DIR, "telemetry.csv"), index=False)

    print("SUCCESS: All 5 datasets generated successfully!")
    print(f"  - assets.csv: {len(df_assets)} rows")
    print(f"  - sites.csv: {len(df_sites)} rows")
    print(f"  - operators.csv: {len(df_operators)} rows")
    print(f"  - rental_records.csv: {len(df_rentals)} rows")
    print(f"  - telemetry.csv: {len(df_telemetry)} rows")

if __name__ == "__main__":
    build_datasets()
