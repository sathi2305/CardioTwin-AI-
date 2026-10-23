import { DigitalTwinSnapshot, DigitalTwinState, RiskLevel } from '../types';

const SNAPSHOTS_STORAGE_KEY = 'cardiotwin_snapshots_history';

class DigitalTwinSnapshotStore {
  private snapshots: DigitalTwinSnapshot[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      if (data) {
        this.snapshots = JSON.parse(data);
      }
    } catch (_) {}

    // Seed initial historical snapshots if empty
    if (this.snapshots.length === 0) {
      this.seedInitialSnapshots();
    }
  }

  private seedInitialSnapshots() {
    const baseTime = Date.now() - 3600 * 1000 * 12; // 12 hours ago
    this.snapshots = [
      {
        id: 'snp-CT-1001-01',
        snapshotNumber: 1,
        patientId: 'CT-1001',
        timestamp: new Date(baseTime).toISOString(),
        ehrVersion: 'EHR-2026.09.14',
        observationCount: 30,
        featureVersion: 'feat-v2.4',
        modelVersion: 'v2.4.1-calibrated',
        riskProbability: 0.54,
        riskLevel: 'Elevated',
        twinHealthIndex: 58,
        heartRate: 74,
        hrvRmssd: 28,
        bloodPressure: '146/92 mmHg',
        sleepHours: 6.2,
        isSimulated: false,
        deltaReason: 'Morning baseline synchronization after overnight sleep',
      },
      {
        id: 'snp-CT-1001-02',
        snapshotNumber: 2,
        patientId: 'CT-1001',
        timestamp: new Date(baseTime + 3600 * 1000 * 6).toISOString(),
        ehrVersion: 'EHR-2026.09.14',
        observationCount: 60,
        featureVersion: 'feat-v2.4',
        modelVersion: 'v2.4.1-calibrated',
        riskProbability: 0.58,
        riskLevel: 'Elevated',
        twinHealthIndex: 54,
        heartRate: 78,
        hrvRmssd: 24,
        bloodPressure: '148/94 mmHg',
        sleepHours: 6.2,
        isSimulated: false,
        deltaReason: 'Post-prandial sympathetic elevation and light activity',
      },
      {
        id: 'snp-CT-1001-03',
        snapshotNumber: 3,
        patientId: 'CT-1001',
        timestamp: new Date(baseTime + 3600 * 1000 * 11).toISOString(),
        ehrVersion: 'EHR-2026.09.14',
        observationCount: 90,
        featureVersion: 'feat-v2.4',
        modelVersion: 'v2.4.1-calibrated',
        riskProbability: 0.63,
        riskLevel: 'Elevated',
        twinHealthIndex: 51,
        heartRate: 84,
        hrvRmssd: 20,
        bloodPressure: '150/94 mmHg',
        sleepHours: 6.0,
        isSimulated: false,
        deltaReason: 'Resting tachycardia with depressed vagal RMSSD (<22ms)',
      },
    ];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(this.snapshots.slice(-50)));
    } catch (_) {}
  }

  public getSnapshotsForPatient(patientId: string, twinState?: DigitalTwinState): DigitalTwinSnapshot[] {
    let patientSnaps = this.snapshots.filter((s) => s.patientId === patientId);
    
    // If fewer than 2 snapshots exist for this patient and twinState is provided, seed realistic progression snapshots
    if (patientSnaps.length < 2 && twinState) {
      this.seedSnapshotsForPatient(twinState);
      patientSnaps = this.snapshots.filter((s) => s.patientId === patientId);
    }
    
    return patientSnaps;
  }

  public seedSnapshotsForPatient(twinState: DigitalTwinState) {
    const { ehr, currentPrediction, latestObservation, twinHealthIndex } = twinState;
    const now = Date.now();

    // Snapshot 1: Morning baseline (12 hours ago)
    const snap1: DigitalTwinSnapshot = {
      id: `snp-${ehr.patientId}-base`,
      snapshotNumber: 1,
      patientId: ehr.patientId,
      timestamp: new Date(now - 3600 * 1000 * 12).toISOString(),
      ehrVersion: `EHR-${ehr.lastExamDate}`,
      observationCount: 24,
      featureVersion: 'feat-v2.4',
      modelVersion: 'v2.4.1-calibrated',
      riskProbability: Math.max(0.08, Math.min(0.92, currentPrediction.riskProbability - 0.12)),
      riskLevel: currentPrediction.riskProbability - 0.12 > 0.65 ? 'High' : currentPrediction.riskProbability - 0.12 > 0.45 ? 'Elevated' : currentPrediction.riskProbability - 0.12 > 0.25 ? 'Moderate' : 'Low',
      twinHealthIndex: Math.min(95, twinHealthIndex + 8),
      heartRate: ehr.restingHeartRateBaseline,
      hrvRmssd: ehr.restingHrvBaseline + 4,
      bloodPressure: `${ehr.systolicBP - 6}/${ehr.diastolicBP - 4} mmHg`,
      sleepHours: Math.min(9.0, (latestObservation.sleepDurationHours ?? 7.0) + 1.2),
      isSimulated: false,
      deltaReason: 'Morning basal state following restorative sleep epoch',
    };

    // Snapshot 2: Mid-day post-activity (6 hours ago)
    const snap2: DigitalTwinSnapshot = {
      id: `snp-${ehr.patientId}-mid`,
      snapshotNumber: 2,
      patientId: ehr.patientId,
      timestamp: new Date(now - 3600 * 1000 * 6).toISOString(),
      ehrVersion: `EHR-${ehr.lastExamDate}`,
      observationCount: 54,
      featureVersion: 'feat-v2.4',
      modelVersion: 'v2.4.1-calibrated',
      riskProbability: Math.max(0.1, Math.min(0.94, currentPrediction.riskProbability - 0.04)),
      riskLevel: currentPrediction.riskProbability - 0.04 > 0.65 ? 'High' : currentPrediction.riskProbability - 0.04 > 0.45 ? 'Elevated' : currentPrediction.riskProbability - 0.04 > 0.25 ? 'Moderate' : 'Low',
      twinHealthIndex: Math.max(25, twinHealthIndex + 3),
      heartRate: ehr.restingHeartRateBaseline + 5,
      hrvRmssd: Math.max(12, ehr.restingHrvBaseline - 2),
      bloodPressure: `${ehr.systolicBP}/${ehr.diastolicBP} mmHg`,
      sleepHours: latestObservation.sleepDurationHours ?? 7.0,
      isSimulated: false,
      deltaReason: 'Mid-day physiologic equilibrium and light ambulation',
    };

    // Snapshot 3: Current active twin state
    const snap3: DigitalTwinSnapshot = {
      id: `snp-${ehr.patientId}-curr`,
      snapshotNumber: 3,
      patientId: ehr.patientId,
      timestamp: new Date(now - 3600 * 1000 * 1).toISOString(),
      ehrVersion: `EHR-${ehr.lastExamDate}`,
      observationCount: 90,
      featureVersion: 'feat-v2.4',
      modelVersion: 'v2.4.1-calibrated',
      riskProbability: currentPrediction.riskProbability,
      riskLevel: currentPrediction.riskLevel,
      twinHealthIndex: twinHealthIndex,
      heartRate: latestObservation.heartRate,
      hrvRmssd: latestObservation.hrvRmssd,
      bloodPressure: `${ehr.systolicBP + 4}/${ehr.diastolicBP + 2} mmHg`,
      sleepHours: latestObservation.sleepDurationHours ?? 7.0,
      isSimulated: false,
      deltaReason: 'Active calibrated twin state synchronized with telemetry',
    };

    // Replace or add
    this.snapshots = this.snapshots.filter((s) => s.patientId !== ehr.patientId);
    this.snapshots.push(snap3, snap2, snap1);
    this.saveToStorage();
  }

  public createSnapshot(twinState: DigitalTwinState, note?: string): DigitalTwinSnapshot {
    const existing = this.getSnapshotsForPatient(twinState.patientId);
    const nextNumber = existing.length > 0 ? Math.max(...existing.map((s) => s.snapshotNumber)) + 1 : 1;

    const snapshot: DigitalTwinSnapshot = {
      id: `snp-${twinState.patientId}-${Date.now()}`,
      snapshotNumber: nextNumber,
      patientId: twinState.patientId,
      timestamp: new Date().toISOString(),
      ehrVersion: `EHR-${twinState.ehr.lastExamDate}`,
      observationCount: twinState.recentObservations.length,
      featureVersion: 'feat-v2.4',
      modelVersion: 'v2.4.1-calibrated',
      riskProbability: twinState.currentPrediction.riskProbability,
      riskLevel: twinState.currentPrediction.riskLevel,
      twinHealthIndex: twinState.twinHealthIndex,
      heartRate: twinState.latestObservation.heartRate,
      hrvRmssd: twinState.latestObservation.hrvRmssd,
      bloodPressure: `${twinState.ehr.systolicBP}/${twinState.ehr.diastolicBP} mmHg`,
      sleepHours: twinState.latestObservation?.sleepDurationHours ?? 7.0,
      isSimulated: false,
      deltaReason: note || 'Periodic digital twin rolling state snapshot',
    };

    this.snapshots.unshift(snapshot);
    this.saveToStorage();
    return snapshot;
  }

  public compareSnapshots(snapA: DigitalTwinSnapshot, snapB: DigitalTwinSnapshot) {
    const probDelta = Math.round((snapB.riskProbability - snapA.riskProbability) * 1000) / 1000;
    const probPercentShift = snapA.riskProbability > 0 
      ? Math.round(((snapB.riskProbability - snapA.riskProbability) / snapA.riskProbability) * 1000) / 10
      : 0;
    const hrDelta = snapB.heartRate - snapA.heartRate;
    const hrvDelta = snapB.hrvRmssd - snapA.hrvRmssd;
    const healthDelta = snapB.twinHealthIndex - snapA.twinHealthIndex;
    const sleepDelta = Math.round((snapB.sleepHours - snapA.sleepHours) * 10) / 10;

    // Time elapsed calculation
    const timeA = new Date(snapA.timestamp).getTime();
    const timeB = new Date(snapB.timestamp).getTime();
    const timeElapsedMs = Math.abs(timeB - timeA);
    const totalMinutes = Math.floor(timeElapsedMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    
    let timeElapsedFormatted = '';
    if (days > 0) {
      timeElapsedFormatted = `${days}d ${hours % 24}h elapsed`;
    } else if (hours > 0) {
      timeElapsedFormatted = `${hours}h ${mins}m elapsed`;
    } else {
      timeElapsedFormatted = `${mins}m elapsed`;
    }

    // Hemodynamic / autonomic shift interpretation
    let hemodynamicShift: 'Sympathetic Dominance' | 'Vagal Recovery' | 'Hemodynamic Stability' | 'Hypertensive Surge' = 'Hemodynamic Stability';
    let clinicalSummary = '';

    if (hrDelta >= 6 && hrvDelta <= -4) {
      hemodynamicShift = 'Sympathetic Dominance';
      clinicalSummary = `Autonomic Decompensation: Observed heart rate acceleration (+${hrDelta} bpm) coupled with a marked drop in vagal tone (HRV RMSSD ${hrvDelta} ms). This sympathetic surge corresponds with a +${(probDelta * 100).toFixed(1)}% elevation in predicted 2-hour autonomic strain.`;
    } else if (hrDelta <= -4 && hrvDelta >= 4) {
      hemodynamicShift = 'Vagal Recovery';
      clinicalSummary = `Parasympathetic Restoration: Resting pulse decreased by ${Math.abs(hrDelta)} bpm alongside autonomic vagal recovery (HRV RMSSD +${hrvDelta} ms). Physiological resilience gained +${healthDelta} points, lowering predicted risk by ${Math.abs((probDelta * 100)).toFixed(1)}%.`;
    } else if (probDelta > 0.05) {
      hemodynamicShift = 'Sympathetic Dominance';
      clinicalSummary = `Elevated Strain Trajectory: Digital twin state transitioned toward higher physiological risk (+${(probDelta * 100).toFixed(1)}%), reflecting cumulative sleep debt (${sleepDelta} hrs) and resting vitals variability.`;
    } else if (probDelta < -0.05) {
      hemodynamicShift = 'Vagal Recovery';
      clinicalSummary = `Stabilizing Clinical Trajectory: Digital twin state registered a favorable -${Math.abs((probDelta * 100)).toFixed(1)}% risk reduction with stabilized hemodynamic baselines.`;
    } else {
      hemodynamicShift = 'Hemodynamic Stability';
      clinicalSummary = `Hemodynamic Equilibrium: Vitals and risk probability remained stable within clinically expected circadian variability (ΔHR: ${hrDelta >= 0 ? '+' : ''}${hrDelta} bpm, ΔHRV: ${hrvDelta >= 0 ? '+' : ''}${hrvDelta} ms).`;
    }

    // Extract systolic/diastolic from bloodPressure strings
    const parseBP = (bpStr: string) => {
      const match = bpStr.match(/(\d+)\/(\d+)/);
      return match ? { sys: parseInt(match[1], 10), dia: parseInt(match[2], 10) } : { sys: 120, dia: 80 };
    };

    const bpA = parseBP(snapA.bloodPressure);
    const bpB = parseBP(snapB.bloodPressure);
    const sysDelta = bpB.sys - bpA.sys;
    const diaDelta = bpB.dia - bpA.dia;

    const metrics = [
      {
        id: 'riskProbability',
        category: 'Risk' as const,
        label: 'Predicted 2-Hour Strain Risk',
        valueA: `${(snapA.riskProbability * 100).toFixed(1)}%`,
        valueB: `${(snapB.riskProbability * 100).toFixed(1)}%`,
        unit: '%',
        delta: `${probDelta > 0 ? '+' : ''}${(probDelta * 100).toFixed(1)}%`,
        rawDelta: probDelta,
        direction: (probDelta > 0.02 ? 'unfavorable' : probDelta < -0.02 ? 'favorable' : 'neutral') as 'favorable' | 'unfavorable' | 'neutral',
        clinicalInterpretation: probDelta > 0 ? 'Elevated probability of pre-acute autonomic strain' : 'Reduced decompensation probability',
        targetReference: '< 30.0%',
      },
      {
        id: 'twinHealthIndex',
        category: 'Risk' as const,
        label: 'Physiological Resilience Score',
        valueA: `${snapA.twinHealthIndex} / 100`,
        valueB: `${snapB.twinHealthIndex} / 100`,
        unit: 'pts',
        delta: `${healthDelta > 0 ? '+' : ''}${healthDelta} pts`,
        rawDelta: healthDelta,
        direction: (healthDelta > 2 ? 'favorable' : healthDelta < -2 ? 'unfavorable' : 'neutral') as 'favorable' | 'unfavorable' | 'neutral',
        clinicalInterpretation: healthDelta >= 0 ? 'Enhanced physiological resilience buffer' : 'Depleted physiological autonomic reserves',
        targetReference: '> 70 / 100',
      },
      {
        id: 'heartRate',
        category: 'Vitals' as const,
        label: 'Heart Rate (Pulse Telemetry)',
        valueA: `${snapA.heartRate} bpm`,
        valueB: `${snapB.heartRate} bpm`,
        unit: 'bpm',
        delta: `${hrDelta > 0 ? '+' : ''}${hrDelta} bpm`,
        rawDelta: hrDelta,
        direction: (hrDelta > 4 ? 'unfavorable' : hrDelta < -4 ? 'favorable' : 'neutral') as 'favorable' | 'unfavorable' | 'neutral',
        clinicalInterpretation: hrDelta > 0 ? 'Tachycardic drift / sympathetic activation' : 'Decelerated pulse / parasympathetic dominance',
        targetReference: '60 – 80 bpm',
      },
      {
        id: 'hrvRmssd',
        category: 'Autonomic' as const,
        label: 'Autonomic HRV (RMSSD)',
        valueA: `${snapA.hrvRmssd} ms`,
        valueB: `${snapB.hrvRmssd} ms`,
        unit: 'ms',
        delta: `${hrvDelta > 0 ? '+' : ''}${hrvDelta} ms`,
        rawDelta: hrvDelta,
        direction: (hrvDelta < -3 ? 'unfavorable' : hrvDelta > 3 ? 'favorable' : 'neutral') as 'favorable' | 'unfavorable' | 'neutral',
        clinicalInterpretation: hrvDelta < 0 ? 'Vagal withdrawal / elevated cardiovascular load' : 'Vagal recovery / restorative parasympathetic tone',
        targetReference: '> 25 ms',
      },
      {
        id: 'bloodPressure',
        category: 'Vitals' as const,
        label: 'Cuff Blood Pressure',
        valueA: snapA.bloodPressure,
        valueB: snapB.bloodPressure,
        unit: 'mmHg',
        delta: `${sysDelta > 0 ? '+' : ''}${sysDelta} / ${diaDelta > 0 ? '+' : ''}${diaDelta} mmHg`,
        rawDelta: sysDelta,
        direction: (sysDelta > 4 ? 'unfavorable' : sysDelta < -4 ? 'favorable' : 'neutral') as 'favorable' | 'unfavorable' | 'neutral',
        clinicalInterpretation: sysDelta > 0 ? 'Systolic arterial pressure elevation' : 'Systolic arterial pressure reduction',
        targetReference: '< 130/80 mmHg',
      },
      {
        id: 'sleepHours',
        category: 'Lifestyle' as const,
        label: 'Sleep Duration',
        valueA: `${snapA.sleepHours.toFixed(1)} hrs`,
        valueB: `${snapB.sleepHours.toFixed(1)} hrs`,
        unit: 'hrs',
        delta: `${sleepDelta > 0 ? '+' : ''}${sleepDelta.toFixed(1)} hrs`,
        rawDelta: sleepDelta,
        direction: (sleepDelta < -0.5 ? 'unfavorable' : sleepDelta > 0.5 ? 'favorable' : 'neutral') as 'favorable' | 'unfavorable' | 'neutral',
        clinicalInterpretation: sleepDelta < 0 ? 'Accumulated sleep debt / circadian strain' : 'Restorative sleep epoch restored',
        targetReference: '7.0 – 9.0 hrs',
      },
      {
        id: 'observationCount',
        category: 'Provenance' as const,
        label: 'Observation Window Buffer',
        valueA: `${snapA.observationCount} epochs`,
        valueB: `${snapB.observationCount} epochs`,
        unit: 'epochs',
        delta: `${snapB.observationCount - snapA.observationCount >= 0 ? '+' : ''}${snapB.observationCount - snapA.observationCount}`,
        rawDelta: snapB.observationCount - snapA.observationCount,
        direction: 'neutral' as 'favorable' | 'unfavorable' | 'neutral',
        clinicalInterpretation: 'Rolling sensor observations aggregated into feature window',
        targetReference: 'FIFO Buffer',
      },
    ];

    return {
      snapA,
      snapB,
      probDelta,
      probPercentShift,
      hrDelta,
      hrvDelta,
      healthDelta,
      sleepDelta,
      timeElapsedMs,
      timeElapsedFormatted,
      riskDirection: (probDelta > 0 ? 'Increased' : probDelta < 0 ? 'Decreased' : 'Stable') as 'Increased' | 'Decreased' | 'Stable',
      hemodynamicShift,
      clinicalSummary,
      metrics,
    };
  }
}

export const snapshotStore = new DigitalTwinSnapshotStore();
