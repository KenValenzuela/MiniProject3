import os
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

# =========================================================
# SETUP: Get base directory (where this script is located)
# =========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# For Vercel: assets might be in the same directory or parent
# Try multiple paths to find the Excel file
ASSETS_DIR = os.path.join(os.path.dirname(BASE_DIR), "assets")
# Fallback for Vercel deployment structure
if not os.path.exists(os.path.join(ASSETS_DIR, "ride_hailing.xlsx")):
    # Try assets in backend directory (Vercel might copy it there)
    ASSETS_DIR = os.path.join(BASE_DIR, "assets")
if not os.path.exists(os.path.join(ASSETS_DIR, "ride_hailing.xlsx")):
    # Try parent directory
    ASSETS_DIR = os.path.dirname(BASE_DIR)

# =========================================================
# LOAD DATA AT STARTUP
# =========================================================
df = pd.read_excel(
    os.path.join(ASSETS_DIR, "ride_hailing.xlsx"),
    parse_dates=["current_time"]
)

# Use exact column names (no auto-detection)
# Columns: current_time, slot_id, x, y, reservation_id, rider_id, driver_id, plate_number, service

# =========================================================
# PRECOMPUTE DATA STRUCTURES AT STARTUP
# =========================================================

# 1. Sorted unique timestamps
timestamps = sorted(df["current_time"].unique())

# 2. Compute stable slot positions (canonical x, y per slot_id)
# Group by slot_id and take first non-null x and y as that slot's canonical position
slot_positions = (
    df
    .sort_values("current_time")
    .groupby("slot_id")[["x", "y"]]
    .first()
)

# Get total number of unique slots
total_slots = len(slot_positions)

# 3. Precompute utilization: usage_count per slot
# usage_count = number of distinct timestamps where slot has plate_number not null
occupied_slots = df[df["plate_number"].notna()][["slot_id", "current_time"]].drop_duplicates()
slot_utilization = (
    occupied_slots
    .groupby("slot_id")
    .size()
    .reset_index(name="usage_count")
    .sort_values("usage_count", ascending=False)
)

# 4. Precompute service mix over time
# Group by current_time and service, count rows where service is not null
service_counts_df = (
    df[df["service"].notna()]
    .groupby(["current_time", "service"])
    .size()
    .reset_index(name="count")
)

# Build service_mix dict structure
service_mix = {}
for _, row in service_counts_df.iterrows():
    ts_iso = row["current_time"].isoformat()
    service_name = str(row["service"])
    count = int(row["count"])
    
    if ts_iso not in service_mix:
        service_mix[ts_iso] = {}
    service_mix[ts_iso][service_name] = count

# =========================================================
# FASTAPI APP
# =========================================================
app = FastAPI(title="Ride-Hailing Analytics API")

# Add CORS middleware
# Allow origins from environment variable or default to localhost
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# API ENDPOINTS
# =========================================================

@app.get("/timestamps")
async def get_timestamps() -> List[str]:
    """Returns sorted timestamps as ISO-8601 strings."""
    return [ts.isoformat() for ts in timestamps]

@app.get("/frame/{ts}")
async def get_frame(ts: str) -> List[Dict[str, Any]]:
    """
    For a given timestamp ts, return the FULL set of slots (not just occupied ones),
    including their static positions and their occupancy state at that moment.
    """
    try:
        timestamp = pd.to_datetime(ts)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    if timestamp not in timestamps:
        raise HTTPException(status_code=404, detail="Timestamp not found")
    
    # Get all slot states at this timestamp
    df_t = df[df["current_time"] == timestamp]
    
    # Create a lookup dict: slot_id -> row data
    slot_data_at_t = {}
    for _, row in df_t.iterrows():
        slot_id = row["slot_id"]
        slot_data_at_t[slot_id] = {
            "plate": str(row["plate_number"]) if pd.notna(row["plate_number"]) else None,
            "service": str(row["service"]) if pd.notna(row["service"]) else None,
            "occupied": pd.notna(row["plate_number"])
        }
    
    # Build response: ALL slots with their canonical positions
    result = []
    for slot_id in slot_positions.index:
        # Get canonical position
        slot_pos = slot_positions.loc[slot_id]
        x = float(slot_pos["x"])
        y = float(slot_pos["y"])
        
        # Get occupancy state at this timestamp
        if slot_id in slot_data_at_t:
            data = slot_data_at_t[slot_id]
            occupied = data["occupied"]
            plate = data["plate"]
            service = data["service"]
        else:
            # Slot has no row at this timestamp, treat as empty
            occupied = False
            plate = None
            service = None
        
        result.append({
            "slot_id": int(slot_id) if isinstance(slot_id, (int, np.integer)) else str(slot_id),
            "x": x,
            "y": y,
            "occupied": bool(occupied),
            "plate": plate,
            "service": service
        })
    
    return result

