import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Activity, 
  Moon, 
  Heart, 
  BrainCircuit, 
  Filter 
} from 'lucide-react';
import { DigitalTwinState, AIInsight } from '../types';
import { generatePatientInsights } from '../utils/insightsStore';
import { Badge } from '../components/ui/Badge';
import { HealthcareLanguageAssistant } from '../components/twin/HealthcareLanguageAssistant';
import { PatientHistoricalTrendsChart } from '../components/charts/PatientHistoricalTrendsChart';
import { useLanguage } from '../context/LanguageContext';

interface InsightsPageProps {
  twinState: DigitalTwinState;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ twinState }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const insights = generatePatientInsights(twinState);

  const filteredInsights = insights.filter(
    (ins) => selectedCategory === 'ALL' || ins.category.toUpperCase() === selectedCategory
  );

  const getSeverityBadge = (sev: AIInsight['severity']) => {
    switch (sev) {
      case 'alert':
        return <Badge riskLevel="High">Alert</Badge>;
      case 'caution':
        return <Badge riskLevel="Elevated">Caution</Badge>;
      case 'positive':
        return <Badge riskLevel="Low">Favorable</Badge>;
      case 'normal':
      default:
        return <Badge riskLevel="Moderate">Informational</Badge>;
    }
  };

  const getCategoryIcon = (cat: AIInsight['category']) => {
    switch (cat) {
      case 'Autonomic':
        return <Activity className="w-4 h-4 text-teal-500" />;
      case 'Hemodynamic':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'Lifestyle':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'Model':
      default:
        return <BrainCircuit className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Clinical AI Insights & Physiological Rules Engine
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              Rule-Based Explainability
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Evidence-grounded pattern detection generated from {twinState.ehr.fullName}'s longitudinal EHR records and active 60-minute streaming telemetry. Distinguishes descriptive observations from model predictions.
          </p>
        </div>
      </div>

      {/* Multilingual Healthcare Assistant Panel */}
      <HealthcareLanguageAssistant twinState={twinState} />

      {/* 30-Day Historical Heart Rate & HRV Trends Chart (recharts) */}
      <PatientHistoricalTrendsChart
        patient={twinState.ehr}
        latestObservation={twinState.latestObservation}
      />

      {/* Filter Toolbar & Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Physiological Rule Attributions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated hemodynamic, autonomic, and lifestyle findings
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
          {['ALL', 'AUTONOMIC', 'HEMODYNAMIC', 'LIFESTYLE', 'MODEL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {getCategoryIcon(insight.category)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {insight.category} Domain
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {insight.title}
                    </h3>
                  </div>
                </div>
                {getSeverityBadge(insight.severity)}
              </div>

              {/* Supporting Metrics Callout */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block uppercase">Supporting Telemetry / EHR Data:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold block mt-0.5">
                  {insight.supportingMetrics}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Window: {insight.period}
                </span>
              </div>

              {/* Clinical Explanation */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.explanation}
              </p>
            </div>

            {/* Bottom Metadata & Provenance */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="truncate max-w-[240px]">{insight.dataQualityStatus}</span>
              {insight.confidenceScore && (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {(insight.confidenceScore * 100).toFixed(0)}% Confidence
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interpretability Boundary Notice */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex items-start space-x-3">
        <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Scientific Transparency Notice:</span>
          Insights are deterministic rule-based inferences grounded in established autonomic physiology and the fitted predictive model. They represent analytical guidance within this educational prototype and do not constitute an automated medical diagnosis.
        </div>
      </div>
    </div>
  );
};
