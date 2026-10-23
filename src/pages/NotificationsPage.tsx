import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Radio,
  BrainCircuit,
  Database
} from 'lucide-react';
import { AppNotification, NavTab } from '../types';
import { notificationStore } from '../utils/notificationStore';

interface NotificationsPageProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectPatient: (patientId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  onNavigateTab,
  onSelectPatient,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterRead, setFilterRead] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const updateList = () => {
      setNotifications([...notificationStore.getAll()]);
    };
    updateList();
    const unsub = notificationStore.subscribe(updateList);
    return () => unsub();
  }, []);

  const handleMarkAsRead = (id: string) => {
    notificationStore.markAsRead(id);
  };

  const handleMarkAllRead = () => {
    notificationStore.markAllAsRead();
  };

  const handleClearAll = () => {
    notificationStore.clearAll();
  };

  const filtered = notifications.filter((n) => {
    if (filterRead === 'unread' && n.read) return false;
    if (filterCategory !== 'ALL' && n.category !== filterCategory) return false;
    return true;
  });

  const getSeverityIcon = (sev: AppNotification['severity']) => {
    switch (sev) {
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-cyan-500 shrink-0" />;
    }
  };

  const getCategoryBadge = (cat: AppNotification['category']) => {
    switch (cat) {
      case 'Risk':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'Stream':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Twin':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'Quality':
        return 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30';
      case 'Report':
      default:
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Deck */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Clinical Notification Center
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time feed of physiological risk threshold breaches, stream synchronization events, and counterfactual calculations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.read)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 disabled:opacity-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-cyan-500" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#0c1222] p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setFilterRead('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterRead === 'all'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterRead('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterRead === 'unread'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto">
          {['ALL', 'Risk', 'Stream', 'Twin', 'Quality'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#0f172a]/60 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800/80">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Notifications Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              There are no matching notifications in the current view. New clinical alerts and telemetry events will appear here automatically.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.read
                  ? 'bg-white/80 dark:bg-[#0d1424]/60 border-slate-200 dark:border-slate-800/60 opacity-80'
                  : 'bg-white dark:bg-[#0f172a] border-cyan-500/30 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(item.severity)}
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getCategoryBadge(item.category)}`}>
                        {item.category}
                      </span>
                      {item.patientId && (
                        <button
                          onClick={() => {
                            if (item.patientId) {
                              onSelectPatient(item.patientId);
                              onNavigateTab('overview');
                            }
                          }}
                          className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
                        >
                          {item.patientId}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono mt-2">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
