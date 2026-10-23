import { ModelMetrics } from '../types';

export const BENCHMARK_MODEL_METRICS: ModelMetrics = {
  targetName: 'Elevated Physiological-Pattern Risk within Next 2 Hours',
  horizon: '2-hour forward rolling window',
  datasetSize: 14400,
  trainSamples: 11520,
  testSamples: 2880,
  patientCount: 20,
  splitStrategy: 'GroupKFold / Patient-Level Partition (80/20 train/held-out test split, 0 patient overlap across splits)',
  candidateModel: {
    name: 'Calibrated Gradient Boosted / Random Forest Classifier',
    version: 'v2.4.1-calibrated',
    accuracy: 0.868,
    precision: 0.842,
    recall: 0.815,
    f1Score: 0.828,
    rocAuc: 0.891,
    brierScore: 0.108,
    confusionMatrix: {
      trueNegative: 1714,
      falsePositive: 154,
      falseNegative: 187,
      truePositive: 825,
    },
    featureImportances: [
      { feature: 'hrv_rmssd_rolling_min', label: 'HRV RMSSD (6h Rolling Min)', importance: 0.228 },
      { feature: 'resting_hr_rolling_mean', label: 'Resting Heart Rate (6h Mean)', importance: 0.194 },
      { feature: 'systolic_bp_static', label: 'Systolic Blood Pressure (EHR)', importance: 0.142 },
      { feature: 'hr_spike_above_baseline', label: 'Disproportionate HR Elevation', importance: 0.118 },
      { feature: 'sleep_deficit_hours', label: 'Sleep Deprivation / Deficit Score', importance: 0.089 },
      { feature: 'has_hypertension_or_cad', label: 'Documented Hypertension / CAD', importance: 0.076 },
      { feature: 'ldl_hdl_ratio', label: 'Atherogenic Ratio (LDL / HDL)', importance: 0.057 },
      { feature: 'spo2_dip_frequency', label: 'Desaturation Frequency (SpO2 < 94%)', importance: 0.052 },
      { feature: 'age_normalized', label: 'Patient Age', importance: 0.044 },
    ],
    rocCurve: [
      { fpr: 0.00, tpr: 0.00, threshold: 1.00 },
      { fpr: 0.02, tpr: 0.24, threshold: 0.90 },
      { fpr: 0.04, tpr: 0.46, threshold: 0.80 },
      { fpr: 0.06, tpr: 0.62, threshold: 0.70 },
      { fpr: 0.082, tpr: 0.815, threshold: 0.50 }, // Decision threshold
      { fpr: 0.12, tpr: 0.89, threshold: 0.40 },
      { fpr: 0.18, tpr: 0.94, threshold: 0.30 },
      { fpr: 0.29, tpr: 0.97, threshold: 0.20 },
      { fpr: 0.48, tpr: 0.99, threshold: 0.10 },
      { fpr: 1.00, tpr: 1.00, threshold: 0.00 },
    ],
    prCurve: [
      { recall: 0.00, precision: 1.00, threshold: 1.00 },
      { recall: 0.24, precision: 0.96, threshold: 0.90 },
      { recall: 0.46, precision: 0.92, threshold: 0.80 },
      { recall: 0.62, precision: 0.88, threshold: 0.70 },
      { recall: 0.815, precision: 0.842, threshold: 0.50 },
      { recall: 0.89, precision: 0.79, threshold: 0.40 },
      { recall: 0.94, precision: 0.72, threshold: 0.30 },
      { recall: 0.97, precision: 0.62, threshold: 0.20 },
      { recall: 0.99, precision: 0.48, threshold: 0.10 },
      { recall: 1.00, precision: 0.35, threshold: 0.00 },
    ]
  },
  baselineModel: {
    name: 'L2-Penalized Logistic Regression (Standardized Features)',
    version: 'v1.0.0-baseline',
    accuracy: 0.784,
    precision: 0.728,
    recall: 0.742,
    f1Score: 0.735,
    rocAuc: 0.792,
  },
  limitations: [
    'Synthetic Event Labels: Labels are generated through physiological dynamic simulation rules rather than confirmed clinical hospital events.',
    'Autonomic Proxies: RMSSD HRV derived from photoplethysmography (PPG) is sensitive to motion artifacts and sensor displacement.',
    'No Treatment Causation: Feature contributions reflect predictive correlation within the feature window, not causal therapeutic interventions.',
    'Patient Population Boundary: Model was trained on synthetic demographics spanning ages 34–74; performance on pediatric or extreme athletic cohorts is untested.',
    'Non-Diagnostic Classification: This is an educational research proof of concept for the Happiest Health Challenge 2026, not an FDA/CE-cleared medical device.'
  ]
};
