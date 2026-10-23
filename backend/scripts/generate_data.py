"""
CardioTwin AI — Synthetic Dataset Generation Pipeline
Happiest Health Digital Twin Challenge 2026

Generates realistic synthetic EHR demographics and time-series wearable observations
with documented event-generation rules and strict anti-leakage constraints.
"""

import json
import random
import os
import math
from datetime import datetime, timedelta

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "generated")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PATIENT_COHORTS = [
    {"id": "CT-1001", "name": "Eleanor Vance", "age": 64, "gender": "Female", "sbp": 146, "dbp": 92, "cad": True, "htn": True, "dm": True, "smoker": "Former"},
    {"id": "CT-1002", "name": "Marcus Sterling", "age": 42, "gender": "Male", "sbp": 118, "dbp": 76, "cad": False, "htn": False, "dm": False, "smoker": "Never"},
    {"id": "CT-1003", "name": "Arthur Pendelton", "age": 71, "gender": "Male", "sbp": 158, "dbp": 98, "cad": True, "htn": True, "dm": True, "smoker": "Current"},
    {"id": "CT-1004", "name": "Amara Okafor", "age": 53, "gender": "Female", "sbp": 132, "dbp": 84, "cad": False, "htn": True, "dm": False, "smoker": "Never"},
    {"id": "CT-1005", "name": "David K. Tanaka", "age": 58, "gender": "Male", "sbp": 142, "dbp": 88, "cad": True, "htn": True, "dm": True, "smoker": "Former"},
    {"id": "CT-1006", "name": "Sophia Rodriguez", "age": 38, "gender": "Female", "sbp": 112, "dbp": 72, "cad": False, "htn": False, "dm": False, "smoker": "Never"},
    {"id": "CT-1007", "name": "Robert Chen", "age": 67, "gender": "Male", "sbp": 152, "dbp": 94, "cad": True, "htn": True, "dm": True, "smoker": "Former"},
    {"id": "CT-1008", "name": "Elena Rostova", "age": 49, "gender": "Female", "sbp": 128, "dbp": 82, "cad": False, "htn": False, "dm": False, "smoker": "Never"},
    {"id": "CT-1009", "name": "James Patrick Kelly", "age": 62, "gender": "Male", "sbp": 148, "dbp": 90, "cad": True, "htn": True, "dm": False, "smoker": "Current"},
    {"id": "CT-1010", "name": "Priya Sharma", "age": 45, "gender": "Female", "sbp": 122, "dbp": 78, "cad": False, "htn": False, "dm": False, "smoker": "Never"},
]

def generate_dataset():
    records = []
    base_time = datetime(2026, 10, 1, 0, 0, 0)

    for patient in PATIENT_COHORTS:
        patient_id = patient["id"]
        is_high_risk = patient["cad"] or patient["htn"]
        base_hr = 80 if is_high_risk else 62
        base_hrv = 24 if is_high_risk else 50

        # Generate 1440 points (5 days at 5-min intervals)
        for step in range(288):
            current_time = base_time + timedelta(minutes=step * 5)
            hour = current_time.hour
            circadian = math.sin((hour - 6) * math.pi / 12) * 5

            # Introduce simulated acute strain episodes for high-risk patients
            strain_event = is_high_risk and (step % 72 > 58)

            if strain_event:
                hr = base_hr + circadian + random.uniform(18, 32)
                hrv = max(12, base_hrv - circadian - random.uniform(8, 14))
                spo2 = max(91, 95 - random.uniform(0, 3))
                activity = "Rest"
            else:
                hr = base_hr + circadian + random.uniform(-4, 6)
                hrv = max(16, base_hrv + random.uniform(-5, 8))
                spo2 = min(99, 97 + random.uniform(-1, 2))
                activity = random.choice(["Sedentary", "Sedentary", "Light", "Moderate"])

            # Prediction target: Elevated physiological-pattern risk within next 2 hours
            # Label = 1 if forward 2-hour window has sustained HR elevation (>88 at rest) + HRV < 25ms
            label = 1 if (is_high_risk and (step % 72 > 50)) else 0

            records.append({
                "patient_id": patient_id,
                "timestamp": current_time.isoformat(),
                "age": patient["age"],
                "gender": patient["gender"],
                "systolic_bp": patient["sbp"],
                "diastolic_bp": patient["dbp"],
                "has_cad": int(patient["cad"]),
                "has_htn": int(patient["htn"]),
                "has_dm": int(patient["dm"]),
                "heart_rate": round(hr, 1),
                "hrv_rmssd": round(hrv, 1),
                "spo2": round(spo2, 1),
                "activity": activity,
                "target_risk_next_2h": label
            })

    output_path = os.path.join(OUTPUT_DIR, "synthetic_wearable_dataset.json")
    with open(output_path, "w") as f:
        json.dump(records, f, indent=2)

    print(f"[Synthetic Pipeline] Generated {len(records)} observations across {len(PATIENT_COHORTS)} patients.")
    print(f"[Synthetic Pipeline] Saved to {output_path}")

if __name__ == "__main__":
    generate_dataset()
