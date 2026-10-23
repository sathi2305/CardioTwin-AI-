import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Clock, 
  Layers, 
  ArrowRight, 
  ArrowLeftRight,
  RotateCcw, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Plus, 
  ShieldCheck,
  Sparkles,
  Download,
  Activity,
  Heart,
  Moon,
  Info,
  Calendar,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { DigitalTwinState, DigitalTwinSnapshot } from '../types';
import { snapshotStore } from '../utils/snapshotStore';
import { Badge } from '../components/ui/Badge';
import { useLanguage } from '../context/LanguageContext';

interface TimelinePageProps {
  twinState: DigitalTwinState;
  onCreateSnapshot: () => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ twinState, onCreateSnapshot }) => {
  const { t } = useLanguage();
  const [snapshots, setSnapshots] = useState<DigitalTwinSnapshot[]>([]);
  const [selectedSnapshotA, setSelectedSnapshotA] = useState<DigitalTwinSnapshot | null>(null);
  const [selectedSnapshotB, setSelectedSnapshotB] = useState<DigitalTwinSnapshot | null>(null);
  const [viewMode, setViewMode] = useState<'sideBySide' | 'matrix' | 'stream'>('sideBySide');
  const [newSnapshotNote, setNewSnapshotNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  useEffect(() => {
    // getSnapshotsForPatient will automatically seed 3 realistic baseline snapshots for any patient if needed
    const list = snapshotStore.getSnapshotsForPatient(twinState.patientId, twinState);
    setSnapshots(list);
    if (list.length >= 2) {
      // Default: A is earliest, B is latest
      setSelectedSnapshotA(list[list.length - 1]);
      setSelectedSnapshotB(list[0]);
    } else if (list.length === 1) {
      setSelectedSnapshotA(list[0]);
      setSelectedSnapshotB(list[0]);
    }
  }, [twinState.patientId, twinState.currentPrediction.riskProbability]);

  const handleManualSnapshot = () => {
    snapshotStore.createSnapshot(twinState, newSnapshotNote.trim() || undefined);
    setNewSnapshotNote('');
    setShowNoteModal(false);
    const updated = snapshotStore.getSnapshotsForPatient(twinState.patientId, twinState);
    setSnapshots(updated);
    if (updated.length >= 2) {
      setSelectedSnapshotB(updated[0]);
    }
    onCreateSnapshot();
  };

  const handleSwapSnapshots = () => {
    const temp = selectedSnapshotA;
    setSelectedSnapshotA(selectedSnapshotB);
    setSelectedSnapshotB(temp);
  };

  const handlePresetEarliestLatest = () => {
    if (snapshots.length >= 2) {
      setSelectedSnapshotA(snapshots[snapshots.length - 1]);
      setSelectedSnapshotB(snapshots[0]);
    }
  };

  const handlePresetConsecutive = () => {
    if (snapshots.length >= 2) {
      setSelectedSnapshotA(snapshots[1]);
      setSelectedSnapshotB(snapshots[0]);
    }
  };

  const handleExportComparison = () => {
    if (!comparison) return;
    const reportData = {
      patientId: twinState.patientId,
      patientName: twinState.ehr.fullName,
      generatedAt: new Date().toISOString(),
      comparisonSummary: {
        snapshotA: {
          number: comparison.snapA.snapshotNumber,
          timestamp: comparison.snapA.timestamp,
          riskProbability: comparison.snapA.riskProbability,
          riskLevel: comparison.snapA.riskLevel,
          heartRate: comparison.snapA.heartRate,
          hrvRmssd: comparison.snapA.hrvRmssd,
          bloodPressure: comparison.snapA.bloodPressure,
          reason: comparison.snapA.deltaReason,
        },
        snapshotB: {
          number: comparison.snapB.snapshotNumber,
          timestamp: comparison.snapB.timestamp,
          riskProbability: comparison.snapB.riskProbability,
          riskLevel: comparison.snapB.riskLevel,
          heartRate: comparison.snapB.heartRate,
          hrvRmssd: comparison.snapB.hrvRmssd,
          bloodPressure: comparison.snapB.bloodPressure,
          reason: comparison.snapB.deltaReason,
        },
        timeElapsed: comparison.timeElapsedFormatted,
        riskShift: comparison.riskDirection,
        probabilityDelta: comparison.probDelta,
        hemodynamicShift: comparison.hemodynamicShift,
        clinicalSummary: comparison.clinicalSummary,
        metrics: comparison.metrics,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CardioTwin_Comparison_${twinState.patientId}_Snap${comparison.snapA.snapshotNumber}_vs_Snap${comparison.snapB.snapshotNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const comparison = selectedSnapshotA && selectedSnapshotB 
    ? snapshotStore.compareSnapshots(selectedSnapshotA, selectedSnapshotB)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('nav.timeline', 'Digital Twin Timeline & Snapshot Comparison')}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold">
              {snapshots.length} Snapshots Stored
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Side-by-side longitudinal comparison of reproducible digital twin states. Select any two snapshots to quantify autonomic strain deltas, vagal tone shifts, hemodynamic baselines, and predictive model transitions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {comparison && (
            <button
              onClick={handleExportComparison}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
              title="Download Comparison JSON"
            >
              {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
              <span>{copiedExport ? 'Exported' : 'Export JSON'}</span>
            </button>
          )}

          <button
            onClick={() => setShowNoteModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Snapshot</span>
          </button>
        </div>
      </div>

      {/* Snapshot Selector Deck & Mode Switcher */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Snapshot Selection Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Snapshot A Selector */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-600 dark:text-cyan-400">Snapshot A (Prior):</span>
              <select
                value={selectedSnapshotA?.id}
                onChange={(e) => setSelectedSnapshotA(snapshots.find((s) => s.id === e.target.value) || null)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none font-mono cursor-pointer"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    #{s.snapshotNumber} • {new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({(s.riskProbability * 100).toFixed(0)}% Risk)
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapSnapshots}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Swap Snapshot A and B"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* Snapshot B Selector */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">Snapshot B (Later):</span>
              <select
                value={selectedSnapshotB?.id}
                onChange={(e) => setSelectedSnapshotB(snapshots.find((s) => s.id === e.target.value) || null)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none font-mono cursor-pointer"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    #{s.snapshotNumber} • {new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({(s.riskProbability * 100).toFixed(0)}% Risk)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handlePresetEarliestLatest}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Earliest vs Latest
              </button>
              <button
                onClick={handlePresetConsecutive}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Consecutive
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'sideBySide'
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Side-by-Side View
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Detailed Clinical Matrix
            </button>
            <button
              onClick={() => setViewMode('stream')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'stream'
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Audit Stream ({snapshots.length})
            </button>
          </div>
        </div>

        {/* Time Elapsed & Clinical Shift Banner */}
        {comparison && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Time Interval Between Snapshots: <strong className="text-slate-900 dark:text-white font-mono">{comparison.timeElapsedFormatted}</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-[11px] text-slate-500">
                {new Date(comparison.snapA.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(comparison.snapB.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Hemodynamic Pattern:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  comparison.hemodynamicShift === 'Vagal Recovery'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : comparison.hemodynamicShift === 'Sympathetic Dominance'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                }`}
              >
                {comparison.hemodynamicShift}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: SIDE-BY-SIDE COLUMNS COMPARISON */}
      {viewMode === 'sideBySide' && comparison && (
        <div className="space-y-6">
          {/* Narrative Clinical Interpretation Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-indigo-200 dark:border-indigo-900/60 flex items-start space-x-3.5 shadow-xs">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Automated Twin Transition Interpretation:
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {comparison.clinicalSummary}
              </p>
            </div>
          </div>

          {/* 3-Column Side-by-Side Comparison Container */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
            {/* LEFT COLUMN: SNAPSHOT A (Prior / Baseline) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0f172a]/95 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                        Snapshot A (Baseline)
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                        #{comparison.snapA.snapshotNumber}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      {new Date(comparison.snapA.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(comparison.snapA.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge riskLevel={comparison.snapA.riskLevel}>
                    {comparison.snapA.riskLevel}
                  </Badge>
                </div>

                {/* Primary Risk Metric Display */}
                <div className="py-4 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Predicted 2-Hour Autonomic Strain Risk
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-sans">
                      {(comparison.snapA.riskProbability * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 font-mono">P(Strain)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comparison.snapA.riskLevel === 'High' ? 'bg-rose-500' : comparison.snapA.riskLevel === 'Elevated' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, comparison.snapA.riskProbability * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-3 py-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Heart Rate</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">{comparison.snapA.heartRate} bpm</span>
                    <span className="text-[10px] text-slate-400">Pulse telemetry</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">HRV RMSSD</span>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400 block mt-0.5">{comparison.snapA.hrvRmssd} ms</span>
                    <span className="text-[10px] text-slate-400">Vagal modulation</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Blood Pressure</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 block mt-0.5">{comparison.snapA.bloodPressure}</span>
                    <span className="text-[10px] text-slate-400">Arterial cuff</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Sleep Duration</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">{comparison.snapA.sleepHours.toFixed(1)} hrs</span>
                    <span className="text-[10px] text-slate-400">Circadian rest</span>
                  </div>
                </div>

                {/* Resilience Score */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Physiological Resilience:</span>
                    <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400">{comparison.snapA.twinHealthIndex} / 100</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${comparison.snapA.twinHealthIndex}%` }} />
                  </div>
                </div>
              </div>

              {/* Event Reason & Provenance Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">Snapshot Event Trigger:</span>
                <p className="text-slate-600 dark:text-slate-300 italic">"{comparison.snapA.deltaReason || 'Routine digital twin state capture'}"</p>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Model: {comparison.snapA.modelVersion}</span>
                  <span>EHR: {comparison.snapA.ehrVersion}</span>
                </div>
              </div>
            </div>

            {/* MIDDLE COLUMN: DELTA / TRANSITION COLUMN */}
            <div className="lg:col-span-1 flex flex-col justify-center items-center py-4 lg:py-0 space-y-4">
              <div className="hidden lg:flex flex-col items-center space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">Shift</span>
                <ArrowRight className="w-5 h-5 text-cyan-500" />
              </div>

              {/* Delta Cards Stack */}
              <div className="w-full space-y-2 text-center text-xs font-mono">
                {/* Risk Delta Pill */}
                <div
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${
                    comparison.probDelta > 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      : comparison.probDelta < 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-tight">Δ Risk</span>
                  <div className="flex items-center space-x-0.5 font-extrabold text-sm mt-0.5">
                    {comparison.probDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : comparison.probDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3 h-3" />}
                    <span>{comparison.probDelta > 0 ? '+' : ''}{(comparison.probDelta * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Heart Rate Delta Pill */}
                <div
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                    comparison.hrDelta > 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      : comparison.hrDelta < 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-tight">Δ HR</span>
                  <span className="font-extrabold text-xs mt-0.5">{comparison.hrDelta > 0 ? `+${comparison.hrDelta}` : comparison.hrDelta} bpm</span>
                </div>

                {/* HRV RMSSD Delta Pill */}
                <div
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                    comparison.hrvDelta < 0
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                      : comparison.hrvDelta > 0
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-tight">Δ HRV</span>
                  <span className="font-extrabold text-xs mt-0.5">{comparison.hrvDelta > 0 ? `+${comparison.hrvDelta}` : comparison.hrvDelta} ms</span>
                </div>

                {/* Resilience Delta Pill */}
                <div
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                    comparison.healthDelta >= 0
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-tight">Δ Resil</span>
                  <span className="font-extrabold text-xs mt-0.5">{comparison.healthDelta > 0 ? `+${comparison.healthDelta}` : comparison.healthDelta} pts</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SNAPSHOT B (Comparison / Later) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0f172a]/95 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30">
                        Snapshot B (Comparison)
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                        #{comparison.snapB.snapshotNumber}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      {new Date(comparison.snapB.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(comparison.snapB.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge riskLevel={comparison.snapB.riskLevel}>
                    {comparison.snapB.riskLevel}
                  </Badge>
                </div>

                {/* Primary Risk Metric Display */}
                <div className="py-4 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Predicted 2-Hour Autonomic Strain Risk
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-sans">
                      {(comparison.snapB.riskProbability * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 font-mono">P(Strain)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comparison.snapB.riskLevel === 'High' ? 'bg-rose-500' : comparison.snapB.riskLevel === 'Elevated' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, comparison.snapB.riskProbability * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-3 py-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Heart Rate</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">{comparison.snapB.heartRate} bpm</span>
                    <span className="text-[10px] text-slate-400">Pulse telemetry</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">HRV RMSSD</span>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400 block mt-0.5">{comparison.snapB.hrvRmssd} ms</span>
                    <span className="text-[10px] text-slate-400">Vagal modulation</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Blood Pressure</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 block mt-0.5">{comparison.snapB.bloodPressure}</span>
                    <span className="text-[10px] text-slate-400">Arterial cuff</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Sleep Duration</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">{comparison.snapB.sleepHours.toFixed(1)} hrs</span>
                    <span className="text-[10px] text-slate-400">Circadian rest</span>
                  </div>
                </div>

                {/* Resilience Score */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Physiological Resilience:</span>
                    <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400">{comparison.snapB.twinHealthIndex} / 100</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${comparison.snapB.twinHealthIndex}%` }} />
                  </div>
                </div>
              </div>

              {/* Event Reason & Provenance Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">Snapshot Event Trigger:</span>
                <p className="text-slate-600 dark:text-slate-300 italic">"{comparison.snapB.deltaReason || 'Routine digital twin state capture'}"</p>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Model: {comparison.snapB.modelVersion}</span>
                  <span>EHR: {comparison.snapB.ehrVersion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DETAILED CLINICAL MATRIX COMPARISON TABLE */}
      {viewMode === 'matrix' && comparison && (
        <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
                <span>Clinical Metrics Transition Matrix: Snapshot #{comparison.snapA.snapshotNumber} vs #{comparison.snapB.snapshotNumber}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exact metric differentials, clinical impact classifications, and autonomic baseline shifts
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
              Interval: {comparison.timeElapsedFormatted}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0b1224] text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Clinical Metric</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Snapshot A (#{comparison.snapA.snapshotNumber})</th>
                  <th className="py-3 px-4">Snapshot B (#{comparison.snapB.snapshotNumber})</th>
                  <th className="py-3 px-4">Observed Shift (Δ)</th>
                  <th className="py-3 px-4">Target Reference</th>
                  <th className="py-3 px-4">Physiological Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                {comparison.metrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-slate-100">
                      {m.label}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {m.valueA}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {m.valueB}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 font-bold text-xs px-2 py-0.5 rounded ${
                          m.direction === 'unfavorable'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            : m.direction === 'favorable'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {m.direction === 'unfavorable' ? <TrendingUp className="w-3 h-3" /> : m.direction === 'favorable' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        <span>{m.delta}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {m.targetReference}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600 dark:text-slate-300 text-xs max-w-xs">
                      {m.clinicalInterpretation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3 / BOTTOM: AUDIT STREAM & SNAPSHOT HISTORY */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Chronological Digital Twin Audit Trail</span>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">({snapshots.length} Snapshots)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any snapshot to assign it directly to Snapshot A (Baseline) or Snapshot B (Comparison)
            </p>
          </div>
        </div>

        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {snapshots.map((snap) => {
            const isSelectedA = selectedSnapshotA?.id === snap.id;
            const isSelectedB = selectedSnapshotB?.id === snap.id;

            return (
              <div key={snap.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-6 top-2 w-4 h-4 rounded-full border-2 transition-all ${
                    isSelectedA
                      ? 'bg-cyan-500 border-white dark:border-[#0f172a] ring-2 ring-cyan-500/40 shadow-xs'
                      : isSelectedB
                      ? 'bg-indigo-500 border-white dark:border-[#0f172a] ring-2 ring-indigo-500/40 shadow-xs'
                      : 'bg-slate-300 dark:bg-slate-700 border-white dark:border-[#0f172a]'
                  }`}
                />

                {/* Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isSelectedA && isSelectedB
                      ? 'bg-cyan-500/10 dark:bg-cyan-950/20 border-cyan-500/50 shadow-xs'
                      : isSelectedA
                      ? 'bg-cyan-50/50 dark:bg-cyan-950/15 border-cyan-400 dark:border-cyan-500/40 shadow-xs'
                      : isSelectedB
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/15 border-indigo-400 dark:border-indigo-500/40 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                        Snapshot #{snap.snapshotNumber}
                      </span>
                      <Badge riskLevel={snap.riskLevel}>
                        {(snap.riskProbability * 100).toFixed(1)}% Risk
                      </Badge>
                      {isSelectedA && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                          Active as A
                        </span>
                      )}
                      {isSelectedB && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                          Active as B
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(snap.timestamp).toLocaleString()}
                      </span>
                      {/* Quick assignment buttons */}
                      <button
                        onClick={() => setSelectedSnapshotA(snap)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                          isSelectedA
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        Set as A
                      </button>
                      <button
                        onClick={() => setSelectedSnapshotB(snap)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                          isSelectedB
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        Set as B
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    {snap.deltaReason || 'Routine digital twin state capture'}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-2.5 mt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <span>Heart Rate: <strong className="text-slate-900 dark:text-slate-200">{snap.heartRate} bpm</strong></span>
                    <span>HRV RMSSD: <strong className="text-teal-600 dark:text-teal-400">{snap.hrvRmssd} ms</strong></span>
                    <span>Blood Pressure: <strong className="text-slate-900 dark:text-slate-200">{snap.bloodPressure}</strong></span>
                    <span>Sleep: <strong className="text-indigo-600 dark:text-indigo-400">{snap.sleepHours.toFixed(1)} hrs</strong></span>
                    <span>Resilience: <strong className="text-cyan-600 dark:text-cyan-400">{snap.twinHealthIndex}/100</strong></span>
                    <span>Observations: <strong className="text-slate-700 dark:text-slate-300">{snap.observationCount}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Snapshot Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-cyan-500" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Record Digital Twin Snapshot
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Capture current telemetry values, rolling 60-minute feature window, and predictive strain probability into the persistent historical timeline.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                Clinical Context or Event Trigger Note (Optional):
              </label>
              <textarea
                value={newSnapshotNote}
                onChange={(e) => setNewSnapshotNote(e.target.value)}
                placeholder="e.g. Post-exercise resting recovery, medication adjustment, elevated HRV dip..."
                rows={3}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleManualSnapshot}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
              >
                Record Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
