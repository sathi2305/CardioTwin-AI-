import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  ArrowRight, 
  Bell, 
  Activity,
  ShieldAlert
} from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'alert' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface SystemToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const SystemToast: React.FC<SystemToastProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    const duration = toast.durationMs ?? (toast.type === 'alert' ? 7000 : 4000);
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    setProgress(100);

    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return Math.max(0, prev - step);
        });
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [toast, isPaused, onClose]);

  if (!toast) return null;

  const isAlert = toast.type === 'alert';
  const isWarning = toast.type === 'warning';
  const isSuccess = toast.type === 'success';

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-[420px] rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
        isAlert
          ? 'bg-white dark:bg-[#13111c] border-rose-500/80 shadow-rose-500/20 text-slate-900 dark:text-slate-100 ring-1 ring-rose-500/30'
          : isWarning
          ? 'bg-white dark:bg-[#19150d] border-amber-500/80 shadow-amber-500/20 text-slate-900 dark:text-slate-100 ring-1 ring-amber-500/30'
          : isSuccess
          ? 'bg-white dark:bg-[#0c1a17] border-emerald-500/80 shadow-emerald-500/20 text-slate-900 dark:text-slate-100'
          : 'bg-white dark:bg-[#0f172a] border-cyan-500/80 shadow-cyan-500/20 text-slate-900 dark:text-slate-100'
      }`}
    >
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isAlert
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                  : isWarning
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : isSuccess
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {isAlert ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                  {toast.title}
                </span>
                {toast.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      isAlert
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                        : 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {toast.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                Automated System Trigger • Real-Time Stream Monitor
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Dismiss toast"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 pl-11 leading-relaxed">
          {toast.message}
        </p>

        {toast.actionLabel && toast.onAction && (
          <div className="pt-2 pl-11 flex items-center space-x-2">
            <button
              onClick={() => {
                toast.onAction?.();
                onClose();
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                isAlert
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              <span>{toast.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Animated countdown progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1">
        <div
          className={`h-full transition-all duration-75 ease-linear ${
            isAlert ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : isSuccess ? 'bg-emerald-500' : 'bg-cyan-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
