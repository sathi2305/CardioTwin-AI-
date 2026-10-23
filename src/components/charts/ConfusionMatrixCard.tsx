import React from 'react';

interface ConfusionMatrixProps {
  matrix: {
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
    truePositive: number;
  };
}

export const ConfusionMatrixCard: React.FC<ConfusionMatrixProps> = ({ matrix }) => {
  const { trueNegative, falsePositive, falseNegative, truePositive } = matrix;
  const total = trueNegative + falsePositive + falseNegative + truePositive;

  const sensitivity = (truePositive / (truePositive + falseNegative)) * 100;
  const specificity = (trueNegative / (trueNegative + falsePositive)) * 100;
  const precision = (truePositive / (truePositive + falsePositive)) * 100;
  const npv = (trueNegative / (trueNegative + falseNegative)) * 100;

  return (
    <div className="bg-[#0f172a]/90 rounded-xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Held-Out Test Confusion Matrix</h3>
          <p className="text-xs text-slate-400">
            N = {total.toLocaleString()} independent held-out time-windows (Patient-Level Split)
          </p>
        </div>
        <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
          GroupKFold Verified
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* True Negative */}
        <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            True Negative (TN)
          </span>
          <div className="text-xl font-extrabold text-white mt-0.5">{trueNegative.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">Correctly classified baseline/stable</span>
        </div>

        {/* False Positive */}
        <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            False Positive (Type I)
          </span>
          <div className="text-xl font-extrabold text-white mt-0.5">{falsePositive.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">False alert on stable physiology</span>
        </div>

        {/* False Negative */}
        <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/30">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            False Negative (Type II)
          </span>
          <div className="text-xl font-extrabold text-white mt-0.5">{falseNegative.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">Missed elevated strain event</span>
        </div>

        {/* True Positive */}
        <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            True Positive (TP)
          </span>
          <div className="text-xl font-extrabold text-white mt-0.5">{truePositive.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">Correctly detected elevated pattern</span>
        </div>
      </div>

      {/* Calculated Statistical Ratios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-center">
        <div>
          <span className="text-[10px] text-slate-400 uppercase">Sensitivity (Recall)</span>
          <p className="text-xs font-mono font-bold text-cyan-300 mt-0.5">{sensitivity.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase">Specificity</span>
          <p className="text-xs font-mono font-bold text-emerald-300 mt-0.5">{specificity.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase">Precision (PPV)</span>
          <p className="text-xs font-mono font-bold text-teal-300 mt-0.5">{precision.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase">Neg. Pred. Value</span>
          <p className="text-xs font-mono font-bold text-purple-300 mt-0.5">{npv.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
