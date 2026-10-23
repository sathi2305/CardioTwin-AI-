import { DigitalTwinState } from '../types';

export interface AlertThresholdSettings {
  riskThresholdPercent: number; // e.g. 75 (0 - 100)
  enabled: boolean;
  soundEnabled: boolean;
  cooldownSeconds: number; // minimum seconds between repeated toasts
}

export interface ThresholdAlertEvent {
  id: string;
  patientId: string;
  patientName: string;
  riskProbabilityPercent: number;
  thresholdPercent: number;
  timestamp: string;
  title: string;
  message: string;
  severity: 'alert';
}

const SETTINGS_KEY = 'cardiotwin_alert_threshold_settings';

class AlertThresholdManager {
  private settings: AlertThresholdSettings = {
    riskThresholdPercent: 75,
    enabled: true,
    soundEnabled: true,
    cooldownSeconds: 20,
  };

  private lastTriggeredTime = 0;
  private lastTriggeredPatient = '';
  private subscribers: Set<(settings: AlertThresholdSettings) => void> = new Set();
  private alertListeners: Set<(event: ThresholdAlertEvent) => void> = new Set();

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        this.settings = { ...this.settings, ...JSON.parse(data) };
      }
    } catch (_) {}
  }

  private saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (_) {}
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => cb({ ...this.settings }));
  }

  public getSettings(): AlertThresholdSettings {
    return { ...this.settings };
  }

  public subscribe(cb: (settings: AlertThresholdSettings) => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public onAlert(cb: (event: ThresholdAlertEvent) => void): () => void {
    this.alertListeners.add(cb);
    return () => {
      this.alertListeners.delete(cb);
    };
  }

  public setRiskThreshold(percent: number) {
    const clamped = Math.max(20, Math.min(95, Math.round(percent)));
    this.settings.riskThresholdPercent = clamped;
    this.saveSettings();
  }

  public setEnabled(enabled: boolean) {
    this.settings.enabled = enabled;
    this.saveSettings();
  }

  public setSoundEnabled(soundEnabled: boolean) {
    this.settings.soundEnabled = soundEnabled;
    this.saveSettings();
  }

  public playAlertSound() {
    if (!this.settings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(660, ctx.currentTime); // E5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(554, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  }

  /**
   * Evaluates the active digital twin state and triggers an automated notification if threshold exceeded
   */
  public evaluateTwinState(twinState: DigitalTwinState): ThresholdAlertEvent | null {
    if (!this.settings.enabled || !twinState) return null;

    const currentRiskProb = twinState.currentPrediction?.riskProbability;
    if (typeof currentRiskProb !== 'number') return null;

    const currentPercent = Math.round(currentRiskProb * 1000) / 10;
    const threshold = this.settings.riskThresholdPercent;

    // Check if current predicted risk probability exceeds the user-defined threshold
    if (currentPercent >= threshold) {
      const now = Date.now();
      const elapsedSeconds = (now - this.lastTriggeredTime) / 1000;
      const samePatient = this.lastTriggeredPatient === twinState.patientId;

      // Throttle alerts per patient to prevent notification flooding while stream is active
      if (samePatient && elapsedSeconds < this.settings.cooldownSeconds) {
        return null;
      }

      this.lastTriggeredTime = now;
      this.lastTriggeredPatient = twinState.patientId;

      const event: ThresholdAlertEvent = {
        id: `alert-${now}`,
        patientId: twinState.patientId,
        patientName: twinState.ehr?.fullName || twinState.patientId,
        riskProbabilityPercent: currentPercent,
        thresholdPercent: threshold,
        timestamp: new Date().toISOString(),
        title: `High Risk Threshold Exceeded (${currentPercent.toFixed(1)}%)`,
        message: `Digital Twin risk probability for ${twinState.ehr?.fullName || twinState.patientId} has reached ${currentPercent.toFixed(1)}%, exceeding your alert threshold of ${threshold}%.`,
        severity: 'alert',
      };

      // Play alert chime
      this.playAlertSound();

      // Dispatch to listeners
      this.alertListeners.forEach((cb) => cb(event));

      return event;
    }

    return null;
  }

  /**
   * For user testing: triggers a simulated alert event immediately
   */
  public triggerTestAlert(patientName: string = 'Eleanor Vance', patientId: string = 'CT-1001') {
    const testRisk = Math.max(this.settings.riskThresholdPercent + 3.2, 78.5);
    const event: ThresholdAlertEvent = {
      id: `alert-test-${Date.now()}`,
      patientId,
      patientName,
      riskProbabilityPercent: testRisk,
      thresholdPercent: this.settings.riskThresholdPercent,
      timestamp: new Date().toISOString(),
      title: `High Risk Threshold Exceeded (${testRisk.toFixed(1)}%)`,
      message: `Digital Twin risk probability for ${patientName} has reached ${testRisk.toFixed(1)}%, exceeding your alert threshold of ${this.settings.riskThresholdPercent}%.`,
      severity: 'alert',
    };

    this.playAlertSound();
    this.alertListeners.forEach((cb) => cb(event));
    return event;
  }
}

export const alertThresholdManager = new AlertThresholdManager();
