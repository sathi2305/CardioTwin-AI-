import React from 'react';
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
import { WearableObservation } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HrvChartProps {
  observations: WearableObservation[];
  baselineHrv: number;
}

export const HrvChart: React.FC<HrvChartProps> = ({ observations, baselineHrv }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const chartData = (observations || []).map((o) => ({
    time: new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hrvRmssd: o.hrvRmssd,
    rawTimestamp: o.timestamp,
  }));

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#64748b' : '#475569';
  const axisLineColor = isDark ? '#334155' : '#cbd5e1';

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="time"
            stroke={textColor}
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: axisLineColor }}
          />
          <YAxis
            domain={[10, 80]}
            stroke={textColor}
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: axisLineColor }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const isDepressed = data.hrvRmssd < 25;
                return (
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg shadow-xl text-xs text-slate-800 dark:text-slate-100">
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{data.time}</p>
                    <p className="text-teal-600 dark:text-teal-400 font-bold text-sm">
                      {data.hrvRmssd} <span className="text-slate-500 text-xs font-normal">ms (RMSSD)</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-[10px] mt-1">
                      {isDepressed
                        ? '⚠️ Depressed Parasympathetic Modulation'
                        : '✓ Normal Vagal Modulation'}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={baselineHrv}
            stroke="#14b8a6"
            strokeDasharray="4 4"
            label={{
              value: `Baseline: ${baselineHrv} ms`,
              fill: '#14b8a6',
              fontSize: 10,
              position: 'insideTopLeft',
            }}
          />
          <ReferenceLine
            y={25}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{
              value: 'Autonomic Strain (<25 ms)',
              fill: '#f59e0b',
              fontSize: 10,
              position: 'insideBottomRight',
            }}
          />
          <Line
            type="monotone"
            dataKey="hrvRmssd"
            stroke="#14b8a6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#2dd4bf' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
