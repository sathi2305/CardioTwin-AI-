"""
CardioTwin AI — Machine Learning Model Training & Evaluation Pipeline
Happiest Health Digital Twin Challenge 2026

Trains and compares:
1. Baseline: Standardized Logistic Regression
2. Candidate: Calibrated Random Forest Classifier / GBDT

Enforces Patient-Level GroupKFold partitioning to ensure zero data leakage.
"""

import json
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, brier_score_loss, confusion_matrix, roc_curve, precision_recall_curve
)
import joblib

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "generated", "synthetic_wearable_dataset.json")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_and_evaluate():
    print(f"[ML Pipeline] Loading dataset from {DATA_PATH}...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    with open(DATA_PATH, "r") as f:
        records = json.load(f)

    df = pd.DataFrame(records)
    print(f"[ML Pipeline] Loaded {len(df)} observations across {df['patient_id'].nunique()} patients.")

    # Feature definitions
    feature_cols = [
        "age", "systolic_bp", "diastolic_bp", "has_cad", "has_htn", "has_dm",
        "heart_rate", "hrv_rmssd", "spo2"
    ]
    target_col = "target_risk_next_2h"

    # Patient-level partition (80% train patients, 20% held-out test patients)
    unique_patients = df["patient_id"].unique()
    np.random.seed(42)
    shuffled_patients = np.random.permutation(unique_patients)
    n_train = int(len(unique_patients) * 0.8)
    train_patients = set(shuffled_patients[:n_train])
    test_patients = set(shuffled_patients[n_train:])

    train_mask = df["patient_id"].isin(train_patients)
    test_mask = df["patient_id"].isin(test_patients)

    X_train, y_train = df.loc[train_mask, feature_cols], df.loc[train_mask, target_col]
    X_test, y_test = df.loc[test_mask, feature_cols], df.loc[test_mask, target_col]

    print(f"[ML Pipeline] Train samples: {len(X_train)} (Patients: {len(train_patients)})")
    print(f"[ML Pipeline] Test samples: {len(X_test)} (Patients: {len(test_patients)})")

    # 1. Baseline Model: Standardized Logistic Regression
    baseline_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(random_state=42, max_iter=500))
    ])
    baseline_pipe.fit(X_train, y_train)
    y_pred_base = baseline_pipe.predict(X_test)
    y_prob_base = baseline_pipe.predict_proba(X_test)[:, 1]

    base_acc = accuracy_score(y_test, y_pred_base)
    base_prec = precision_score(y_test, y_pred_base, zero_division=0)
    base_rec = recall_score(y_test, y_pred_base, zero_division=0)
    base_f1 = f1_score(y_test, y_pred_base, zero_division=0)
    base_auc = roc_auc_score(y_test, y_prob_base)

    # 2. Candidate Model: Calibrated Random Forest Classifier
    rf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    calibrated_rf = CalibratedClassifierCV(estimator=rf, cv=3)
    calibrated_rf.fit(X_train, y_train)

    y_pred_cand = calibrated_rf.predict(X_test)
    y_prob_cand = calibrated_rf.predict_proba(X_test)[:, 1]

    cand_acc = accuracy_score(y_test, y_pred_cand)
    cand_prec = precision_score(y_test, y_pred_cand, zero_division=0)
    cand_rec = recall_score(y_test, y_pred_cand, zero_division=0)
    cand_f1 = f1_score(y_test, y_pred_cand, zero_division=0)
    cand_auc = roc_auc_score(y_test, y_prob_cand)
    cand_brier = brier_score_loss(y_test, y_prob_cand)

    cm = confusion_matrix(y_test, y_pred_cand)
    tn, fp, fn, tp = cm.ravel()

    # Save fitted model artifact
    model_artifact_path = os.path.join(MODELS_DIR, "cardiotwin_pipeline.joblib")
    joblib.dump(calibrated_rf, model_artifact_path)
    print(f"[ML Pipeline] Saved fitted pipeline to {model_artifact_path}")

    # Save evaluation metrics
    metrics = {
        "targetName": "Elevated Physiological-Pattern Risk within Next 2 Hours",
        "horizon": "2-hour forward rolling window",
        "datasetSize": len(df),
        "trainSamples": len(X_train),
        "testSamples": len(X_test),
        "patientCount": len(unique_patients),
        "splitStrategy": "Patient-Level Partitioning (80/20 train/test, 0 patient overlap)",
        "candidateModel": {
            "name": "Calibrated Random Forest Classifier",
            "version": "v2.4.1",
            "accuracy": round(float(cand_acc), 3),
            "precision": round(float(cand_prec), 3),
            "recall": round(float(cand_rec), 3),
            "f1Score": round(float(cand_f1), 3),
            "rocAuc": round(float(cand_auc), 3),
            "brierScore": round(float(cand_brier), 3),
            "confusionMatrix": {
                "trueNegative": int(tn),
                "falsePositive": int(fp),
                "falseNegative": int(fn),
                "truePositive": int(tp)
            }
        },
        "baselineModel": {
            "name": "Standardized Logistic Regression",
            "version": "v1.0.0-baseline",
            "accuracy": round(float(base_acc), 3),
            "precision": round(float(base_prec), 3),
            "recall": round(float(base_rec), 3),
            "f1Score": round(float(base_f1), 3),
            "rocAuc": round(float(base_auc), 3)
        }
    }

    metrics_file = os.path.join(MODELS_DIR, "evaluation_metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"[ML Pipeline] Candidate ROC-AUC: {cand_auc:.3f} (Baseline: {base_auc:.3f})")
    print(f"[ML Pipeline] Candidate F1: {cand_f1:.3f} (Baseline: {base_f1:.3f})")
    print(f"[ML Pipeline] Evaluation metrics saved to {metrics_file}")

if __name__ == "__main__":
    train_and_evaluate()
