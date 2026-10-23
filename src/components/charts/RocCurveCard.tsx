import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface RocCurveCardProps {
  rocCurve: { fpr: number; tpr: number; threshold: number }[];
  prCurve: { recall: number; precision: number; threshold: number }[];
  rocAuc: number;
}

export const RocCurveCard: React.FC<RocCurveCardProps> = ({ rocCurve, prCurve, rocAuc }) => {
  const [activeTab, setActiveTab] = useState<'roc' | 'pr'>('roc');

  return (
    <div className="bg-[#0f172a]/90 rounded-xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Discrimination Curves</h3>
          <p className="text-xs text-slate-400">
            {activeTab === 'roc' ? `ROC Curve (Held-Out ROC-AUC = ${rocAuc})` : 'Precision-Recall Curve (PR-AUC = 0.835)'}
          </p>
        </div>
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('roc')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              activeTab === 'roc' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            ROC (AUC {rocAuc})
          </button>
          <button
            onClick={() => setActiveTab('pr')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              activeTab === 'pr' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            Precision-Recall
          </button>
        </div>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'roc' ? (
            <LineChart data={rocCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="fpr"
                type="number"
                domain={[0, 1]}
                stroke="#64748b"
                fontSize={10}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <YAxis
                dataKey="tpr"
                type="number"
                domain={[0, 1]}
                stroke="#64748b"
                fontSize={10}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0f172a] border border-slate-700 p-2 rounded-lg text-xs">
                        <p className="text-slate-400 font-mono text-[10px]">Decision Cutoff: {data.threshold}</p>
                        <p className="text-cyan-400 font-bold">TPR (Sensitivity): {(data.tpr * 100).toFixed(1)}%</p>
                        <p className="text-slate-300">FPR (1-Spec): {(data.fpr * 100).toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Chance diagonal */}
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                ]}
                stroke="#475569"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="tpr"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06b6d4' }}
              />
            </LineChart>
          ) : (
            <LineChart data={prCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="recall"
                type="number"
                domain={[0, 1]}
                stroke="#64748b"
                fontSize={10}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <YAxis
                dataKey="precision"
                type="number"
                domain={[0, 1]}
                stroke="#64748b"
                fontSize={10}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0f172a] border border-slate-700 p-2 rounded-lg text-xs">
                        <p className="text-slate-400 font-mono text-[10px]">Cutoff: {data.threshold}</p>
                        <p className="text-teal-400 font-bold">Precision: {(data.precision * 100).toFixed(1)}%</p>
                        <p className="text-slate-300">Recall: {(data.recall * 100).toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="precision"
                stroke="#14b8a6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#14b8a6' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-center text-[11px] text-slate-400 font-mono">
        {activeTab === 'roc' ? 'False Positive Rate (1 - Specificity) vs True Positive Rate (Sensitivity)' : 'Recall (Sensitivity) vs Precision (Positive Predictive Value)'}
      </div>
    </div>
  );
};
