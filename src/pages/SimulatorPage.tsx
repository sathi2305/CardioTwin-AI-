import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Heart, 
  Moon, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  BookmarkPlus, 
  Trash2 
} from 'lucide-react';
import { DigitalTwinState, WhatIfSimulationInput, WhatIfSimulationResult, ActivityIntensity, SavedScenario } from '../types';
import { runWhatIfSimulation } from '../utils/digitalTwinEngine';
import { Badge } from '../components/ui/Badge';

interface SimulatorPageProps {
  twinState: DigitalTwinState;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ twinState }) => {
  const { ehr, recentObservations } = twinState;

  // Active parameter inputs
  const [scenarioName, setScenarioName] = useState<string>('Therapeutic Lifestyle & Medication Adherence');
  const [deltaSleepHours, setDeltaSleepHours] = useState<number>(1.5);
  const [deltaSystolicBP, setDeltaSystolicBP] = useState<number>(-12);
  const [deltaHeartRateBpm, setDeltaHeartRateBpm] = useState<number>(-6);
  const [deltaHrvMs, setDeltaHrvMs] = useState<number>(8);
  const [adhereMedication, setAdhereMedication] = useState<boolean>(true);
  const [overrideActivity, setOverrideActivity] = useState<ActivityIntensity | undefined>(undefined);

  // Saved scenarios
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([
    {
      id: 'scen-1',
      name: 'Combined Adherence + Sleep Restoration',
      patientId: ehr.patientId,
      createdAt: new Date().toISOString(),
      input: {
        patientId: ehr.patientId,
        deltaSleepHours: 2.0,
        deltaSystolicBP: -15,
        deltaHeartRateBpm: -8,
        deltaHrvMs: 10,
        adhereMedication: true,
      },
      result: runWhatIfSimulation(ehr, recentObservations, {
        patientId: ehr.patientId,
        deltaSleepHours: 2.0,
        deltaSystolicBP: -15,
        deltaHeartRateBpm: -8,
        deltaHrvMs: 10,
        adhereMedication: true,
      }),
    },
    {
      id: 'scen-2',
      name: 'Acute Sleep Deprivation & Missed Meds',
      patientId: ehr.patientId,
      createdAt: new Date().toISOString(),
      input: {
        patientId: ehr.patientId,
        deltaSleepHours: -2.5,
        deltaSystolicBP: 18,
        deltaHeartRateBpm: 14,
        deltaHrvMs: -12,
        adhereMedication: false,
      },
      result: runWhatIfSimulation(ehr, recentObservations, {
        patientId: ehr.patientId,
        deltaSleepHours: -2.5,
        deltaSystolicBP: 18,
        deltaHeartRateBpm: 14,
        deltaHrvMs: -12,
        adhereMedication: false,
      }),
    },
  ]);

  const activeInput: WhatIfSimulationInput = {
    patientId: ehr.patientId,
    deltaSleepHours,
    deltaSystolicBP,
    deltaHeartRateBpm,
    deltaHrvMs,
    adhereMedication,
    overrideActivityIntensity: overrideActivity,
  };

  const simResult: WhatIfSimulationResult = runWhatIfSimulation(ehr, recentObservations, activeInput);

  const resetSimulation = () => {
    setDeltaSleepHours(0);
    setDeltaSystolicBP(0);
    setDeltaHeartRateBpm(0);
    setDeltaHrvMs(0);
    setAdhereMedication(false);
    setOverrideActivity(undefined);
    setScenarioName('Observed Clinical Baseline');
  };

  const handleSaveScenario = () => {
    const newScen: SavedScenario = {
      id: `scen-${Date.now()}`,
      name: scenarioName || `Scenario ${savedScenarios.length + 1}`,
      patientId: ehr.patientId,
      createdAt: new Date().toISOString(),
      input: activeInput,
      result: simResult,
    };
    setSavedScenarios([newScen, ...savedScenarios]);
  };

  const handleLoadScenario = (scen: SavedScenario) => {
    setScenarioName(scen.name);
    setDeltaSleepHours(scen.input.deltaSleepHours);
    setDeltaSystolicBP(scen.input.deltaSystolicBP);
    setDeltaHeartRateBpm(scen.input.deltaHeartRateBpm);
    setDeltaHrvMs(scen.input.deltaHrvMs);
    setAdhereMedication(!!scen.input.adhereMedication);
    setOverrideActivity(scen.input.overrideActivityIntensity);
  };

  const handleExportScenarioJson = () => {
    const exportData = {
      subjectId: ehr.patientId,
      fullName: ehr.fullName,
      scenarioName,
      generatedAt: new Date().toISOString(),
      inputParameters: activeInput,
      baselinePrediction: simResult.baselinePrediction,
      simulatedPrediction: simResult.simulatedPrediction,
      deltaProbability: simResult.probabilityDelta,
      percentRiskShift: simResult.percentChange,
      keyFeatureTransitions: simResult.keyShifts,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CardioTwin_Scenario_${ehr.patientId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isRiskDecreased = simResult.probabilityDelta < 0;

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Interactive Digital Twin Simulator
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              Counterfactual Inference
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Test hypothetical lifestyle and therapeutic interventions for{' '}
            <strong className="text-cyan-600 dark:text-cyan-400">{ehr.fullName}</strong>. The fitted model recalculates predicted physiological pattern risk in real time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetSimulation}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={handleExportScenarioJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            title="Download Scenario as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Scenario</span>
          </button>
        </div>
      </div>

      {/* Scenario Name Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex-1 min-w-[240px]">
          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-semibold">Active Scenario Name:</span>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="w-full bg-transparent font-bold text-sm text-slate-900 dark:text-white focus:outline-none border-b border-dashed border-slate-300 dark:border-slate-700 py-0.5 mt-0.5"
            placeholder="Name your simulation scenario..."
          />
        </div>

        <button
          onClick={handleSaveScenario}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span>Save Scenario</span>
        </button>
      </div>

      {/* Out of Distribution Warnings */}
      {simResult.isOutOfDistribution && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Out-of-Distribution Warning</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {simResult.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Baseline State */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 relative shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Observed Clinical Baseline
            </span>
            <Badge riskLevel={simResult.baselinePrediction.riskLevel}>
              {simResult.baselinePrediction.riskLevel}
            </Badge>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white font-sans">
              {(simResult.baselinePrediction.riskProbability * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">2-Hr Risk Probability</span>
          </div>

          <div className="mt-4 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-3 text-slate-600 dark:text-slate-300 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Blood Pressure:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{ehr.systolicBP}/{ehr.diastolicBP} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sleep Duration:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{(twinState.latestObservation?.sleepDurationHours ?? 7.0).toFixed(1)} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Resting HR:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{ehr.restingHeartRateBaseline} bpm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Resting HRV RMSSD:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{ehr.restingHrvBaseline} ms</span>
            </div>
          </div>
        </div>

        {/* Counterfactual Simulated Twin */}
        <div
          className={`p-5 rounded-2xl border relative transition-all shadow-sm ${
            isRiskDecreased
              ? 'bg-emerald-50/50 dark:bg-gradient-to-br dark:from-[#0c1e28] dark:to-[#0f172a] border-emerald-300 dark:border-emerald-500/40 shadow-emerald-500/10'
              : 'bg-rose-50/50 dark:bg-gradient-to-br dark:from-[#260f18] dark:to-[#0f172a] border-rose-300 dark:border-rose-500/40 shadow-rose-500/10'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300 font-mono">
                Counterfactual Twin State
              </span>
            </div>
            <Badge riskLevel={simResult.simulatedPrediction.riskLevel}>
              {simResult.simulatedPrediction.riskLevel}
            </Badge>
          </div>

          <div className="flex items-baseline space-x-3">
            <span
              className={`text-4xl font-black font-sans ${
                isRiskDecreased ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {(simResult.simulatedPrediction.riskProbability * 100).toFixed(1)}%
            </span>
            <div className="flex items-center space-x-1">
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  isRiskDecreased
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                }`}
              >
                {simResult.probabilityDelta > 0 ? '+' : ''}
                {(simResult.probabilityDelta * 100).toFixed(1)}% ({simResult.percentChange > 0 ? '+' : ''}
                {simResult.percentChange}%)
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs border-t border-slate-200 dark:border-slate-800/80 pt-3 text-slate-700 dark:text-slate-200 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Simulated BP:</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{ehr.systolicBP + deltaSystolicBP} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Simulated Sleep:</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{(7.0 + deltaSleepHours).toFixed(1)} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Simulated Resting HR:</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{ehr.restingHeartRateBaseline + deltaHeartRateBpm} bpm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Simulated HRV RMSSD:</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{ehr.restingHrvBaseline + deltaHrvMs} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sliders & Parameter Modifiers */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
          Counterfactual Parameter Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sleep Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1.5">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Sleep Duration Adjustment</span>
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                {deltaSleepHours > 0 ? `+${deltaSleepHours.toFixed(1)}` : deltaSleepHours.toFixed(1)} hrs
              </span>
            </div>
            <input
              type="range"
              min="-3.0"
              max="3.0"
              step="0.5"
              value={deltaSleepHours}
              onChange={(e) => setDeltaSleepHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-3.0 hrs (Deprivation)</span>
              <span>Baseline</span>
              <span>+3.0 hrs (Restoration)</span>
            </div>
          </div>

          {/* Systolic BP Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Systolic Blood Pressure Delta</span>
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                {deltaSystolicBP > 0 ? `+${deltaSystolicBP}` : deltaSystolicBP} mmHg
              </span>
            </div>
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={deltaSystolicBP}
              onChange={(e) => setDeltaSystolicBP(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-35 mmHg (Controlled)</span>
              <span>Baseline</span>
              <span>+35 mmHg (Crisis)</span>
            </div>
          </div>

          {/* Heart Rate Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Resting Heart Rate Delta</span>
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                {deltaHeartRateBpm > 0 ? `+${deltaHeartRateBpm}` : deltaHeartRateBpm} bpm
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="2"
              value={deltaHeartRateBpm}
              onChange={(e) => setDeltaHeartRateBpm(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-20 bpm (Conditioning)</span>
              <span>Baseline</span>
              <span>+30 bpm (Tachycardia)</span>
            </div>
          </div>

          {/* HRV RMSSD Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-teal-500" />
                <span>Autonomic HRV RMSSD Delta</span>
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                {deltaHrvMs > 0 ? `+${deltaHrvMs}` : deltaHrvMs} ms
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="2"
              value={deltaHrvMs}
              onChange={(e) => setDeltaHrvMs(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-20 ms (Overdrive)</span>
              <span>Baseline</span>
              <span>+30 ms (Parasympathetic)</span>
            </div>
          </div>
        </div>

        {/* Categorical Interventions: Medication adherence & Activity */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={adhereMedication}
              onChange={(e) => setAdhereMedication(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 focus:ring-0"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-200 block">Strict Antihypertensive Adherence</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Therapeutic blood pressure reduction and circadian stabilization</span>
            </div>
          </label>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Activity State:</span>
            <div className="flex items-center space-x-1">
              {(['Sedentary', 'Light', 'Moderate'] as ActivityIntensity[]).map((act) => (
                <button
                  key={act}
                  onClick={() => setOverrideActivity(overrideActivity === act ? undefined : act)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    overrideActivity === act
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Scenarios Comparison Deck */}
      {savedScenarios.length > 0 && (
        <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Saved Scenarios Comparison</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {savedScenarios.map((scen) => (
              <div
                key={scen.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{scen.name}</span>
                  <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                    Simulated P(Risk): {(scen.result.simulatedPrediction.riskProbability * 100).toFixed(1)}% ({scen.result.percentChange > 0 ? '+' : ''}{scen.result.percentChange}%)
                  </span>
                </div>
                <button
                  onClick={() => handleLoadScenario(scen)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
