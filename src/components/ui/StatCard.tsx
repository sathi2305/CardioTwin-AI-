import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  statusColor?: 'cyan' | 'teal' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  subValue,
  trend,
  trendValue,
  statusColor = 'cyan',
  tooltip,
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15',
    },
    teal: {
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      text: 'text-teal-400',
      iconBg: 'bg-teal-500/15',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/15',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      iconBg: 'bg-rose-500/15',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      iconBg: 'bg-purple-500/15',
    },
    slate: {
      bg: 'bg-slate-800/40',
      border: 'border-slate-800',
      text: 'text-slate-300',
      iconBg: 'bg-slate-800',
    },
  };

  const scheme = colorMap[statusColor];

  return (
    <div
      className={`p-4 rounded-xl bg-[#0f172a]/80 border ${scheme.border} backdrop-blur-sm relative overflow-hidden transition-all duration-200 hover:border-slate-700 hover:bg-[#121c33] group`}
      title={tooltip}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">{label}</span>
        <div className={`p-2 rounded-lg ${scheme.iconBg} ${scheme.text} group-hover:scale-105 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl font-extrabold text-white tracking-tight font-sans">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        {subValue && <span>{subValue}</span>}
        {trendValue && (
          <span
            className={`font-semibold flex items-center ${
              trend === 'up'
                ? 'text-rose-400'
                : trend === 'down'
                ? 'text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            {trend === 'up' ? '▲ ' : trend === 'down' ? '▼ ' : ''}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};
