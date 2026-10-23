import React from 'react';
import { FeatureContribution } from '../../types';

interface FeatureContributionBarProps {
  contributions: FeatureContribution[];
}

export const FeatureContributionBar: React.FC<FeatureContributionBarProps> = ({ contributions }) => {
  return (
    <div className="space-y-3.5">
      {contributions.map((fc) => {
        const isElevating = fc.contribution > 0;
        const absVal = Math.min(100, Math.abs(fc.contribution) * 200);

        return (
          <div key={fc.feature} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <div>
                <span className="font-semibold text-slate-200">{fc.label}</span>
                <span className="ml-2 text-[10px] text-slate-400 font-mono">
                  Observed: <strong className="text-cyan-400">{fc.patientValue}</strong> (Norm: {fc.baselineValue})
                </span>
              </div>
              <span
                className={`font-mono text-xs font-bold ${
                  isElevating ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isElevating ? '+' : ''}
                {(fc.contribution * 100).toFixed(1)}% Impact
              </span>
            </div>

            {/* Impact Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              {isElevating ? (
                <>
                  <div className="w-1/2 bg-transparent" />
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-r-full"
                    style={{ width: `${Math.min(50, absVal / 2)}%` }}
                  />
                </>
              ) : (
                <>
                  <div className="w-1/2 flex justify-end">
                    <div
                      className="h-full bg-gradient-to-l from-teal-500 to-emerald-500 rounded-l-full"
                      style={{ width: `${Math.min(50, absVal / 2)}%` }}
                    />
                  </div>
                  <div className="w-1/2 bg-transparent" />
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-1">{fc.description}</p>
          </div>
        );
      })}
    </div>
  );
};
