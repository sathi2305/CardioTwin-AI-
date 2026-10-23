import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  Radio, 
  Clock 
} from 'lucide-react';
import { AppNotification } from '../../types';
import { notificationStore } from '../../utils/notificationStore';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (patientId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const update = () => setNotifications(notificationStore.getAll());
    update();
    const unsub = notificationStore.subscribe(update);
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const filtered = notifications.filter(
    (n) => filter === 'ALL' || n.category.toUpperCase() === filter
  );

  const getSeverityIcon = (sev: AppNotification['severity']) => {
    switch (sev) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-cyan-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Notifications Center
              </h2>
              {notificationStore.getUnreadCount() > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30">
                  {notificationStore.getUnreadCount()} new
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            {/* Filter buttons */}
            <div className="flex items-center space-x-1">
              {['ALL', 'RISK', 'TWIN', 'STREAM'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    filter === f
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => notificationStore.markAllAsRead()}
                className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1 text-[11px]"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
              <button
                onClick={() => notificationStore.clearAll()}
                className="text-slate-400 hover:text-rose-500 text-[11px]"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No notifications recorded in this category.
              </div>
            ) : (
              filtered.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    notificationStore.markAsRead(notif.id);
                    if (notif.patientId && onSelectPatient) {
                      onSelectPatient(notif.patientId);
                    }
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    !notif.read
                      ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-500/30 shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                  } hover:border-cyan-500/40`}
                >
                  <div className="flex items-start space-x-2.5">
                    {getSeverityIcon(notif.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 ml-1.5" />
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                        <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                        {notif.patientId && (
                          <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                            {notif.patientId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
