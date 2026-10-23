import { PatientEHR, WearableObservation, DigitalTwinState, PredictionOutput, WhatIfSimulationInput, WhatIfSimulationResult, ModelMetrics, StreamStatus } from '../types';
import { SYNTHETIC_PATIENTS, generatePatientTimeSeries } from '../data/syntheticData';
import { BENCHMARK_MODEL_METRICS } from '../data/modelEvaluation';
import { buildDigitalTwinState, calculateDigitalTwinPrediction, runWhatIfSimulation } from '../utils/digitalTwinEngine';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// In-memory cache for smooth responsive transitions
const patientObservationsMap = new Map<string, WearableObservation[]>();

function getLocalObservations(patientId: string): WearableObservation[] {
  if (!patientObservationsMap.has(patientId)) {
    const patient = SYNTHETIC_PATIENTS.find(p => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    patientObservationsMap.set(patientId, generatePatientTimeSeries(patient, 30));
  }
  return patientObservationsMap.get(patientId)!;
}

export const api = {
  async getHealth(): Promise<{ status: string; timestamp: string; version: string; service: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return { status: 'healthy', timestamp: new Date().toISOString(), version: '2.4.0', service: 'CardioTwin AI Engine' };
  },

  async getPatients(): Promise<PatientEHR[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return SYNTHETIC_PATIENTS;
  },

  async getPatient(patientId: string): Promise<PatientEHR | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return SYNTHETIC_PATIENTS.find(p => p.patientId === patientId) || null;
  },

  async getPatientWearables(patientId: string): Promise<WearableObservation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/wearables`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return getLocalObservations(patientId);
  },

  async getPatientTwin(patientId: string): Promise<DigitalTwinState> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/twin`);
      if (res.ok) return await res.json();
    } catch (_) {}
    const patient = SYNTHETIC_PATIENTS.find(p => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    const obs = getLocalObservations(patientId);
    return buildDigitalTwinState(patient, obs);
  },

  async getPatientPrediction(patientId: string): Promise<PredictionOutput> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/prediction`);
      if (res.ok) return await res.json();
    } catch (_) {}
    const patient = SYNTHETIC_PATIENTS.find(p => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    const obs = getLocalObservations(patientId);
    return calculateDigitalTwinPrediction(patient, obs);
  },

  async simulateWhatIf(patientId: string, input: WhatIfSimulationInput): Promise<WhatIfSimulationResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    const patient = SYNTHETIC_PATIENTS.find(p => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    const obs = getLocalObservations(patientId);
    return runWhatIfSimulation(patient, obs, input);
  },

  async getModelMetrics(): Promise<ModelMetrics> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/model/metrics`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return BENCHMARK_MODEL_METRICS;
  },

  async getStreamStatus(): Promise<StreamStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stream/status`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return {
      isRunning: false,
      frequencyMs: 3000,
      activePatientId: 'CT-1001',
      totalPacketsSent: 42,
      lastPacketTimestamp: new Date().toISOString(),
      mode: 'paused'
    };
  },

  async startStream(patientId: string, frequencyMs: number = 3000): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, frequencyMs })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: true, message: `Wearable stream initiated for ${patientId}` };
  },

  async pauseStream(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stream/pause`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: true, message: 'Stream paused' };
  },

  async resetStream(patientId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stream/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    // Reset local map
    patientObservationsMap.delete(patientId);
    return { success: true, message: `Buffer reset for ${patientId}` };
  },

  appendLocalObservation(patientId: string, obs: WearableObservation) {
    const list = getLocalObservations(patientId);
    list.push(obs);
    if (list.length > 50) list.shift();
  }
};
