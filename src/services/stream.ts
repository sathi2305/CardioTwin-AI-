import { WearableObservation, ActivityIntensity, SignalQuality } from '../types';
import { api } from './api';

export type StreamCallback = (observation: WearableObservation) => void;

class WearableStreamManager {
  private eventSource: EventSource | null = null;
  private fallbackTimer: NodeJS.Timeout | null = null;
  private isStreaming = false;
  private currentPatientId = 'CT-1001';
  private frequencyMs = 3000;
  private subscribers: Set<StreamCallback> = new Set();
  private packetCount = 0;

  public subscribe(cb: StreamCallback): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public getStatus() {
    return {
      isStreaming: this.isStreaming,
      patientId: this.currentPatientId,
      frequencyMs: this.frequencyMs,
      packetCount: this.packetCount
    };
  }

  public async start(patientId: string, frequencyMs: number = 3000) {
    this.currentPatientId = patientId;
    this.frequencyMs = frequencyMs;
    this.isStreaming = true;

    try {
      await api.startStream(patientId, frequencyMs);
    } catch (_) {}

    // Setup SSE connection if available
    this.connectSSE();
  }

  private connectSSE() {
    this.cleanup();
    this.isStreaming = true;

    try {
      const url = `/api/stream/events?patientId=${encodeURIComponent(this.currentPatientId)}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          // Ignore non-observation events or connection handshakes
          if (!packet || packet.type === 'connected' || typeof packet.heartRate !== 'number') {
            return;
          }
          this.broadcastPacket(packet as WearableObservation);
        } catch (_) {}
      };

      this.eventSource.onerror = () => {
        // Fall back to client simulation if SSE fails or disconnects
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        if (this.isStreaming && !this.fallbackTimer) {
          this.startFallbackGenerator();
        }
      };
    } catch (e) {
      this.startFallbackGenerator();
    }
  }

  private startFallbackGenerator() {
    if (this.fallbackTimer) clearInterval(this.fallbackTimer);

    this.fallbackTimer = setInterval(() => {
      if (!this.isStreaming) return;

      const now = new Date().toISOString();
      this.packetCount++;

      // Realistically generate stream packet based on current patient profile
      const isHighRisk = this.currentPatientId === 'CT-1001' || this.currentPatientId === 'CT-1003' || this.currentPatientId === 'CT-1007';
      const baseHR = isHighRisk ? 82 : 64;
      const baseHRV = isHighRisk ? 22 : 48;

      const randomJitter = (Math.random() - 0.5) * 6;
      const hr = Math.round(baseHR + randomJitter + (Math.sin(this.packetCount * 0.3) * 8));
      const hrv = Math.round(Math.max(14, baseHRV + ((Math.random() - 0.5) * 5) - (Math.sin(this.packetCount * 0.3) * 6)));
      const spo2 = Math.round((97 + (Math.random() * 2 - 1)) * 10) / 10;
      
      const activities: ActivityIntensity[] = ['Sedentary', 'Sedentary', 'Light', 'Moderate', 'Rest'];
      const activity = activities[this.packetCount % activities.length];

      const isAlert = hr > 95 && hrv < 24 && (activity === 'Rest' || activity === 'Sedentary');

      const observation: WearableObservation = {
        id: `stream-${this.currentPatientId}-${Date.now()}`,
        patientId: this.currentPatientId,
        timestamp: now,
        heartRate: hr,
        hrvRmssd: hrv,
        sleepDurationHours: 6.5,
        deepSleepPercent: 19,
        sleepEfficiencyPercent: 84,
        stepCountCumulative: 5400 + (this.packetCount * 12),
        activityIntensity: activity,
        spo2,
        skinTempDevC: Math.round(((Math.random() * 0.4) - 0.2) * 100) / 100,
        signalQuality: 'Optimal' as SignalQuality,
        isSimulatedAlert: isAlert,
        simulatedAlertReason: isAlert ? 'Streaming Alert: Tachycardia + Decreased HRV Autonomic Dip' : undefined
      };

      this.broadcastPacket(observation);
    }, this.frequencyMs);
  }

  private broadcastPacket(observation: WearableObservation) {
    api.appendLocalObservation(this.currentPatientId, observation);
    this.subscribers.forEach(cb => {
      try {
        cb(observation);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }

  public pause() {
    this.isStreaming = false;
    this.cleanup();
    api.pauseStream().catch(() => {});
  }

  public reset(patientId?: string) {
    const target = patientId || this.currentPatientId;
    this.packetCount = 0;
    this.cleanup();
    this.isStreaming = false;
    api.resetStream(target).catch(() => {});
  }

  private cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}

export const wearableStream = new WearableStreamManager();
