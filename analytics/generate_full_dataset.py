"""
Enhanced Dataset Generator supporting long-term, ongoing, and extended rental contracts.
Generates:
1. datasets/rental_records.csv with Rental_Status, Is_Extended, Extension_Count, Original_Return_Date, Expected_Return_Date
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
    print("Building datasets supporting long-term, ongoing, and extended rental contracts...")

    # 1. Sites
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

    # 2. Operators
    operators_data = []
    for i in range(101, 350):
        op_id = f"OP{i}"
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

    # 3. Equipment Master
    num_equipment = 40
    equipment_data = []
    for i in range(1001, 1001 + num_equipment):
        eq_id = f"EQX{i}"
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

    # 4. Rental Records (with long-term, ongoing, extended contract support)
    rentals_data = []
    base_today = datetime(2025, 8, 1)

    for i in range(1, 105):
        eq_id = f"EQX{1000 + ((i - 1) % num_equipment) + 1}"
        eq_type = random.choice(EQUIPMENT_TYPES)
        
        if random.random() < 0.10:
            site_id = "NULL"
            op_id = "NULL"
        else:
            site_id = random.choice(SITE_IDS)
            op_id = f"OP{random.randint(101, 320)}"

        # Contract Type distribution: Short-term (7-30 days), Medium-term (30-180 days), Long-term (180-365 days)
        r_type_roll = random.random()
        if r_type_roll < 0.50:
            contract_type = "SHORT_TERM"
            base_duration = random.randint(7, 30)
        elif r_type_roll < 0.85:
            contract_type = "MEDIUM_TERM"
            base_duration = random.randint(30, 180)
        else:
            contract_type = "LONG_TERM"
            base_duration = random.randint(180, 365)  # Up to 1 year long-term rental!

        # Check-in date between 1 year ago and today
        check_in_dt = base_today - timedelta(days=random.randint(10, 360))
        orig_return_dt = check_in_dt + timedelta(days=base_duration)

        # Contract extension status
        is_extended = random.random() < 0.25
        ext_count = random.randint(1, 3) if is_extended else 0
        ext_days = ext_count * random.randint(15, 60) if is_extended else 0

        current_expected_return_dt = orig_return_dt + timedelta(days=ext_days)
        total_rental_days = (current_expected_return_dt - check_in_dt).days

        # Rental status determination
        if current_expected_return_dt > base_today:
            if is_extended:
                status = "EXTENDED"
            else:
                status = "ACTIVE"  # Ongoing contract
            actual_return_dt_str = "NULL"
        else:
            if random.random() < 0.15:
                status = "OVERDUE"  # Contract past return date without return
                actual_return_dt_str = "NULL"
            else:
                status = "COMPLETED"  # Returned
                actual_return_dt_str = current_expected_return_dt.strftime("%Y-%m-%d")

        # Engine & Idle Hours
        if op_id == "NULL" or random.random() < 0.20:
            eng_h = round(random.uniform(0.5, 2.5), 1)
            idle_h = round(random.uniform(8.0, 12.0), 1)
        else:
            eng_h = round(random.uniform(4.5, 9.5), 1)
            idle_h = round(random.uniform(0.5, 3.5), 1)

        rentals_data.append({
            "Equipment_ID": eq_id,
            "Type": eq_type,
            "Site_ID": site_id,
            "Check_In_Date": check_in_dt.strftime("%Y-%m-%d"),
            "Check_Out_Date": current_expected_return_dt.strftime("%Y-%m-%d"),
            "Original_Return_Date": orig_return_dt.strftime("%Y-%m-%d"),
            "Actual_Return_Date": actual_return_dt_str,
            "Engine_Hours_Day": eng_h,
            "Idle_Hours_Day": idle_h,
            "Rental_Days": total_rental_days,
            "Contract_Type": contract_type,
            "Rental_Status": status,
            "Is_Extended": is_extended,
            "Extension_Count": ext_count,
            "Last_Operator_ID": op_id
        })

    df_rentals = pd.DataFrame(rentals_data)

    # 5. Telemetry
    print("Generating telemetry logs matching EQX IDs...")
    telemetry_data = []
    telemetry_id_counter = 1

    site_coord_map = {site_id: (lat, lon) for site_id, name, lat, lon in SITE_DEFINITIONS}

    for _, rental in df_rentals.head(40).iterrows():
        eq_id = rental["Equipment_ID"]
        site_id = rental["Site_ID"]
        base_lat, base_lon = site_coord_map.get(site_id, (37.7749, -122.4194))

        start_dt = datetime.strptime(rental["Check_In_Date"], "%Y-%m-%d") + timedelta(hours=8)
        end_dt = base_today if rental["Rental_Status"] in ["ACTIVE", "EXTENDED", "OVERDUE"] else datetime.strptime(rental["Check_Out_Date"], "%Y-%m-%d")

        cum_engine_hours = round(random.uniform(300.0, 3500.0), 1)
        cum_idle_hours = round(cum_engine_hours * random.uniform(0.2, 0.5), 1)
        cum_fuel_total = round(cum_engine_hours * random.uniform(11.0, 14.0), 1)

        fuel_pct = 85.0
        def_pct = round(random.uniform(60.0, 100.0), 1)

        current_time = start_dt
        step = 0
        max_steps = 125

        while step < max_steps and current_time <= end_dt:
            hour = current_time.hour
            is_working = (8 <= hour <= 17) and (rental["Engine_Hours_Day"] > 0)

            if is_working:
                ignition = "ON"
                speed = round(random.uniform(5.0, 35.0), 1)
                engine_inc = 0.5
                idle_inc = 0.1
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
            fuel_pct -= (fuel_burn / 3.5)
            if fuel_pct < 10.0:
                fuel_pct = 95.0

            def_pct -= 0.1
            if def_pct < 10.0:
                def_pct = 90.0

            gps_status = "OFFLINE" if random.random() < 0.03 else "ONLINE"
            cur_lat = base_lat + (random.uniform(-0.005, 0.005) if ignition == "ON" else 0.0)
            cur_lon = base_lon + (random.uniform(-0.005, 0.005) if ignition == "ON" else 0.0)

            if random.random() < 0.05:
                engine_cond = "WARNING"
                dtc = random.choice(DTC_CODES)
            elif random.random() < 0.02:
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
            current_time += timedelta(hours=1)

    df_telemetry = pd.DataFrame(telemetry_data)

    print("Saving datasets to datasets/...")
    df_assets.to_csv(os.path.join(DATASETS_DIR, "assets.csv"), index=False)
    df_sites.to_csv(os.path.join(DATASETS_DIR, "sites.csv"), index=False)
    df_operators.to_csv(os.path.join(DATASETS_DIR, "operators.csv"), index=False)
    df_rentals.to_csv(os.path.join(DATASETS_DIR, "rental_records.csv"), index=False)
    df_telemetry.to_csv(os.path.join(DATASETS_DIR, "telemetry.csv"), index=False)

    print("SUCCESS: Full datasets built with long-term, ongoing, & extended rental contract support!")

if __name__ == "__main__":
    build_datasets()
