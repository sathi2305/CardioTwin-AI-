import React from 'react';
import { RiskLevel } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'teal' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate' | 'risk';
  riskLevel?: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  riskLevel,
  size = 'md',
  className = '',
}) => {
  let colorStyle = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';

  if (riskLevel) {
    switch (riskLevel) {
      case 'High':
        colorStyle = 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-900/20';
        break;
      case 'Elevated':
        colorStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-900/20';
        break;
      case 'Moderate':
        colorStyle = 'bg-teal-500/15 text-teal-300 border-teal-500/40';
        break;
      case 'Low':
      default:
        colorStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
        break;
    }
  } else {
    switch (variant) {
      case 'rose':
        colorStyle = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
        break;
      case 'amber':
        colorStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
        break;
      case 'emerald':
        colorStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
        break;
      case 'teal':
        colorStyle = 'bg-teal-500/10 text-teal-300 border-teal-500/30';
        break;
      case 'purple':
        colorStyle = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
        break;
      case 'slate':
        colorStyle = 'bg-slate-800 text-slate-300 border-slate-700';
        break;
      case 'cyan':
      default:
        colorStyle = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
        break;
    }
  }

  const sizeStyle = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md font-sans tracking-wide ${colorStyle} ${sizeStyle} ${className}`}
    >
      {children}
    </span>
  );
};
