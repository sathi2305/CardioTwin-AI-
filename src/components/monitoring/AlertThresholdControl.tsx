import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Flame,
  Info
} from 'lucide-react';
import { alertThresholdManager, AlertThresholdSettings } from '../../utils/alertThresholdManager';
import { DigitalTwinState } from '../../types';

interface AlertThresholdControlProps {
  twinState: DigitalTwinState;
  onSimulateHighStrain?: () => void;
}

export const AlertThresholdControl: React.FC<AlertThresholdControlProps> = ({
  twinState,
  onSimulateHighStrain,
}) => {
  const [settings, setSettings] = useState<AlertThresholdSettings>(() =>
    alertThresholdManager.getSettings()
  );
  const [testTriggered, setTestTriggered] = useState(false);

  useEffect(() => {
    const unsub = alertThresholdManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsub();
  }, []);

  const currentRiskPercent = Math.round(
    (twinState.currentPrediction?.riskProbability ?? 0) * 1000
  ) / 10;
  const isExceeded = currentRiskPercent >= settings.riskThresholdPercent;

  const handleThresholdChange = (newVal: number) => {
    alertThresholdManager.setRiskThreshold(newVal);
  };

  const handleToggleEnabled = () => {
    alertThresholdManager.setEnabled(!settings.enabled);
  };

  const handleToggleSound = () => {
    alertThresholdManager.setSoundEnabled(!settings.soundEnabled);
  };

  const handleTestTrigger = () => {
    setTestTriggered(true);
    alertThresholdManager.triggerTestAlert(
      twinState.ehr.fullName,
      twinState.patientId
    );
    setTimeout(() => setTestTriggered(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
      {/* Header and Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isExceeded && settings.enabled
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
            }`}
          >
            {isExceeded && settings.enabled ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <BellRing className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Automated Notification Trigger & Risk Threshold
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  settings.enabled
                    ? isExceeded
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}
              >
                {settings.enabled
                  ? isExceeded
                    ? 'THRESHOLD BREACHED - ALERT ACTIVE'
                    : 'MONITORING - THRESHOLD ARMED'
                  : 'TRIGGER DISABLED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuously monitors predicted autonomic strain probability. Automatically triggers a clinical system toast when risk crosses your threshold.
            </p>
          </div>
        </div>

        {/* Action Buttons: Test Toast & Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
              settings.soundEnabled
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
            }`}
            title={settings.soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-500" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleToggleEnabled}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              settings.enabled
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}
          >
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </button>

          <button
            onClick={handleTestTrigger}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-sm transition-all"
            title="Simulate immediate alert toast"
          >
            {testTriggered ? <Check className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
            <span>{testTriggered ? 'Toast Sent!' : 'Test Alert Toast'}</span>
          </button>
        </div>
      </div>

      {/* Threshold Slider & Presets Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Left: Slider Control */}
        <div className="md:col-span-8 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-500" />
              <span>User-Defined Alert Trigger Threshold:</span>
            </span>
            <div className="flex items-center space-x-1 font-mono">
              <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">
                {settings.riskThresholdPercent}%
              </span>
              <span className="text-[11px] text-slate-400">predicted risk</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="35"
              max="95"
              step="1"
              value={settings.riskThresholdPercent}
              onChange={(e) => handleThresholdChange(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Presets:</span>
            <div className="flex items-center space-x-1.5 font-mono">
              {[50, 65, 75, 80, 85].map((val) => (
                <button
                  key={val}
                  onClick={() => handleThresholdChange(val)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    settings.riskThresholdPercent === val
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {val}% {val === 75 ? '(Default)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Risk vs Threshold Comparison Box */}
        <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Current P(Strain):</span>
            <span
              className={`font-extrabold text-sm ${
                isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {currentRiskPercent.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Alert Trigger:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              ≥ {settings.riskThresholdPercent}%
            </span>
          </div>

          {/* Mini gauge representation */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 relative">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isExceeded ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, currentRiskPercent)}%` }}
            />
          </div>

          <span className="text-[10px] text-slate-400 block pt-0.5">
            {isExceeded
              ? '⚠️ Risk threshold exceeded. Notification toast triggered.'
              : '✅ Current telemetry operates below alert threshold.'}
          </span>
        </div>
      </div>
    </div>
  );
};
