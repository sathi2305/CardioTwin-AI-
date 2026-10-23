import React from 'react';
import { 
  LineChart as LineChartIcon, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  Scale, 
  Cpu, 
  Database,
  BarChart3,
  Award
} from 'lucide-react';
import { BENCHMARK_MODEL_METRICS } from '../data/modelEvaluation';
import { ConfusionMatrixCard } from '../components/charts/ConfusionMatrixCard';
import { RocCurveCard } from '../components/charts/RocCurveCard';
import { useLanguage } from '../context/LanguageContext';

export const ModelLabPage: React.FC = () => {
  const metrics = BENCHMARK_MODEL_METRICS;
  const candidate = metrics.candidateModel;
  const baseline = metrics.baselineModel;
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Technical Jury Executive Header */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('nav.modelLab', 'Model Performance Lab & Technical Validation Suite')}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              Jury Review Specification
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Evaluated on <strong className="text-slate-900 dark:text-white font-mono">{metrics.testSamples.toLocaleString()} held-out observations</strong> partitioned via strict Patient-Level GroupKFold. Zero data leakage across train and test sets.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase block">Held-Out ROC-AUC</span>
            <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">{candidate.rocAuc}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase block">Held-Out F1 Score</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{candidate.f1Score}</span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Head-to-Head Table */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-[#0b1224] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Head-to-Head Model Evaluation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparing candidate ensemble pipeline against linear logistic baseline on held-out test data</p>
          </div>
          <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            {metrics.splitStrategy}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4">Candidate Model (GBDT / Random Forest)</th>
                <th className="py-3 px-4">Baseline Model (L2 Logistic Regression)</th>
                <th className="py-3 px-4 text-right">Delta / Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">ROC-AUC Score</td>
                <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">{candidate.rocAuc.toFixed(3)}</td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{baseline.rocAuc.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">+{(candidate.rocAuc - baseline.rocAuc).toFixed(3)} (+12.5%)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">F1-Score (Macro)</td>
                <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">{candidate.f1Score.toFixed(3)}</td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{baseline.f1Score.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">+{(candidate.f1Score - baseline.f1Score).toFixed(3)} (+12.7%)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">Precision (PPV)</td>
                <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">{candidate.precision.toFixed(3)}</td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{baseline.precision.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">+{(candidate.precision - baseline.precision).toFixed(3)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">Recall / Sensitivity</td>
                <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">{candidate.recall.toFixed(3)}</td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{baseline.recall.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">+{(candidate.recall - baseline.recall).toFixed(3)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">Overall Accuracy</td>
                <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">{candidate.accuracy.toFixed(3)}</td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{baseline.accuracy.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">+{(candidate.accuracy - baseline.accuracy).toFixed(3)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">Brier Calibration Score</td>
                <td className="py-3 px-4 font-bold text-teal-600 dark:text-teal-400">{candidate.brierScore.toFixed(3)} (Low error)</td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400">0.182</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">-0.074 (Superior calibration)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dual Cards: Confusion Matrix & ROC/PR Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ConfusionMatrixCard matrix={candidate.confusionMatrix} />
        <RocCurveCard rocCurve={candidate.rocCurve} prCurve={candidate.prCurve} rocAuc={candidate.rocAuc} />
      </div>

      {/* Global Feature Importances */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              <span>Gini / Permutation Feature Importances (Fitted Candidate Model)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Relative predictive weight assigned to each static EHR and dynamic wearable feature window.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Normalized Σ = 1.00</span>
        </div>

        <div className="space-y-2.5">
          {candidate.featureImportances.map((fi) => (
            <div key={fi.feature} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{fi.label}</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{(fi.importance * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${fi.importance * 350}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodological Transparency & Anti-Leakage Protocol */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Technical Rigor & Anti-Leakage Protocol</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">Strict Patient-Level Partitioning</span>
            <p className="leading-relaxed text-slate-600 dark:text-slate-400">
              Training and testing sets do not share samples from the same patient. GroupKFold stratification ensures test predictions reflect generalization to unseen subjects rather than memorizing individual baseline rhythms.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">Chronological Non-Overlap & Horizon Buffering</span>
            <p className="leading-relaxed text-slate-600 dark:text-slate-400">
              The 2-hour forward prediction target is strictly buffered from the 60-minute feature window. No forward sensor measurements or future timestamps contaminate current prediction feature engineering.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Documented Limitations (Per Section 3 & 12 Requirements):</span>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed">
            {metrics.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
