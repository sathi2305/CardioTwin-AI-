import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Moon, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Clock, 
  SlidersHorizontal 
} from 'lucide-react';
import { DigitalTwinState, NavTab } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { HeartRateChart } from '../components/charts/HeartRateChart';
import { HrvChart } from '../components/charts/HrvChart';
import { ECGVisualizer } from '../components/charts/ECGVisualizer';
import { HealthcareLanguageAssistant } from '../components/twin/HealthcareLanguageAssistant';
import { useLanguage } from '../context/LanguageContext';

interface OverviewPageProps {
  twinState: DigitalTwinState;
  isStreaming: boolean;
  onNavigateTab: (tab: NavTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ twinState, isStreaming, onNavigateTab }) => {
  const { ehr, latestObservation, recentObservations, currentPrediction } = twinState;
  const { t, formatNumber, formatPercent } = useLanguage();

  // Customizable widget toggles
  const [showVitals, setShowVitals] = useState(true);
  const [showECG, setShowECG] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [timeWindow, setTimeWindow] = useState<'1h' | '6h' | '24h'>('1h');
  const [showWidgetControls, setShowWidgetControls] = useState(false);

  const hrStatusColor = latestObservation.heartRate > 95 ? 'rose' : latestObservation.heartRate > 80 ? 'amber' : 'cyan';
  const hrvStatusColor = latestObservation.hrvRmssd < 25 ? 'amber' : 'teal';

  // Filter observations based on time window
  const windowCount = timeWindow === '1h' ? 12 : timeWindow === '6h' ? 24 : 36;
  const filteredObservations = recentObservations.slice(-windowCount);

  return (
    <div className="space-y-6">
      {/* Educational & Digital Twin Synchronization Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/30 p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {t('overview.bannerTitle', 'CardioTwin AI — Digital Twin Synchronization Active')}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                {t('overview.cohortValidated', 'Synthetic Cohort Validated')}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-4xl leading-relaxed">
              Fusing longitudinal EHR records with streaming photoplethysmography (PPG) and accelerometer telemetry for synthetic subject{' '}
              <strong className="text-cyan-600 dark:text-cyan-400">{ehr.fullName} ({ehr.patientId})</strong>. Predicting 2-hour forward elevated physiological pattern risk with calibrated model confidence.
            </p>
          </div>
        </div>

        {/* Time Window & Widget Customize Controls */}
        <div className="flex items-center space-x-2">
          {/* Time window selector */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {(['1h', '6h', '24h'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                  timeWindow === w
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowWidgetControls(!showWidgetControls)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs flex items-center space-x-1"
            title="Customize Dashboard Layout"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">{t('overview.customize', 'Customize')}</span>
          </button>
        </div>
      </div>

      {/* Widget Visibility Drawer if open */}
      {showWidgetControls && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md animate-in fade-in duration-150">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Dashboard Widgets:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowVitals(!showVitals)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${
                showVitals ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              {showVitals ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{t('overview.keyVitals', 'Key Vitals')}</span>
            </button>
            <button
              onClick={() => setShowECG(!showECG)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${
                showECG ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              {showECG ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{t('overview.ecgStrip', 'ECG Strip')}</span>
            </button>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${
                showCharts ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              {showCharts ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{t('overview.trendCharts', 'Trend Charts')}</span>
            </button>
            <button
              onClick={() => setShowEvents(!showEvents)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 ${
                showEvents ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              {showEvents ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{t('overview.eventStream', 'Event Stream')}</span>
            </button>
          </div>
          <button
            onClick={() => {
              setShowVitals(true);
              setShowECG(true);
              setShowCharts(true);
              setShowEvents(true);
            }}
            className="text-[11px] text-slate-400 hover:text-cyan-500 underline"
          >
            {t('overview.resetWidgets', 'Reset Widgets')}
          </button>
        </div>
      )}

      {/* Patient Demographic Summary Card */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-cyan-600 dark:text-cyan-400">
            {ehr.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">{ehr.fullName}</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">ID: {ehr.patientId}</span>
              <Badge riskLevel={ehr.baselineRiskCategory}>{ehr.baselineRiskCategory} Risk Cohort</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Age: <strong className="text-slate-800 dark:text-slate-200">{ehr.age} yrs</strong> ({ehr.gender})</span>
              <span>•</span>
              <span>BMI: <strong className="text-slate-800 dark:text-slate-200">{ehr.bmi}</strong></span>
              <span>•</span>
              <span>Hypertension: <strong className={ehr.hasHypertension ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}>{ehr.hasHypertension ? 'Yes' : 'No'}</strong></span>
              <span>•</span>
              <span>CAD History: <strong className={ehr.hasCAD ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>{ehr.hasCAD ? 'Yes' : 'No'}</strong></span>
              <span>•</span>
              <span>Smoking: <strong className="text-slate-800 dark:text-slate-200">{ehr.smokingStatus}</strong></span>
            </div>
          </div>
        </div>

        {/* Current Predicted Risk Display */}
        <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">
              {t('overview.predictedRisk', 'Predicted 2-Hour Risk')}
            </span>
            <div className="flex items-baseline space-x-1.5 justify-end mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                {formatPercent ? formatPercent(currentPrediction.riskProbability * 100, 1) : `${(currentPrediction.riskProbability * 100).toFixed(1)}%`}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('overview.prob', 'prob')}</span>
            </div>
          </div>
          <Badge riskLevel={currentPrediction.riskLevel} size="lg">
            {currentPrediction.riskLevel} Risk
          </Badge>
          <button
            onClick={() => onNavigateTab('risk-analysis')}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
          >
            {t('overview.explain', 'Explain →')}
          </button>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      {showVitals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t('vital.heartRate', 'Heart Rate')}
            value={latestObservation.heartRate}
            unit="bpm"
            icon={Heart}
            statusColor={hrStatusColor}
            subValue={`${t('overview.restingBaseline', 'Resting Baseline')}: ${ehr.restingHeartRateBaseline} bpm`}
            trend={latestObservation.heartRate > ehr.restingHeartRateBaseline + 5 ? 'up' : 'neutral'}
            trendValue={`+${Math.max(0, latestObservation.heartRate - ehr.restingHeartRateBaseline)} bpm`}
            tooltip="Real-time simulated photoplethysmography (PPG) pulse rate"
          />

          <StatCard
            label={t('vital.hrv', 'HRV (RMSSD)')}
            value={latestObservation.hrvRmssd}
            unit="ms"
            icon={Activity}
            statusColor={hrvStatusColor}
            subValue={`${t('overview.autonomicNorm', 'Autonomic Norm')}: ${ehr.restingHrvBaseline} ms`}
            trend={latestObservation.hrvRmssd < 25 ? 'down' : 'neutral'}
            trendValue={latestObservation.hrvRmssd < 25 ? 'Autonomic Strain' : 'Restorative'}
            tooltip="Root Mean Square of Successive Differences (Parasympathetic vagal tone marker)"
          />

          <StatCard
            label={t('vital.bloodPressure', 'Blood Pressure (BP)')}
            value={`${ehr.systolicBP}/${ehr.diastolicBP}`}
            unit="mmHg"
            icon={ShieldCheck}
            statusColor={ehr.systolicBP >= 140 ? 'rose' : ehr.systolicBP >= 130 ? 'amber' : 'teal'}
            subValue={`${t('overview.examDate', 'Exam Date')}: ${ehr.lastExamDate}`}
            trend={ehr.systolicBP >= 140 ? 'up' : 'neutral'}
            trendValue={ehr.systolicBP >= 140 ? 'Stage 2 HTN' : 'Controlled'}
            tooltip="Most recent clinical cuff measurement from longitudinal EHR record"
          />

          <StatCard
            label={t('vital.sleepDuration', 'Sleep Recovery')}
            value={(latestObservation?.sleepDurationHours ?? 7.0).toFixed(1)}
            unit="hours"
            icon={Moon}
            statusColor={(latestObservation?.sleepDurationHours ?? 7.0) < 6.0 ? 'amber' : 'emerald'}
            subValue={`Deep: ${latestObservation?.deepSleepPercent ?? 18}% | Eff: ${latestObservation?.sleepEfficiencyPercent ?? 82}%`}
            trend={(latestObservation?.sleepDurationHours ?? 7.0) < 6.0 ? 'down' : 'neutral'}
            trendValue={(latestObservation?.sleepDurationHours ?? 7.0) < 6.0 ? 'Sleep Deficit' : 'Restored'}
            tooltip="Last overnight sleep duration and polysomnographic stage proportions"
          />
        </div>
      )}

      {/* Real-Time Lead II ECG Waveform */}
      {showECG && (
        <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Simulated PPG / ECG Morphological Pulse Stream
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Sampling: Continuous | Quality: <strong className="text-emerald-600 dark:text-emerald-400">{latestObservation.signalQuality}</strong>
            </span>
          </div>
          <ECGVisualizer
            heartRate={latestObservation.heartRate}
            isStreaming={isStreaming}
            isAlert={latestObservation.isSimulatedAlert}
          />
        </div>
      )}

      {/* Dual Interactive Trend Charts: Heart Rate & HRV */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('overview.hrDynamics', 'Heart Rate Dynamics')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Window: Last {filteredObservations.length} observations ({timeWindow} selection)</p>
              </div>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                Current: {latestObservation.heartRate} bpm
              </span>
            </div>
            <HeartRateChart observations={filteredObservations} baselineHR={ehr.restingHeartRateBaseline} />
          </div>

          <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('overview.hrvModulation', 'Autonomic HRV Modulation')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">RMSSD in ms with autonomic strain threshold (&lt;25 ms)</p>
              </div>
              <span className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded">
                Current: {latestObservation.hrvRmssd} ms
              </span>
            </div>
            <HrvChart observations={filteredObservations} baselineHrv={ehr.restingHrvBaseline} />
          </div>
        </div>
      )}

      {/* Multilingual Healthcare Language Assistant Section */}
      <HealthcareLanguageAssistant twinState={twinState} />

      {/* Clinical Event Timeline & Digital Twin Fusion Summary */}
      {showEvents && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Timeline of Events */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('overview.recentEvents', 'Recent Physiological Event Stream')}</h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{t('overview.fusionAudit', 'Real-time fusion audit')}</span>
            </div>

            <div className="space-y-3">
              {recentObservations.slice(-5).reverse().map((obs, idx) => (
                <div
                  key={obs.id || idx}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between ${
                    obs.isSimulatedAlert
                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {obs.isSimulatedAlert ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {obs.isSimulatedAlert ? obs.simulatedAlertReason : 'Stable Autonomic Homeostasis'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        HR: <strong className="text-slate-800 dark:text-slate-200">{obs.heartRate} bpm</strong> | HRV: <strong className="text-slate-800 dark:text-slate-200">{obs.hrvRmssd} ms</strong> | SpO2: <strong className="text-slate-800 dark:text-slate-200">{obs.spo2}%</strong> | Activity: <strong className="text-slate-800 dark:text-slate-200">{obs.activityIntensity}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    {new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Digital Twin Feature Window Card */}
          <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Brain className="w-4 h-4" />
                <span>{t('overview.engineState', 'Digital Twin Engine State')}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Multi-Modal Fusion Architecture</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Synchronizing static longitudinal EHR (demographics, comorbidities, lipid panel, baseline BP) with dynamic wearable rolling statistics.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Target Horizon:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">Next 2 Hours (120m)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Model Architecture:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-300">Calibrated GBDT / RF</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Model Confidence:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{(currentPrediction.modelConfidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Data Freshness:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">&lt; 15 seconds</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Signal Integrity:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{twinState.dataQualityScore}% Optimal</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onNavigateTab('simulator')}
                className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{t('overview.launchSimulator', 'Launch What-If Twin Simulator')}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
