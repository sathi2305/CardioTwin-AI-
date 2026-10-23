import React from 'react';
import { 
  BrainCircuit, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  TrendingUp, 
  Scale, 
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DigitalTwinState } from '../types';
import { Badge } from '../components/ui/Badge';
import { FeatureContributionBar } from '../components/twin/FeatureContributionBar';
import { useLanguage } from '../context/LanguageContext';

interface RiskAnalysisPageProps {
  twinState: DigitalTwinState;
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({ twinState }) => {
  const { ehr, currentPrediction, latestObservation } = twinState;
  const { t, formatPercent } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Target Definition & Prediction Header */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('nav.riskAnalysis', 'AI Predictive Risk Intelligence')}
            </h2>
            <Badge riskLevel={currentPrediction.riskLevel} size="md">
              {currentPrediction.riskLevel} Risk Tier
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Target: <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{currentPrediction.targetName}</strong> across a{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-mono">120-minute forward horizon</strong>, combining dynamic wearable window with longitudinal EHR markers.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium">Calibrated Probability</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-sans">
                {formatPercent ? formatPercent(currentPrediction.riskProbability * 100, 1) : `${(currentPrediction.riskProbability * 100).toFixed(1)}%`}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">P(Risk=1)</span>
            </div>
          </div>
          <div className="pl-4 border-l border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Model Confidence</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {(currentPrediction.modelConfidence * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Threshold: 0.50</span>
          </div>
        </div>
      </div>

      {/* Model Output vs Baseline Comparison Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Candidate Model</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">Calibrated GBDT / RF</div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-sans mt-1">
            {(currentPrediction.riskProbability * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Full static + dynamic time-series fusion</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Standard Baseline</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">L2 Logistic Regression</div>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 font-sans mt-1">
            {(currentPrediction.baselineModelProbability * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Uncalibrated linear demographic baseline</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Odds Ratio Shift</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">Dynamic Risk Multiplier</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-sans mt-1">
            {currentPrediction.oddsRatioChange.toFixed(2)}x
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Elevation relative to standard baseline</span>
        </div>
      </div>

      {/* Explainability & SHAP-Style Attributions */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>Local Feature Attribution (SHAP-Inspired Values)</span>
              <span className="text-[10px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                Additive Explainability
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quantifying how each individual physiological observation and historical comorbidity shifted the baseline prediction probability for this subject.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 mr-1.5" /> Increases Risk
            </span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 mr-1.5" /> Decreases Risk
            </span>
          </div>
        </div>

        <FeatureContributionBar contributions={currentPrediction.featureContributions} />
      </div>

      {/* Methodological Transparency & Non-Causation Callout */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold">
          <Info className="w-4 h-4 shrink-0" />
          <span>Clinical & Scientific Interpretability Boundary</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
          <li>
            <strong>Correlation vs Causation:</strong> Feature contribution values measure mathematical weight within the fitted decision boundary. They do not prove clinical causation or imply guaranteed therapeutic outcomes.
          </li>
          <li>
            <strong>Calibrated Probability vs Risk:</strong> This probability reflects likelihood of simulated physiological pattern elevation within 2 hours, not a verified diagnosis of acute myocardial infarction or stroke.
          </li>
          <li>
            <strong>Data Integrity:</strong> Missing sensor observations are flagged explicitly; missing values are imputed using population median baselines rather than assumed to be healthy.
          </li>
        </ul>
      </div>
    </div>
  );
};
