import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { 
  Activity, 
  Heart, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  SlidersHorizontal,
  Info,
  Flame,
  X,
  Eye,
  EyeOff,
  BellRing
} from 'lucide-react';
import { PatientEHR, WearableObservation } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export interface ClinicalThresholdBreach {
  id: string;
  type: 'hr_elevation' | 'hrv_depression' | 'combined_strain' | 'vagal_peak';
  label: string;
  metric: 'Heart Rate' | 'HRV RMSSD' | 'Dual Autonomic';
  value: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'favorable';
  description: string;
}

export interface DayTrendPoint {
  dateKey: string;
  displayDate: string;
  dayIndex: number;
  heartRate: number;
  hrvRmssd: number;
  hrMin: number;
  hrMax: number;
  sleepHours: number;
  autonomicStatus: 'Restorative' | 'Balanced' | 'Autonomic Strain' | 'Elevated Stress';
  isAlertDay: boolean;
  baselineHR: number;
  baselineHrv: number;
  thresholdBreaches: ClinicalThresholdBreach[];
  hasThresholdCrossing: boolean;
}

interface PatientHistoricalTrendsChartProps {
  patient: PatientEHR;
  latestObservation?: WearableObservation;
}

export const PatientHistoricalTrendsChart: React.FC<PatientHistoricalTrendsChartProps> = ({
  patient,
  latestObservation,
}) => {
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = resolvedTheme === 'dark';

  const [activeMetric, setActiveMetric] = useState<'both' | 'hr' | 'hrv'>('both');
  const [timeRange, setTimeRange] = useState<'30d' | '14d' | '7d'>('30d');
  const [highlightThresholds, setHighlightThresholds] = useState<boolean>(true);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Generate 30 days of deterministic, physiologically grounded daily data points with clinical threshold breaches
  const raw30DayData = useMemo<DayTrendPoint[]>(() => {
    const points: DayTrendPoint[] = [];
    const seed = patient.patientId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const now = Date.now();
    const isHighRisk = patient.baselineRiskCategory === 'High' || patient.baselineRiskCategory === 'Elevated';
    const baseHR = patient.restingHeartRateBaseline;
    const baseHrv = patient.restingHrvBaseline;

    for (let i = 29; i >= 0; i--) {
      const dayTimestamp = now - i * 86400 * 1000;
      const dateObj = new Date(dayTimestamp);
      const displayDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dateKey = dateObj.toISOString().split('T')[0];

      // Multi-day circadian & weekly autonomic oscillation
      const dayOfWeek = dateObj.getDay();
      const weekendRest = dayOfWeek === 0 || dayOfWeek === 6 ? 1.5 : 0;
      const weeklyWave = Math.sin((i / 7) * Math.PI * 2) * 3.5;
      const pseudoNoise = Math.sin((seed + i) * 1.6) * 2.8;

      // Simulate occasional episodic autonomic stress in vulnerable patients
      const isStressWindow = isHighRisk && (i >= 4 && i <= 7);
      const isMildStressDay = (i % 8 === 0) && isHighRisk;
      const isRecoveryDay = (i === 12 || i === 20) && !isStressWindow;

      let hr = Math.round(baseHR + weeklyWave + pseudoNoise - weekendRest);
      let hrv = Math.round(baseHrv - (weeklyWave * 0.8) + (weekendRest * 2) - pseudoNoise);
      let sleep = 7.0 + Math.cos((seed + i) * 0.9) * 1.1 + (weekendRest * 0.4);

      if (isStressWindow) {
        hr += 14 + Math.round(Math.sin(i) * 4); // Tachycardia episode pushing above 90 bpm
        hrv = Math.max(14, hrv - 10); // Depresses HRV below 25 ms
        sleep = Math.max(4.6, sleep - 1.8);
      } else if (isMildStressDay) {
        hr += 8;
        hrv = Math.max(17, hrv - 7);
      } else if (isRecoveryDay) {
        hr = Math.max(50, hr - 6);
        hrv = Math.min(85, hrv + 12);
        sleep = Math.min(9.5, sleep + 1.2);
      }

      // If it's the current day (i === 0) and we have live telemetry, blend with latest observation
      if (i === 0 && latestObservation) {
        hr = Math.round((hr + latestObservation.heartRate) / 2);
        hrv = Math.round((hrv + latestObservation.hrvRmssd) / 2);
        if (latestObservation.sleepDurationHours) {
          sleep = latestObservation.sleepDurationHours;
        }
      }

      // Clamp physiologically
      hr = Math.max(45, Math.min(130, hr));
      hrv = Math.max(10, Math.min(95, hrv));
      sleep = Math.round(Math.max(4.0, Math.min(10.5, sleep)) * 10) / 10;

      // Identify specific clinical threshold crossings:
      const thresholdBreaches: ClinicalThresholdBreach[] = [];
      const isHrTachycardia = hr >= 90 || hr >= baseHR + 12;
      const isHrvStrain = hrv < 25;
      const isSevereHrvStrain = hrv < 20;
      const isVagalPeak = hrv >= baseHrv + 10 && hrv >= 45;

      if (isHrTachycardia && isHrvStrain) {
        thresholdBreaches.push({
          id: `b-comb-${i}`,
          type: 'combined_strain',
          label: 'Combined Autonomic Decompensation',
          metric: 'Dual Autonomic',
          value: hr,
          threshold: 90,
          severity: 'critical',
          description: `Concurrent resting tachycardia (${hr} bpm) and severe vagal suppression (HRV ${hrv} ms < 25 ms threshold).`,
        });
      } else if (isHrTachycardia) {
        thresholdBreaches.push({
          id: `b-hr-${i}`,
          type: 'hr_elevation',
          label: 'Tachycardic Excursion (HR ≥ 90 bpm)',
          metric: 'Heart Rate',
          value: hr,
          threshold: 90,
          severity: 'warning',
          description: `Resting pulse acceleration to ${hr} bpm (+${hr - baseHR} bpm over baseline).`,
        });
      } else if (isHrvStrain) {
        thresholdBreaches.push({
          id: `b-hrv-${i}`,
          type: 'hrv_depression',
          label: isSevereHrvStrain ? 'Critical Vagal Collapse (HRV < 20 ms)' : 'Autonomic Vagal Strain (HRV < 25 ms)',
          metric: 'HRV RMSSD',
          value: hrv,
          threshold: 25,
          severity: isSevereHrvStrain ? 'critical' : 'warning',
          description: `Parasympathetic withdrawal with depressed RMSSD to ${hrv} ms (norm: ≥ 25 ms).`,
        });
      } else if (isVagalPeak) {
        thresholdBreaches.push({
          id: `b-peak-${i}`,
          type: 'vagal_peak',
          label: 'Restorative Parasympathetic Peak',
          metric: 'HRV RMSSD',
          value: hrv,
          threshold: baseHrv + 10,
          severity: 'favorable',
          description: `Robust vagal tone surge to ${hrv} ms (+${hrv - baseHrv} ms above baseline norm).`,
        });
      }

      const isAlert = thresholdBreaches.some((b) => b.severity === 'critical' || b.severity === 'warning');
      let status: DayTrendPoint['autonomicStatus'] = 'Balanced';
      if (isSevereHrvStrain || (isHrTachycardia && isHrvStrain)) {
        status = 'Autonomic Strain';
      } else if (isHrvStrain || isHrTachycardia) {
        status = 'Elevated Stress';
      } else if (isVagalPeak) {
        status = 'Restorative';
      }

      points.push({
        dateKey,
        displayDate,
        dayIndex: 30 - i,
        heartRate: hr,
        hrvRmssd: hrv,
        hrMin: Math.max(42, hr - 8),
        hrMax: hr + 18,
        sleepHours: sleep,
        autonomicStatus: status,
        isAlertDay: isAlert,
        baselineHR: baseHR,
        baselineHrv: baseHrv,
        thresholdBreaches,
        hasThresholdCrossing: thresholdBreaches.length > 0,
      });
    }

    return points;
  }, [patient, latestObservation]);

  // Filtered by selected time horizon
  const visibleData = useMemo(() => {
    if (timeRange === '7d') return raw30DayData.slice(-7);
    if (timeRange === '14d') return raw30DayData.slice(-14);
    return raw30DayData;
  }, [raw30DayData, timeRange]);

  // Active threshold breach events in the selected horizon
  const activeBreaches = useMemo(() => {
    return visibleData.filter((d) => d.thresholdBreaches.length > 0);
  }, [visibleData]);

  // Selected single day focus
  const selectedPoint = useMemo(() => {
    if (!selectedDateKey) return null;
    return visibleData.find((d) => d.dateKey === selectedDateKey) || null;
  }, [visibleData, selectedDateKey]);

  // Summary statistics for the active window
  const stats = useMemo(() => {
    const hrValues = visibleData.map((d) => d.heartRate);
    const hrvValues = visibleData.map((d) => d.hrvRmssd);

    const avgHR = Math.round((hrValues.reduce((a, b) => a + b, 0) / hrValues.length) * 10) / 10;
    const avgHrv = Math.round((hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length) * 10) / 10;

    const strainDays = visibleData.filter((d) => d.hrvRmssd < 25).length;
    const tachyDays = visibleData.filter((d) => d.heartRate >= 90).length;
    const restorativeDays = visibleData.filter((d) => d.hrvRmssd >= patient.restingHrvBaseline).length;

    const hrDeltaVsBase = Math.round((avgHR - patient.restingHeartRateBaseline) * 10) / 10;
    const hrvDeltaVsBase = Math.round((avgHrv - patient.restingHrvBaseline) * 10) / 10;

    return {
      avgHR,
      avgHrv,
      strainDays,
      tachyDays,
      restorativeDays,
      hrDeltaVsBase,
      hrvDeltaVsBase,
      totalBreachEvents: activeBreaches.length,
      stabilityRate: Math.round(((visibleData.length - strainDays) / visibleData.length) * 100),
    };
  }, [visibleData, patient, activeBreaches]);

  // Colors adapted to theme
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const axisLineColor = isDark ? '#334155' : '#cbd5e1';

  // Custom visual indicator dot for Heart Rate
  const renderCustomHrDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;

    const hrBreach = payload.thresholdBreaches?.find(
      (b: ClinicalThresholdBreach) => b.metric === 'Heart Rate' || b.type === 'combined_strain'
    );
    const isSelected = selectedDateKey === payload.dateKey;

    if (highlightThresholds && hrBreach) {
      return (
        <g
          key={`hr-dot-${payload.dateKey}`}
          className="cursor-pointer"
          onClick={() => setSelectedDateKey(selectedDateKey === payload.dateKey ? null : payload.dateKey)}
        >
          {/* Pulsing alert aura */}
          <circle cx={cx} cy={cy} r={9} fill="#f43f5e" fillOpacity={0.3} className="animate-ping" />
          {/* Solid prominent ring */}
          <circle cx={cx} cy={cy} r={6.5} fill="#f43f5e" stroke="#ffffff" strokeWidth={2} />
          {/* Inner center dot */}
          <circle cx={cx} cy={cy} r={2.5} fill="#ffffff" />
        </g>
      );
    }

    if (isSelected) {
      return (
        <circle
          key={`hr-dot-sel-${payload.dateKey}`}
          cx={cx}
          cy={cy}
          r={5.5}
          fill="#06b6d4"
          stroke="#ffffff"
          strokeWidth={2}
          className="cursor-pointer"
          onClick={() => setSelectedDateKey(null)}
        />
      );
    }

    return (
      <circle
        key={`hr-dot-std-${payload.dateKey}`}
        cx={cx}
        cy={cy}
        r={2.5}
        fill="#06b6d4"
        stroke="#0891b2"
        strokeWidth={1}
        className="cursor-pointer hover:r-4 transition-all"
        onClick={() => setSelectedDateKey(payload.dateKey)}
      />
    );
  };

  // Custom visual indicator dot for HRV RMSSD
  const renderCustomHrvDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;

    const hrvBreach = payload.thresholdBreaches?.find(
      (b: ClinicalThresholdBreach) => b.metric === 'HRV RMSSD' || b.type === 'combined_strain'
    );
    const isSelected = selectedDateKey === payload.dateKey;

    if (highlightThresholds && hrvBreach) {
      const isCritical = hrvBreach.severity === 'critical';
      const color = isCritical ? '#f43f5e' : '#f59e0b';

      return (
        <g
          key={`hrv-dot-${payload.dateKey}`}
          className="cursor-pointer"
          onClick={() => setSelectedDateKey(selectedDateKey === payload.dateKey ? null : payload.dateKey)}
        >
          {/* Pulsing square/diamond halo */}
          <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.3} className="animate-pulse" />
          {/* Diamond shape warning glyph */}
          <rect
            x={cx - 4.5}
            y={cy - 4.5}
            width={9}
            height={9}
            transform={`rotate(45 ${cx} ${cy})`}
            fill={color}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        </g>
      );
    }

    if (isSelected) {
      return (
        <circle
          key={`hrv-dot-sel-${payload.dateKey}`}
          cx={cx}
          cy={cy}
          r={5.5}
          fill="#14b8a6"
          stroke="#ffffff"
          strokeWidth={2}
          className="cursor-pointer"
          onClick={() => setSelectedDateKey(null)}
        />
      );
    }

    return (
      <circle
        key={`hrv-dot-std-${payload.dateKey}`}
        cx={cx}
        cy={cy}
        r={2.5}
        fill="#14b8a6"
        stroke="#0d9488"
        strokeWidth={1}
        className="cursor-pointer hover:r-4 transition-all"
        onClick={() => setSelectedDateKey(payload.dateKey)}
      />
    );
  };

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm transition-colors">
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-teal-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              30-Day Longitudinal Heart Rate & HRV Autonomic Trends
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 font-semibold">
              {visibleData.length} Day Window
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Historical daily tracking of resting pulse rate (BPM) and parasympathetic vagal tone (HRV RMSSD ms) for{' '}
            <strong className="text-cyan-600 dark:text-cyan-400 font-semibold">{patient.fullName}</strong> ({patient.patientId}).
          </p>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Visual Indicators Toggle */}
          <button
            onClick={() => setHighlightThresholds((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              highlightThresholds
                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle visual threshold breach indicators on the chart"
          >
            {highlightThresholds ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Threshold Indicators: {highlightThresholds ? 'ON' : 'OFF'}</span>
          </button>

          {/* Metric Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeMetric === 'both'
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Dual (HR + HRV)
            </button>
            <button
              onClick={() => setActiveMetric('hr')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeMetric === 'hr'
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Heart Rate
            </button>
            <button
              onClick={() => setActiveMetric('hrv')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeMetric === 'hrv'
                  ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              HRV RMSSD
            </button>
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
            {(['7d', '14d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg font-semibold font-mono transition-all uppercase ${
                  timeRange === r
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {r === '30d' ? '30 Days' : r === '14d' ? '14 Days' : '7 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 30-Day Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        {/* Mean HR Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Mean Resting HR</span>
            <Heart className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-sans">{stats.avgHR}</span>
            <span className="text-xs text-slate-500">bpm</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            Baseline: {patient.restingHeartRateBaseline} bpm ({stats.hrDeltaVsBase > 0 ? `+${stats.hrDeltaVsBase}` : stats.hrDeltaVsBase} bpm)
          </span>
        </div>

        {/* Mean HRV Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Mean HRV RMSSD</span>
            <Activity className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-teal-600 dark:text-teal-400 font-sans">{stats.avgHrv}</span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            Baseline: {patient.restingHrvBaseline} ms ({stats.hrvDeltaVsBase > 0 ? `+${stats.hrvDeltaVsBase}` : stats.hrvDeltaVsBase} ms)
          </span>
        </div>

        {/* Threshold Breach Days Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Threshold Crossings</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${stats.totalBreachEvents > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className={`text-xl font-bold font-sans ${stats.totalBreachEvents > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {stats.totalBreachEvents}
            </span>
            <span className="text-xs text-slate-500">days with breaches</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            HR ≥ 90 bpm or HRV &lt; 25 ms
          </span>
        </div>

        {/* Autonomic Stability Rate */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Autonomic Stability</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-sans">{stats.stabilityRate}%</span>
            <span className="text-xs text-slate-500">restorative</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            {stats.restorativeDays} days ≥ baseline norm
          </span>
        </div>
      </div>

      {/* Clinically Significant Threshold Crossings Ribbon */}
      {highlightThresholds && activeBreaches.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/30 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-1.5 text-rose-700 dark:text-rose-300 font-bold">
              <Flame className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Clinically Significant Threshold Crossings Detected ({activeBreaches.length} Timestamps):</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Click a timestamp to highlight its position on the chart
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {activeBreaches.map((day) => {
              const isSelected = selectedDateKey === day.dateKey;
              const hasCritical = day.thresholdBreaches.some((b) => b.severity === 'critical');

              return (
                <button
                  key={day.dateKey}
                  onClick={() => setSelectedDateKey(isSelected ? null : day.dateKey)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-700 shadow-sm scale-105'
                      : hasCritical
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                  }`}
                >
                  <span className="font-bold">{day.displayDate}:</span>
                  <span>
                    {day.heartRate >= 90 ? `HR ${day.heartRate} bpm` : ''}
                    {day.heartRate >= 90 && day.hrvRmssd < 25 ? ' & ' : ''}
                    {day.hrvRmssd < 25 ? `HRV ${day.hrvRmssd} ms` : ''}
                  </span>
                </button>
              );
            })}

            {selectedDateKey && (
              <button
                onClick={() => setSelectedDateKey(null)}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Clear Focus</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Timestamp In-Depth Callout Drawer */}
      {selectedPoint && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-cyan-500/40 shadow-sm space-y-2 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                Focused Clinical Timestamp: {selectedPoint.displayDate} ({selectedPoint.dateKey})
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  selectedPoint.autonomicStatus === 'Autonomic Strain'
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                    : selectedPoint.autonomicStatus === 'Elevated Stress'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {selectedPoint.autonomicStatus}
              </span>
            </div>
            <button
              onClick={() => setSelectedDateKey(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Heart Rate Reading</span>
              <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                {selectedPoint.heartRate} bpm
              </span>
              <span className="text-[10px] text-slate-500 block">
                {selectedPoint.heartRate - selectedPoint.baselineHR >= 0 ? `+${selectedPoint.heartRate - selectedPoint.baselineHR}` : selectedPoint.heartRate - selectedPoint.baselineHR} bpm vs baseline ({selectedPoint.baselineHR} bpm)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">HRV RMSSD Reading</span>
              <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                {selectedPoint.hrvRmssd} ms
              </span>
              <span className="text-[10px] text-slate-500 block">
                {selectedPoint.hrvRmssd - selectedPoint.baselineHrv >= 0 ? `+${selectedPoint.hrvRmssd - selectedPoint.baselineHrv}` : selectedPoint.hrvRmssd - selectedPoint.baselineHrv} ms vs baseline ({selectedPoint.baselineHrv} ms)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Overnight Sleep</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                {selectedPoint.sleepHours} hrs
              </span>
              <span className="text-[10px] text-slate-500 block">Circadian recovery</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Daily HR Range</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {selectedPoint.hrMin} – {selectedPoint.hrMax}
              </span>
              <span className="text-[10px] text-slate-500 block">Rest to peak bpm</span>
            </div>
          </div>

          {selectedPoint.thresholdBreaches.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase font-bold text-rose-600 dark:text-rose-400 block">
                Clinical Significance & Threshold Notes:
              </span>
              {selectedPoint.thresholdBreaches.map((breach) => (
                <div
                  key={breach.id}
                  className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 leading-relaxed flex items-start space-x-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{breach.label}:</span>
                    <span className="text-[11px]">{breach.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Recharts Chart Canvas */}
      <div className="w-full h-84 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visibleData} margin={{ top: 15, right: 25, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="hrHistGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="hrvHistGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            <XAxis
              dataKey="displayDate"
              stroke={textColor}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: axisLineColor }}
              dy={8}
            />

            {/* Left Y Axis: Heart Rate */}
            {(activeMetric === 'both' || activeMetric === 'hr') && (
              <YAxis
                yAxisId="hr"
                domain={['dataMin - 6', 'dataMax + 10']}
                stroke="#06b6d4"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#06b6d4' }}
                unit=" bpm"
              />
            )}

            {/* Right Y Axis: HRV RMSSD */}
            {(activeMetric === 'both' || activeMetric === 'hrv') && (
              <YAxis
                yAxisId="hrv"
                orientation="right"
                domain={[10, 85]}
                stroke="#14b8a6"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#14b8a6' }}
                unit=" ms"
              />
            )}

            {/* Vertical Highlight Line for Selected Timestamp */}
            {selectedPoint && (
              <ReferenceLine
                x={selectedPoint.displayDate}
                stroke="#f43f5e"
                strokeDasharray="2 2"
                strokeWidth={2}
                label={{
                  value: `Focused: ${selectedPoint.displayDate}`,
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'top',
                }}
              />
            )}

            {/* Reference Line for Baseline Heart Rate */}
            {(activeMetric === 'both' || activeMetric === 'hr') && (
              <ReferenceLine
                yAxisId="hr"
                y={patient.restingHeartRateBaseline}
                stroke="#06b6d4"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Baseline HR: ${patient.restingHeartRateBaseline} bpm`,
                  fill: '#06b6d4',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
            )}

            {/* Reference Line for Tachycardia Threshold (≥ 90 bpm) */}
            {(activeMetric === 'both' || activeMetric === 'hr') && (
              <ReferenceLine
                yAxisId="hr"
                y={90}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: 'Tachycardia Threshold (≥90 bpm)',
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}

            {/* Reference Line for Autonomic Strain Cutoff (<25ms) */}
            {(activeMetric === 'both' || activeMetric === 'hrv') && (
              <ReferenceLine
                yAxisId="hrv"
                y={25}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: 'Vagal Strain Threshold (<25 ms)',
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />
            )}

            {/* Custom Interactive Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: DayTrendPoint = payload[0].payload;
                  const hrDelta = data.heartRate - data.baselineHR;
                  const hrvDelta = data.hrvRmssd - data.baselineHrv;
                  const hasBreach = data.thresholdBreaches.length > 0;

                  return (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xl text-xs space-y-2 font-mono">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 gap-4">
                        <span className="font-bold text-slate-900 dark:text-white font-sans">
                          {data.displayDate} ({data.dateKey})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            data.autonomicStatus === 'Autonomic Strain'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : data.autonomicStatus === 'Elevated Stress'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {data.autonomicStatus}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center space-x-4">
                          <span className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>Resting Heart Rate:</span>
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {data.heartRate} bpm ({hrDelta >= 0 ? `+${hrDelta}` : hrDelta} vs base)
                          </span>
                        </div>

                        <div className="flex justify-between items-center space-x-4">
                          <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span>HRV RMSSD:</span>
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {data.hrvRmssd} ms ({hrvDelta >= 0 ? `+${hrvDelta}` : hrvDelta} vs base)
                          </span>
                        </div>

                        <div className="flex justify-between items-center space-x-4 text-slate-500 dark:text-slate-400">
                          <span>Overnight Sleep:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{data.sleepHours} hrs</span>
                        </div>
                      </div>

                      {hasBreach && (
                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1 font-sans">
                          {data.thresholdBreaches.map((b) => (
                            <div key={b.id} className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 font-medium">
                              <AlertTriangle className="w-3 h-3 shrink-0 text-rose-500" />
                              <span>{b.label}: {b.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Heart Rate Area & Line with Custom Dot Visual Indicators */}
            {(activeMetric === 'both' || activeMetric === 'hr') && (
              <Area
                yAxisId="hr"
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate (BPM)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fill="url(#hrHistGradient)"
                dot={renderCustomHrDot}
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}

            {/* HRV RMSSD Line with Custom Diamond Warning Indicators */}
            {(activeMetric === 'both' || activeMetric === 'hrv') && (
              <Line
                yAxisId="hrv"
                type="monotone"
                dataKey="hrvRmssd"
                name="HRV RMSSD (ms)"
                stroke="#14b8a6"
                strokeWidth={2.5}
                dot={renderCustomHrvDot}
                activeDot={{ r: 6, fill: '#14b8a6', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Visual Indicator Explanations */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 rounded bg-[#06b6d4]" />
            <span>Heart Rate (Left Axis)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 rounded bg-[#14b8a6]" />
            <span>HRV RMSSD (Right Axis)</span>
          </div>
          {highlightThresholds && (
            <>
              <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
                <span>HR ≥ 90 bpm Excursion</span>
              </div>
              <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rotate-45 bg-amber-500 border border-white" />
                <span>HRV &lt; 25 ms Strain Breach</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <span>Click any threshold dot or event chip to focus timestamp</span>
        </div>
      </div>
    </div>
  );
};
