import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  User, 
  Activity,
  Heart,
  Share2
} from 'lucide-react';
import { DigitalTwinState } from '../types';
import { Badge } from '../components/ui/Badge';
import { useLanguage } from '../context/LanguageContext';

interface ReportsPageProps {
  twinState: DigitalTwinState;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ twinState }) => {
  const { ehr, latestObservation, currentPrediction, recentObservations } = twinState;
  const { t, formatNumber, formatDate } = useLanguage();
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    setDownloading(true);
    const headers = 'Timestamp,PatientId,HeartRate_BPM,HRV_RMSSD_ms,SpO2,SleepDuration_Hours,ActivityIntensity,SignalQuality,SimulatedAlert\n';
    const rows = recentObservations.map((o) => 
      `${o.timestamp},${o.patientId},${o.heartRate},${o.hrvRmssd},${o.spo2},${o.sleepDurationHours},${o.activityIntensity},${o.signalQuality},${o.isSimulatedAlert ? 1 : 0}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CardioTwin_${ehr.patientId}_timeseries_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 500);
  };

  const handleDownloadSummaryJson = () => {
    const summary = {
      project: 'CardioTwin AI — Personalized Cardiovascular Digital Twin',
      challenge: 'Happiest Health Digital Twin Challenge 2026',
      generatedAt: new Date().toISOString(),
      patientTwin: {
        id: ehr.patientId,
        demographics: {
          fullName: ehr.fullName,
          age: ehr.age,
          gender: ehr.gender,
          bmi: ehr.bmi,
          smokingStatus: ehr.smokingStatus
        },
        ehrMarkers: {
          bloodPressure: `${ehr.systolicBP}/${ehr.diastolicBP} mmHg`,
          hba1c: `${ehr.hbA1c}%`,
          cholesterolRatio: (ehr.ldlCholesterol / ehr.hdlCholesterol).toFixed(2),
          hasCAD: ehr.hasCAD,
          hasHypertension: ehr.hasHypertension
        },
        latestObservations: latestObservation,
        predictiveModelOutput: currentPrediction
      }
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CardioTwin_Summary_${ehr.patientId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Deck - Hidden on print */}
      <div className="no-print bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{t('nav.reports')}</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Export patient-specific digital twin profiles, calibrated predictive horizons, and timestamped multi-sensor time-series for clinical review and research audit.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : t('action.downloadCsv')}</span>
          </button>

          <button
            onClick={handleDownloadSummaryJson}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-cyan-500" />
            <span>JSON Dossier</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title={t('action.printReport')}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Clinical Digital Twin Summary Card */}
      <div className="bg-white dark:bg-[#0f172a]/95 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 print:bg-white print:text-black print:border print:border-slate-300 print:shadow-none print:p-4">
        {/* Dossier Header */}
        <div className="flex flex-wrap items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
              <span>CardioTwin AI Platform</span>
              <span>•</span>
              <span>Clinical Proof-of-Concept Summary</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Patient Digital Twin Clinical Summary: {ehr.fullName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Subject ID: <strong>{ehr.patientId}</strong> | Report Generated: {new Date().toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <Badge riskLevel={currentPrediction.riskLevel} size="lg">
              {currentPrediction.riskLevel} Risk Horizon
            </Badge>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-1">
              Calibrated P(Strain)= {(currentPrediction.riskProbability * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Clinical EHR & Lifestyle Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase block font-medium">Age & Gender</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">{ehr.age} yrs • {ehr.gender}</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">BMI: {ehr.bmi}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase block font-medium">Historical Blood Pressure</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">{ehr.systolicBP}/{ehr.diastolicBP} mmHg</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">Exam: {ehr.lastExamDate}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase block font-medium">Glycemia & Lipids</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">HbA1c: {ehr.hbA1c}%</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">LDL/HDL: {(ehr.ldlCholesterol / ehr.hdlCholesterol).toFixed(2)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase block font-medium">Resting Baselines</span>
            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-300 mt-0.5 block font-mono">{ehr.restingHeartRateBaseline} bpm • {ehr.restingHrvBaseline} ms</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">Circadian baseline</span>
          </div>
        </div>

        {/* Active Pharmacotherapy */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
            Longitudinal Pharmacotherapy Context
          </span>
          <div className="flex flex-wrap gap-2">
            {ehr.medications.map((m, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono border border-slate-200 dark:border-slate-700">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Latest Dynamic Observations Window */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
            Recent Dynamic Sensor Observations (Last 60 Minutes)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Current Heart Rate</span>
              <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{latestObservation.heartRate} bpm</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">HRV RMSSD</span>
              <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{latestObservation.hrvRmssd} ms</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Blood Oxygen (SpO2)</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{latestObservation.spo2}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Sleep Duration</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{(latestObservation?.sleepDurationHours ?? 7.0).toFixed(1)} hrs</span>
            </div>
          </div>
        </div>

        {/* Additive Feature Contributions Table */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block">
            Predictive Model Attributions (Additive Feature Impacts)
          </span>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Feature Domain</th>
                  <th className="py-2.5 px-3">Subject Value</th>
                  <th className="py-2.5 px-3">Population Norm</th>
                  <th className="py-2.5 px-3">Relative Impact</th>
                  <th className="py-2.5 px-3">Clinical Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 bg-white dark:bg-[#0f172a]">
                {currentPrediction.featureContributions.map((fc) => (
                  <tr key={fc.feature} className="text-slate-700 dark:text-slate-300">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">{fc.label}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-700 dark:text-cyan-300 font-bold">{fc.patientValue}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">{fc.baselineValue}</td>
                    <td className={`py-2.5 px-3 font-mono font-bold ${fc.contribution > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {fc.contribution > 0 ? '+' : ''}{(fc.contribution * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">{fc.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mandatory Regulatory & Ethics Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
          <span className="font-bold text-amber-600 dark:text-amber-400 block">Regulatory Compliance & Ethical Notice:</span>
          <p>
            CardioTwin AI is a software research proof-of-concept developed for the Happiest Health Digital Twin Challenge 2026. All patient identities, histories, and time-series sensor observations are strictly synthetic. This system is not cleared as a medical device by the US FDA, EMA, or CDSCO and must not be used for emergency diagnosis or treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