@app.get("/stats/{ts}")
async def get_stats(ts: str) -> Dict[str, Any]:
    """
    Provide a simple snapshot summary at timestamp ts.
    Returns total_slots, occupied, and vacant.
    """
    try:
        timestamp = pd.to_datetime(ts)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    if timestamp not in timestamps:
        raise HTTPException(status_code=404, detail="Timestamp not found")
    
    # Get all slot states at this timestamp
    df_t = df[df["current_time"] == timestamp]
    
    # Count occupied slots: number of unique slots that have a plate_number
    # This ensures we count slots, not rows (in case of any data anomalies)
    occupied = int(df_t["slot_id"][df_t["plate_number"].notna()].nunique())
    vacant = total_slots - occupied
    
    return {
        "total_slots": int(total_slots),
        "occupied": occupied,
        "vacant": vacant
    }

@app.get("/stats_timestamp/{ts}")
async def get_stats_timestamp(ts: str) -> Dict[str, Any]:
    """
    Returns timestamp-specific statistics for the given timestamp.
    Calculates metrics only for vehicles/reservations active at that moment.
    """
    try:
        timestamp = pd.to_datetime(ts)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    if timestamp not in timestamps:
        raise HTTPException(status_code=404, detail="Timestamp not found")
    
    # Get all slot states at this timestamp
    df_t = df[df["current_time"] == timestamp]
    
    # Total Vehicles: unique plates at this timestamp
    total_vehicles = int(df_t["plate_number"].notna().nunique())
    
    # Current Occupancy: number of unique slots that are occupied (have a plate_number)
    # This should match stats.occupied from /stats/{ts}
    current_occupancy = int(df_t["slot_id"][df_t["plate_number"].notna()].nunique())
    
    # Calculate dwell times for vehicles currently present at this timestamp
    current_plates = df_t[df_t["plate_number"].notna()]["plate_number"].unique()
    dwell_times = []
    
    for plate in current_plates:
        plate_data = df[df["plate_number"] == plate]
        if len(plate_data) > 0:
            first_seen = plate_data["current_time"].min()
            last_seen = plate_data["current_time"].max()
            dwell_minutes = (last_seen - first_seen).total_seconds() / 60
            dwell_times.append(dwell_minutes)
    
    avg_dwell_time = float(np.mean(dwell_times)) if len(dwell_times) > 0 else None
    max_dwell_time = float(np.max(dwell_times)) if len(dwell_times) > 0 else None
    
    # Reservation stats for active reservations at this timestamp
    if "reservation_id" in df.columns and df["reservation_id"].notna().any():
        # Get active reservations at this timestamp
        active_reservations = df_t[df_t["reservation_id"].notna()]["reservation_id"].unique()
        unique_reservations = len(active_reservations)
        
        # Calculate average reservation duration for active reservations
        reservation_durations = []
        for res_id in active_reservations:
            res_data = df[df["reservation_id"] == res_id]
            if len(res_data) > 0:
                start_time = res_data["current_time"].min()
                end_time = res_data["current_time"].max()
                duration_minutes = (end_time - start_time).total_seconds() / 60
                reservation_durations.append(duration_minutes)
        
        avg_reservation_duration = float(np.mean(reservation_durations)) if len(reservation_durations) > 0 else None
    else:
        unique_reservations = 0
        avg_reservation_duration = None
    
    return {
        "total_vehicles": total_vehicles,
        "current_occupancy": current_occupancy,
        "avg_dwell_time": avg_dwell_time,
        "max_dwell_time": max_dwell_time,
        "unique_reservations": unique_reservations,
        "avg_reservation_duration": avg_reservation_duration
    }

