import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { WearableObservation } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HeartRateChartProps {
  observations: WearableObservation[];
  baselineHR: number;
}

export const HeartRateChart: React.FC<HeartRateChartProps> = ({ observations, baselineHR }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const chartData = (observations || []).map((o) => ({
    time: new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    heartRate: o.heartRate,
    isAlert: o.isSimulatedAlert,
    rawTimestamp: o.timestamp,
    activity: o.activityIntensity,
  }));

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#64748b' : '#475569';
  const axisLineColor = isDark ? '#334155' : '#cbd5e1';

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="time"
            stroke={textColor}
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: axisLineColor }}
          />
          <YAxis
            domain={['dataMin - 10', 'dataMax + 15']}
            stroke={textColor}
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: axisLineColor }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg shadow-xl text-xs text-slate-800 dark:text-slate-100">
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{data.time}</p>
                    <p className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                      {data.heartRate} <span className="text-slate-500 text-xs font-normal">bpm</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">Activity: {data.activity}</p>
                    {data.isAlert && (
                      <p className="text-rose-600 dark:text-rose-400 font-semibold text-[10px] mt-1">
                        ⚠️ Simulated Tachycardia Alert
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={baselineHR}
            stroke={isDark ? '#94a3b8' : '#475569'}
            strokeDasharray="4 4"
            label={{
              value: `Baseline: ${baselineHR} bpm`,
              fill: isDark ? '#94a3b8' : '#475569',
              fontSize: 10,
              position: 'insideTopLeft',
            }}
          />
          <ReferenceLine
            y={100}
            stroke="#f43f5e"
            strokeDasharray="3 3"
            label={{
              value: 'Tachycardia (100 bpm)',
              fill: '#f43f5e',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="heartRate"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#hrGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
