import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  Heart, 
  Activity, 
  Zap, 
  Footprints, 
  Thermometer, 
  Signal, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { DigitalTwinState, WearableObservation } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { HeartRateChart } from '../components/charts/HeartRateChart';
import { HrvChart } from '../components/charts/HrvChart';
import { ECGVisualizer } from '../components/charts/ECGVisualizer';
import { AlertThresholdControl } from '../components/monitoring/AlertThresholdControl';
import { useLanguage } from '../context/LanguageContext';

interface MonitoringPageProps {
  twinState: DigitalTwinState;
  isStreaming: boolean;
  onToggleStream: () => void;
  onResetStream: () => void;
  onFrequencyChange?: (ms: number) => void;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({
  twinState,
  isStreaming,
  onToggleStream,
  onResetStream,
}) => {
  const { ehr, latestObservation, recentObservations } = twinState;
  const { t } = useLanguage();
  const [streamSpeed, setStreamSpeed] = useState<number>(3000);

  return (
    <div className="space-y-6">
      {/* Stream Control Deck */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className={`w-5 h-5 ${isStreaming ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('nav.monitoring', 'Live Wearable Sensor Telemetry')}
            </h2>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isStreaming
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isStreaming ? t('status.live', 'STREAMING ACTIVE') : 'PAUSED'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Simulating high-frequency multi-sensor wearable telemetry (PPG pulse rate, HRV RMSSD, tri-axial accelerometer activity, and SpO2) synchronized with twin state.
          </p>
        </div>

        {/* Buttons & Speed Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="px-2 text-[10px] font-mono">Interval:</span>
            {[1000, 2000, 3000, 5000].map((ms) => (
              <button
                key={ms}
                onClick={() => setStreamSpeed(ms)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                  streamSpeed === ms
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>

          <button
            onClick={onToggleStream}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-md ${
              isStreaming
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>{t('header.streamPause', 'Pause Stream')}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{t('header.streamStart', 'Start Live Stream')}</span>
              </>
            )}
          </button>

          <button
            onClick={onResetStream}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('header.resetBuffer', 'Reset Buffer')}</span>
          </button>
        </div>
      </div>

      {/* Automated Clinical Alert Trigger & Threshold Controller */}
      <AlertThresholdControl twinState={twinState} />

      {/* Streaming Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Heart Rate"
          value={latestObservation.heartRate}
          unit="bpm"
          icon={Heart}
          statusColor={latestObservation.heartRate > 95 ? 'rose' : latestObservation.heartRate > 80 ? 'amber' : 'cyan'}
          subValue={`Target baseline: ${ehr.restingHeartRateBaseline} bpm`}
          trend={latestObservation.heartRate > ehr.restingHeartRateBaseline + 5 ? 'up' : 'neutral'}
          trendValue={`+${Math.max(0, latestObservation.heartRate - ehr.restingHeartRateBaseline)} bpm`}
        />

        <StatCard
          label="HRV RMSSD"
          value={latestObservation.hrvRmssd}
          unit="ms"
          icon={Activity}
          statusColor={latestObservation.hrvRmssd < 25 ? 'amber' : 'teal'}
          subValue={`Vagal norm: ${ehr.restingHrvBaseline} ms`}
          trend={latestObservation.hrvRmssd < 25 ? 'down' : 'neutral'}
          trendValue={latestObservation.hrvRmssd < 25 ? 'Sympathetic strain' : 'Vagal tone'}
        />

        <StatCard
          label="Blood Oxygen (SpO2)"
          value={`${latestObservation.spo2}%`}
          icon={Zap}
          statusColor={latestObservation.spo2 < 95 ? 'amber' : 'emerald'}
          subValue="Photoplethysmography sensor"
          trend={latestObservation.spo2 < 94 ? 'down' : 'neutral'}
          trendValue={latestObservation.spo2 < 94 ? 'Mild hypoxia dip' : 'Optimal'}
        />

        <StatCard
          label="Cumulative Steps"
          value={latestObservation.stepCountCumulative.toLocaleString()}
          unit="steps"
          icon={Footprints}
          statusColor="purple"
          subValue={`Activity: ${latestObservation.activityIntensity}`}
          trend="neutral"
          trendValue="Daily target: 8,000"
        />
      </div>

      {/* Real-Time Waveform Monitor */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {t('overview.ecgStrip', 'Continuous Real-Time PPG Rhythm Strip')}
            </h3>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Signal: <strong className="text-emerald-600 dark:text-emerald-400">{latestObservation.signalQuality}</strong></span>
            <span>Lead: Lead II (Simulated)</span>
            <span>Gain: 1.0x</span>
          </div>
        </div>
        <ECGVisualizer
          heartRate={latestObservation.heartRate}
          isStreaming={isStreaming}
          isAlert={latestObservation.isSimulatedAlert}
        />
      </div>

      {/* Synchronized Live Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('overview.hrDynamics', 'Live Heart Rate Rolling Stream')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Buffered sliding window (Last {recentObservations.length} samples)</p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              {latestObservation.heartRate} bpm
            </span>
          </div>
          <HeartRateChart observations={recentObservations} baselineHR={ehr.restingHeartRateBaseline} />
        </div>

        <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('overview.hrvModulation', 'Live HRV Autonomic Stability')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Parasympathetic modulation & strain threshold (&lt;25 ms)</p>
            </div>
            <span className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded">
              {latestObservation.hrvRmssd} ms
            </span>
          </div>
          <HrvChart observations={recentObservations} baselineHrv={ehr.restingHrvBaseline} />
        </div>
      </div>

      {/* Streaming Telemetry Packet Inspector */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Inbound Sensor Observation Log</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Buffer: {recentObservations.length} packets retained | Retention policy: FIFO
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-[#0b1224] text-slate-600 dark:text-slate-400 text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">HR (bpm)</th>
                <th className="py-2.5 px-3">HRV (ms)</th>
                <th className="py-2.5 px-3">SpO2 (%)</th>
                <th className="py-2.5 px-3">Activity</th>
                <th className="py-2.5 px-3">Steps</th>
                <th className="py-2.5 px-3">Signal Quality</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentObservations.slice(-6).reverse().map((obs) => (
                <tr key={obs.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                    {new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className={`py-2 px-3 font-bold ${obs.heartRate > 95 ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-300'}`}>
                    {obs.heartRate}
                  </td>
                  <td className={`py-2 px-3 font-bold ${obs.hrvRmssd < 25 ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-300'}`}>
                    {obs.hrvRmssd}
                  </td>
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{obs.spo2}%</td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{obs.activityIntensity}</td>
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{obs.stepCountCumulative}</td>
                  <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">{obs.signalQuality}</td>
                  <td className="py-2 px-3">
                    {obs.isSimulatedAlert ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40">
                        ALERT
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        NORMAL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
