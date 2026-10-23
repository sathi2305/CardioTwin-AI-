export type Gender = 'Male' | 'Female' | 'Non-Binary';
export type SmokingStatus = 'Never' | 'Former' | 'Current';
export type ActivityIntensity = 'Rest' | 'Sedentary' | 'Light' | 'Moderate' | 'Vigorous';
export type SignalQuality = 'Optimal' | 'Acceptable' | 'Degraded' | 'Artifact';
export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High';

export type SidebarMode = 'expanded' | 'collapsed' | 'hidden';
export type ThemeMode = 'light' | 'dark' | 'system' | 'high-contrast';
export type ResolvedTheme = 'light' | 'dark' | 'high-contrast';

export type NavTab = 
  | 'overview' 
  | 'patients' 
  | 'monitoring' 
  | 'risk-analysis' 
  | 'simulator' 
  | 'insights' 
  | 'model-lab' 
  | 'timeline' 
  | 'data-quality' 
  | 'reports' 
  | 'notifications' 
  | 'settings' 
  | 'docs';

export interface PatientEHR {
  patientId: string;
  fullName: string;
  age: number;
  gender: Gender;
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  totalCholesterol: number; // mg/dL
  ldlCholesterol: number; // mg/dL
  hdlCholesterol: number; // mg/dL
  triglycerides: number; // mg/dL
  hbA1c: number; // %
  hasHypertension: boolean;
  hasDiabetes: boolean;
  hasArrhythmiaHistory: boolean;
  hasCAD: boolean; // Coronary Artery Disease
  familyHistoryCAD: boolean;
  smokingStatus: SmokingStatus;
  medications: string[];
  baselineRiskCategory: RiskLevel;
  lastExamDate: string;
  bmi: number;
  restingHeartRateBaseline: number;
  restingHrvBaseline: number;
}

export interface WearableObservation {
  id: string;
  patientId: string;
  timestamp: string;
  heartRate: number; // bpm
  hrvRmssd: number; // ms
  sleepDurationHours: number; // hours (last night)
  deepSleepPercent: number; // %
  sleepEfficiencyPercent: number; // %
  stepCountCumulative: number; // daily
  activityIntensity: ActivityIntensity;
  spo2: number; // %
  skinTempDevC: number; // °C deviation from 36.5°C
  signalQuality: SignalQuality;
  isSimulatedAlert: boolean;
  simulatedAlertReason?: string;
}

export interface FeatureContribution {
  feature: string;
  label: string;
  patientValue: string | number;
  baselineValue: string | number;
  contribution: number; // positive increases risk, negative decreases
  description: string;
}

export interface PredictionOutput {
  patientId: string;
  predictionTimestamp: string;
  targetName: string;
  forecastHorizon: string;
  featureWindowDescription: string;
  riskProbability: number; // 0.0 - 1.0 calibrated probability
  riskLevel: RiskLevel;
  modelConfidence: number; // 0.0 - 1.0 confidence score
  baselineModelProbability: number; // baseline comparison
  oddsRatioChange: number;
  thresholdUsed: number;
  featureContributions: FeatureContribution[];
  dataFreshnessSeconds: number;
  missingDataIndicators: string[];
  clinicalDisclaimer: string;
}

export interface DigitalTwinState {
  patientId: string;
  ehr: PatientEHR;
  latestObservation: WearableObservation;
  recentObservations: WearableObservation[]; // 24-48 observation rolling window
  currentPrediction: PredictionOutput;
  syncStatus: 'Synchronized' | 'Updating' | 'Stale' | 'Offline';
  lastSynchronizedAt: string;
  dataQualityScore: number; // 0 - 100
  twinHealthIndex: number; // 0 - 100 physiological resilience score
}

export interface DigitalTwinSnapshot {
  id: string;
  snapshotNumber: number;
  patientId: string;
  timestamp: string;
  ehrVersion: string;
  observationCount: number;
  featureVersion: string;
  modelVersion: string;
  riskProbability: number;
  riskLevel: RiskLevel;
  twinHealthIndex: number;
  heartRate: number;
  hrvRmssd: number;
  bloodPressure: string;
  sleepHours: number;
  isSimulated: boolean;
  deltaReason?: string;
}

export interface WhatIfSimulationInput {
  patientId: string;
  deltaSleepHours: number; // e.g. -2 to +3
  overrideActivityIntensity?: ActivityIntensity;
  deltaHeartRateBpm: number; // e.g. -15 to +30
  deltaHrvMs: number; // e.g. -20 to +25
  deltaSystolicBP: number; // e.g. -25 to +30
  smokingStatus?: SmokingStatus;
  adhereMedication?: boolean;
}

export interface WhatIfSimulationResult {
  patientId: string;
  baselinePrediction: PredictionOutput;
  simulatedPrediction: PredictionOutput;
  probabilityDelta: number; // simulated - baseline
  percentChange: number;
  isOutOfDistribution: boolean;
  warnings: string[];
  keyShifts: {
    feature: string;
    from: string | number;
    to: string | number;
    impact: 'Increased Risk' | 'Decreased Risk' | 'Neutral';
  }[];
}

export interface SavedScenario {
  id: string;
  name: string;
  patientId: string;
  createdAt: string;
  input: WhatIfSimulationInput;
  result: WhatIfSimulationResult;
}

export interface AIInsight {
  id: string;
  title: string;
  category: 'Autonomic' | 'Hemodynamic' | 'Lifestyle' | 'Model';
  supportingMetrics: string;
  period: string;
  timestamp: string;
  severity: 'normal' | 'caution' | 'alert' | 'positive';
  explanation: string;
  dataQualityStatus: string;
  confidenceScore?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  patientId?: string;
  read: boolean;
  category: 'Stream' | 'Risk' | 'Twin' | 'Report' | 'Quality';
}

export interface ModelMetrics {
  targetName: string;
  horizon: string;
  datasetSize: number;
  trainSamples: number;
  testSamples: number;
  patientCount: number;
  splitStrategy: string;
  candidateModel: {
    name: string;
    version: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
    brierScore: number;
    confusionMatrix: {
      trueNegative: number;
      falsePositive: number;
      falseNegative: number;
      truePositive: number;
    };
    featureImportances: {
      feature: string;
      label: string;
      importance: number;
    }[];
    rocCurve: { fpr: number; tpr: number; threshold: number }[];
    prCurve: { recall: number; precision: number; threshold: number }[];
  };
  baselineModel: {
    name: string;
    version: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  };
  limitations: string[];
}

export interface StreamStatus {
  isRunning: boolean;
  frequencyMs: number;
  activePatientId: string;
  totalPacketsSent: number;
  lastPacketTimestamp: string | null;
  mode: 'live-stream' | 'replay' | 'paused';
}
