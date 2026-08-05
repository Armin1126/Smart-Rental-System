"""
Updated Synthetic Dataset Generator matching exact user table format for rental_records.csv
Generates:
1. datasets/rental_records.csv (matching image table structure & columns)
2. datasets/telemetry.csv
3. datasets/assets.csv
4. datasets/sites.csv
5. datasets/operators.csv
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

EQUIPMENT_TYPES = ["Excavator", "Bulldozer", "Wheel Loader", "Grader", "Backhoe Loader", "Crane", "Compactor", "Skid Steer"]
SITE_IDS = ["S001", "S002", "S003", "S004", "S005", "S006", "S007", "S008"]

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
    print("Building datasets matching exact image table layout for rental_records.csv...")

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
    operator_ids = []
    for i in range(101, 350):
        op_id = f"OP{i}"
        operator_ids.append(op_id)
        operators_data.append({
            "Operator_ID": op_id,
            "Operator_Name": fake.name(),
            "Email": fake.company_email(),
            "Phone": fake.phone_number(),
            "Role": random.choice(["FIELD_OPERATOR", "FIELD_OPERATOR", "MANAGER"]),
            "Status": "ACTIVE",
            "Site_ID": random.choice(SITE_IDS)
        })
    df_operators = pd.DataFrame(operators_data)

    # 3. Equipment Master (assets.csv)
    num_equipment = 40
    equipment_data = []
    equipment_ids = []

    for i in range(1001, 1001 + num_equipment):
        eq_id = f"EQX{i}"
        equipment_ids.append(eq_id)
        eq_type = random.choice(EQUIPMENT_TYPES)
        site_id, site_name, base_lat, base_lon = random.choice(SITE_DEFINITIONS)
        
        equipment_data.append({
            "Equipment_ID": eq_id,
            "Equipment_Code": f"AST-{i}",
            "Equipment_Type": eq_type,
            "Make": "Caterpillar",
            "Model": f"CAT {random.choice(['320', 'D6', '950M', '14M', '420', '745', 'CB2.7', '259D3'])}",
            "Year": random.randint(2018, 2024),
            "Daily_Rental_Rate": round(random.uniform(180.0, 600.0), 2),
            "Site_ID": site_id,
            "Latitude": base_lat + random.uniform(-0.01, 0.01),
            "Longitude": base_lon + random.uniform(-0.01, 0.01),
            "Status": "AVAILABLE"
        })
    df_assets = pd.DataFrame(equipment_data)

    # 4. Rental Records (rental_records.csv) ~100 records with exact column format from image:
    # Equipment_ID, Type, Site_ID, Check_In_Date, Check_Out_Date, Engine_Hours_Day, Idle_Hours_Day, Rental_Days, Last_Operator_ID
    
    # Exact sample rows from user's image table:
    sample_rows = [
        {"Equipment_ID": "EQX1001", "Type": "Excavator", "Site_ID": "S003", "Check_In_Date": "2025-04-01", "Check_Out_Date": "2025-04-16", "Engine_Hours_Day": 1.5, "Idle_Hours_Day": 10.0, "Rental_Days": 15, "Last_Operator_ID": "OP101"},
        {"Equipment_ID": "EQX1002", "Type": "Crane", "Site_ID": "NULL", "Check_In_Date": "2025-03-10", "Check_Out_Date": "2025-03-30", "Engine_Hours_Day": 0.0, "Idle_Hours_Day": 11.0, "Rental_Days": 20, "Last_Operator_ID": "NULL"},
        {"Equipment_ID": "EQX1003", "Type": "Bulldozer", "Site_ID": "S002", "Check_In_Date": "2025-02-15", "Check_Out_Date": "2025-03-11", "Engine_Hours_Day": 7.5, "Idle_Hours_Day": 0.5, "Rental_Days": 25, "Last_Operator_ID": "OP203"},
        {"Equipment_ID": "EQX1004", "Type": "Excavator", "Site_ID": "S004", "Check_In_Date": "2025-05-05", "Check_Out_Date": "2025-05-15", "Engine_Hours_Day": 2.0, "Idle_Hours_Day": 9.0, "Rental_Days": 10, "Last_Operator_ID": "OP106"},
        {"Equipment_ID": "EQX1005", "Type": "Bulldozer", "Site_ID": "S006", "Check_In_Date": "2025-01-01", "Check_Out_Date": "2025-01-31", "Engine_Hours_Day": 8.0, "Idle_Hours_Day": 0.0, "Rental_Days": 30, "Last_Operator_ID": "OP301"},
        {"Equipment_ID": "EQX1006", "Type": "Grader", "Site_ID": "S001", "Check_In_Date": "2025-04-05", "Check_Out_Date": "2025-04-23", "Engine_Hours_Day": 3.0, "Idle_Hours_Day": 6.0, "Rental_Days": 18, "Last_Operator_ID": "OP114"},
        {"Equipment_ID": "EQX1007", "Type": "Excavator", "Site_ID": "NULL", "Check_In_Date": "2025-03-20", "Check_Out_Date": "2025-04-01", "Engine_Hours_Day": 0.0, "Idle_Hours_Day": 12.0, "Rental_Days": 12, "Last_Operator_ID": "NULL"},
    ]

    rentals_data = list(sample_rows)

    # Generate additional rows up to ~100 records
    start_base_date = datetime(2025, 1, 1)

    for i in range(8, 101):
        eq_id = f"EQX{1000 + (i % num_equipment) + 1}"
        eq_type = random.choice(EQUIPMENT_TYPES)
        
        # 10% unassigned site (NULL)
        if random.random() < 0.10:
            site_id = "NULL"
        else:
            site_id = random.choice(SITE_IDS)

        # 10% NULL operator
        if random.random() < 0.10 or site_id == "NULL":
            operator_id = "NULL"
        else:
            operator_id = f"OP{random.randint(101, 320)}"

        rental_days = random.randint(5, 45)
        check_in_dt = start_base_date + timedelta(days=random.randint(0, 180))
        check_out_dt = check_in_dt + timedelta(days=rental_days)

        # Engine & Idle Hours patterns (some idle heavy > engine hours)
        if operator_id == "NULL" or random.random() < 0.20:
            engine_hrs = round(random.choice([0.0, 0.5, 1.0, 1.5, 2.0]), 1)
            idle_hrs = round(random.uniform(8.0, 12.0), 1)
        else:
            engine_hrs = round(random.uniform(4.0, 10.0), 1)
            idle_hrs = round(random.uniform(0.0, 4.0), 1)

        rentals_data.append({
            "Equipment_ID": eq_id,
            "Type": eq_type,
            "Site_ID": site_id,
            "Check_In_Date": check_in_dt.strftime("%Y-%m-%d"),
            "Check_Out_Date": check_out_dt.strftime("%Y-%m-%d"),
            "Engine_Hours_Day": engine_hrs,
            "Idle_Hours_Day": idle_hrs,
            "Rental_Days": rental_days,
            "Last_Operator_ID": operator_id
        })

    df_rentals = pd.DataFrame(rentals_data)

    # 5. Telemetry Logs (telemetry.csv) ~5000 rows
    print("Generating telemetry logs matching EQX IDs...")
    telemetry_data = []
    telemetry_id_counter = 1

    site_coord_map = {site_id: (lat, lon) for site_id, name, lat, lon in SITE_DEFINITIONS}

    for _, rental in df_rentals.head(35).iterrows():
        eq_id = rental["Equipment_ID"]
        site_id = rental["Site_ID"]
        base_lat, base_lon = site_coord_map.get(site_id, (37.7749, -122.4194))

        start_dt = datetime.strptime(rental["Check_In_Date"], "%Y-%m-%d") + timedelta(hours=8)
        end_dt = datetime.strptime(rental["Check_Out_Date"], "%Y-%m-%d")

        cum_engine_hours = round(random.uniform(200.0, 2500.0), 1)
        cum_idle_hours = round(cum_engine_hours * random.uniform(0.2, 0.6), 1)
        cum_fuel_total = round(cum_engine_hours * random.uniform(10.0, 15.0), 1)

        fuel_pct = 90.0
        def_pct = round(random.uniform(50.0, 100.0), 1)

        current_time = start_dt
        step = 0
        max_steps = max(40, 5000 // 35)

        while step < max_steps and current_time <= end_dt:
            hour = current_time.hour
            is_working = (8 <= hour <= 17) and (rental["Engine_Hours_Day"] > 0)

            if is_working:
                ignition = "ON"
                speed = round(random.uniform(5.0, 30.0), 1)
                engine_inc = 0.5
                idle_inc = 0.1 if rental["Idle_Hours_Day"] < rental["Engine_Hours_Day"] else 0.4
                fuel_burn = round(random.uniform(4.0, 8.0), 2)
            else:
                ignition = "OFF"
                speed = 0.0
                engine_inc = 0.0
                idle_inc = 0.0
                fuel_burn = 0.1

            cum_engine_hours += engine_inc
            cum_idle_hours += idle_inc
            cum_fuel_total += fuel_burn

            fuel_pct -= (fuel_burn / 3.0)
            if fuel_pct < 8.0:
                fuel_pct = 95.0

            def_pct -= 0.1
            if def_pct < 10.0:
                def_pct = 90.0

            gps_status = "OFFLINE" if random.random() < 0.03 else "ONLINE"
            cur_lat = base_lat + (random.uniform(-0.005, 0.005) if ignition == "ON" else 0.0)
            cur_lon = base_lon + (random.uniform(-0.005, 0.005) if ignition == "ON" else 0.0)

            if random.random() < 0.08:
                engine_cond = "WARNING"
                dtc = random.choice(DTC_CODES)
            elif random.random() < 0.03:
                engine_cond = "CRITICAL"
                dtc = random.choice(DTC_CODES)
            else:
                engine_cond = "GOOD"
                dtc = ""

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
                "Engine_Condition": engine_cond,
                "Load_Count": random.randint(0, 30),
                "Payload_Total": round(random.uniform(0.0, 300.0), 1),
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

    print("Saving dataset CSV files to datasets/...")
    df_assets.to_csv(os.path.join(DATASETS_DIR, "assets.csv"), index=False)
    df_sites.to_csv(os.path.join(DATASETS_DIR, "sites.csv"), index=False)
    df_operators.to_csv(os.path.join(DATASETS_DIR, "operators.csv"), index=False)
    df_rentals.to_csv(os.path.join(DATASETS_DIR, "rental_records.csv"), index=False)
    df_telemetry.to_csv(os.path.join(DATASETS_DIR, "telemetry.csv"), index=False)

    print("SUCCESS: All datasets updated to match image format!")
    print(f"  - rental_records.csv: {len(df_rentals)} rows")
    print(f"  - telemetry.csv: {len(df_telemetry)} rows")
    print(f"  - assets.csv: {len(df_assets)} rows")

if __name__ == "__main__":
    build_datasets()