@app.get("/utilization")
async def get_utilization() -> List[Dict[str, Any]]:
    """
    Return how heavily each slot is used across the entire time window.
    usage_count = number of distinct timestamps where slot has plate_number not null.
    """
    result = []
    for _, row in slot_utilization.iterrows():
        slot_id = row["slot_id"]
        usage_count = int(row["usage_count"])
        result.append({
            "slot_id": int(slot_id) if isinstance(slot_id, (int, np.integer)) else str(slot_id),
            "usage_count": usage_count
        })
    
    return result

@app.get("/service_mix")
async def get_service_mix() -> Dict[str, Any]:
    """
    Return how many slots are occupied by each service provider at each timestamp.
    Structure: { timestamp_iso: { service_name: count_int, ... }, ... }
    """
    return service_mix

@app.get("/occupancy_timeline")
async def get_occupancy_timeline() -> List[Dict[str, Any]]:
    """
    Returns occupancy count per timestamp.
    """
    occupancy_timeline = df.groupby("current_time").size().reset_index(name="occupancy_count")
    return [
        {
            "timestamp": row["current_time"].isoformat(),
            "occupancy_count": int(row["occupancy_count"])
        }
        for _, row in occupancy_timeline.iterrows()
    ]

@app.get("/dwell_time")
async def get_dwell_time() -> Dict[str, Any]:
    """
    Returns dwell time statistics and distribution.
    Dwell time is calculated as the time between first and last appearance of each vehicle.
    """
    # Calculate dwell time per vehicle
    vehicle_timelines = df[df["plate_number"].notna()].groupby("plate_number").agg({
        "current_time": ["min", "max"]
    }).reset_index()
    vehicle_timelines.columns = ["plate_number", "first_seen", "last_seen"]
    vehicle_timelines["dwell_time_minutes"] = (
        (vehicle_timelines["last_seen"] - vehicle_timelines["first_seen"]).dt.total_seconds() / 60
    )
    
    # Convert to list for histogram (remove NaN values)
    distribution = vehicle_timelines["dwell_time_minutes"].dropna().tolist()
    
    return {
        "avg_dwell_time": float(vehicle_timelines["dwell_time_minutes"].mean()) if len(vehicle_timelines) > 0 else 0.0,
        "max_dwell_time": float(vehicle_timelines["dwell_time_minutes"].max()) if len(vehicle_timelines) > 0 else 0.0,
        "distribution": [float(x) for x in distribution]  # For histogram
    }

@app.get("/summary")
async def get_summary() -> Dict[str, Any]:
    """
    Returns overall summary statistics for the entire dataset.
    """
    # Total vehicles
    total_vehicles = int(df["plate_number"].notna().nunique())
    
    # Peak occupancy
    occupancy_timeline = df.groupby("current_time").size().reset_index(name="occupancy_count")
    peak_occupancy = int(occupancy_timeline["occupancy_count"].max())
    peak_timestamp = occupancy_timeline.loc[
        occupancy_timeline["occupancy_count"].idxmax(), 
        "current_time"
    ].isoformat()
    
    # Dwell time stats
    vehicle_timelines = df[df["plate_number"].notna()].groupby("plate_number").agg({
        "current_time": ["min", "max"]
    }).reset_index()
    vehicle_timelines.columns = ["plate_number", "first_seen", "last_seen"]
    vehicle_timelines["dwell_time_minutes"] = (
        (vehicle_timelines["last_seen"] - vehicle_timelines["first_seen"]).dt.total_seconds() / 60
    )
    
    avg_dwell_time = float(vehicle_timelines["dwell_time_minutes"].mean()) if len(vehicle_timelines) > 0 else None
    max_dwell_time = float(vehicle_timelines["dwell_time_minutes"].max()) if len(vehicle_timelines) > 0 else None
    
    # Reservation stats (if reservation_id exists)
    if "reservation_id" in df.columns and df["reservation_id"].notna().any():
        reservation_durations = df[df["reservation_id"].notna()].groupby("reservation_id").agg({
            "current_time": ["min", "max"]
        }).reset_index()
        reservation_durations.columns = ["reservation_id", "start_time", "end_time"]
        reservation_durations["duration_minutes"] = (
            (reservation_durations["end_time"] - reservation_durations["start_time"]).dt.total_seconds() / 60
        )
        unique_reservations = len(reservation_durations)
        avg_reservation_duration = float(reservation_durations["duration_minutes"].mean()) if len(reservation_durations) > 0 else None
    else:
        unique_reservations = None
        avg_reservation_duration = None
    
    return {
        "total_vehicles": total_vehicles,
        "peak_occupancy": peak_occupancy,
        "peak_timestamp": peak_timestamp,
        "avg_dwell_time": avg_dwell_time,
        "max_dwell_time": max_dwell_time,
        "unique_reservations": unique_reservations,
        "avg_reservation_duration": avg_reservation_duration
    }

