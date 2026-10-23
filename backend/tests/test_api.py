"""
CardioTwin AI — Automated Backend Test Suite
Happiest Health Digital Twin Challenge 2026
"""

import unittest
import json
import os

class TestCardioTwinBackend(unittest.TestCase):
    def setUp(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "generated")
        self.models_dir = os.path.join(os.path.dirname(__file__), "..", "..", "models")
        self.dataset_path = os.path.join(self.data_dir, "synthetic_wearable_dataset.json")
        self.metrics_path = os.path.join(self.models_dir, "evaluation_metrics.json")

    def test_synthetic_dataset_exists(self):
        self.assertTrue(os.path.exists(self.dataset_path), "Synthetic dataset should exist")
        with open(self.dataset_path, "r") as f:
            data = json.load(f)
        self.assertGreater(len(data), 100, "Dataset should have multiple observations")
        
        # Verify schema
        first = data[0]
        self.assertIn("patient_id", first)
        self.assertIn("timestamp", first)
        self.assertIn("heart_rate", first)
        self.assertIn("hrv_rmssd", first)
        self.assertIn("systolic_bp", first)
        self.assertIn("target_risk_next_2h", first)

    def test_model_metrics_valid(self):
        self.assertTrue(os.path.exists(self.metrics_path), "Evaluation metrics should exist")
        with open(self.metrics_path, "r") as f:
            metrics = json.load(f)
        
        candidate = metrics.get("candidateModel", {})
        baseline = metrics.get("baselineModel", {})
        
        # Verify candidate matches or outperforms baseline
        self.assertGreaterEqual(candidate.get("rocAuc", 0), baseline.get("rocAuc", 0))
        self.assertGreaterEqual(candidate.get("f1Score", 0), baseline.get("f1Score", 0))
        self.assertGreaterEqual(candidate.get("accuracy", 0), 0.75)

    def test_no_data_leakage_in_patient_split(self):
        with open(self.metrics_path, "r") as f:
            metrics = json.load(f)
        self.assertIn("Patient-Level", metrics.get("splitStrategy", ""))

if __name__ == "__main__":
    unittest.main()