@app.get("/slots_by_plate/{ts}")
async def get_slots_by_plate(ts: str) -> List[Dict[str, Any]]:
    """
    Returns current slot status by license plate at timestamp ts.
    Shows plate, slot_id, occupied status, and timestamp.
    """
    try:
        timestamp = pd.to_datetime(ts)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    if timestamp not in timestamps:
        raise HTTPException(status_code=404, detail="Timestamp not found")
    
    # Get all slot states at this timestamp
    df_t = df[df["current_time"] == timestamp].copy()
    
    # Build list of all slots with their status
    result = []
    for slot_id in slot_positions.index:
        slot_row = df_t[df_t["slot_id"] == slot_id]
        
        if len(slot_row) > 0:
            row = slot_row.iloc[0]
            plate = str(row["plate_number"]) if pd.notna(row["plate_number"]) else None
            service = str(row["service"]) if pd.notna(row["service"]) else None
            occupied = pd.notna(row["plate_number"])
        else:
            plate = None
            service = None
            occupied = False
        
        result.append({
            "slot_id": int(slot_id) if isinstance(slot_id, (int, np.integer)) else str(slot_id),
            "plate": plate,
            "service": service,
            "occupied": bool(occupied),
            "timestamp": timestamp.isoformat()
        })
    
    # Sort by slot_id
    result.sort(key=lambda x: x["slot_id"])
    
    return result

@app.get("/vehicles_at_timestamp/{ts}")
async def get_vehicles_at_timestamp(ts: str) -> List[Dict[str, Any]]:
    """
    Returns all vehicles present at a given timestamp with their entry time and current dwell time.
    Includes plate_number, service, entry_time (first appearance), current_dwell_time_minutes, and x,y position.
    """
    try:
        timestamp = pd.to_datetime(ts)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    if timestamp not in timestamps:
        raise HTTPException(status_code=404, detail="Timestamp not found")
    
    # Get all vehicles present at this timestamp (with x,y positions)
    df_t = df[df["current_time"] == timestamp]
    df_t_occupied = df_t[df_t["plate_number"].notna()].copy()
    
    # Get unique vehicles (plates) at this timestamp
    unique_plates = df_t_occupied["plate_number"].unique()
    
    result = []
    for plate in unique_plates:
        # Get vehicle data at this timestamp (get first occurrence if multiple slots)
        vehicle_at_t = df_t_occupied[df_t_occupied["plate_number"] == plate].iloc[0]
        service = str(vehicle_at_t["service"]) if pd.notna(vehicle_at_t["service"]) else "Unknown"
        x = float(vehicle_at_t["x"]) if pd.notna(vehicle_at_t["x"]) else None
        y = float(vehicle_at_t["y"]) if pd.notna(vehicle_at_t["y"]) else None
        
        # Find first appearance (entry time) of this vehicle
        vehicle_all_times = df[df["plate_number"] == plate]
        entry_time = vehicle_all_times["current_time"].min()
        
        # Calculate current dwell time (time from entry to current timestamp)
        current_dwell_minutes = (timestamp - entry_time).total_seconds() / 60
        
        result.append({
            "plate_number": str(plate),
            "service": service,
            "entry_time": entry_time.isoformat(),
            "entry_time_display": entry_time.strftime("%H:%M:%S"),
            "current_dwell_time_minutes": round(current_dwell_minutes, 1),
            "x": x,
            "y": y
        })
    
    # Sort by entry time (earliest first)
    result.sort(key=lambda x: x["entry_time"])
    
    return result

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Ride-Hailing Analytics API", "version": "2.0.0"}
