import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  Sidebar as SidebarIcon, 
  EyeOff, 
  Sparkles, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Sliders,
  Keyboard,
  Languages,
  Contrast,
  BellRing,
  Volume2,
  VolumeX,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeMode, SidebarMode, NavTab } from '../types';
import { KeyboardShortcutsModal } from '../components/ui/KeyboardShortcutsModal';
import { SupportedLanguage } from '../i18n/types';
import { alertThresholdManager, AlertThresholdSettings } from '../utils/alertThresholdManager';

interface SettingsPageProps {
  onOpenShortcuts?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenShortcuts, onNavigateTab }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { mode, setMode } = useSidebar();
  const { language, setLanguage, languages, t } = useLanguage();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [density, setDensity] = useState<'normal' | 'compact'>('normal');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [internalShortcutsOpen, setInternalShortcutsOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertThresholdSettings>(() =>
    alertThresholdManager.getSettings()
  );
  const [testSent, setTestSent] = useState(false);

  React.useEffect(() => {
    const unsub = alertThresholdManager.subscribe((s) => setAlertSettings(s));
    return () => unsub();
  }, []);

  const handleOpenShortcuts = () => {
    if (onOpenShortcuts) {
      onOpenShortcuts();
    } else {
      setInternalShortcutsOpen(true);
    }
  };

  const handleResetAppearance = () => {
    setTheme('dark');
    setMode('expanded');
    setLanguage('en');
    setReducedMotion(false);
    setDensity('normal');
    setShowResetConfirm(false);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Deck */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('nav.settings')} & Internationalization
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Personalize language, adaptive color themes, sidebar behavior, and accessibility preferences. Preferences persist across sessions.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <Check className="w-4 h-4" />
            <span>Preferences Updated</span>
          </div>
        )}
      </div>

      {/* Multilingual Language Selection */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Languages className="w-4 h-4 text-cyan-500" />
            <span>Multilingual Intelligence & Localization (i18n)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select interface language. Medical abbreviations (HRV, BPM, SpO₂, ECG) remain standardized with localized explanations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {languages.map((l) => {
            const isSelected = language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code as SupportedLanguage)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white font-sans">
                    {l.nativeName}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-500" />}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {l.name} · <span className="font-mono text-[10px] text-slate-400">{l.code.toUpperCase()}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Locale: {l.locale} ({l.script})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Adaptive Theme Engine & Accessibility</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active theme: <strong className="capitalize text-cyan-600 dark:text-cyan-400">{theme}</strong> (Resolved: {resolvedTheme})
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'dark' as ThemeMode, label: 'Dark Palette', desc: 'Midnight navy for clinical monitoring', icon: Moon },
            { id: 'light' as ThemeMode, label: 'Light Palette', desc: 'High-contrast clinical daylight theme', icon: Sun },
            { id: 'system' as ThemeMode, label: 'System Default', desc: 'Syncs automatically with operating system', icon: Monitor },
            { id: 'high-contrast' as ThemeMode, label: 'High Contrast', desc: 'WCAG AAA maximum contrast mode', icon: Contrast },
          ].map((tItem) => {
            const Icon = tItem.icon;
            const isSelected = theme === tItem.id;
            return (
              <button
                key={tItem.id}
                onClick={() => setTheme(tItem.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-500' : 'text-slate-400'}`} />
                  {isSelected && <Check className="w-4 h-4 text-cyan-500" />}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">{tItem.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{tItem.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Preference */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Desktop Sidebar Default Mode</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose how the adaptive sidebar renders on desktop and laptop displays.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'expanded' as SidebarMode, label: 'Expanded (Full Width)', desc: 'Labels, groups, brand mark and patient context', icon: SidebarIcon },
            { id: 'collapsed' as SidebarMode, label: 'Collapsed (Icon-Only)', desc: 'Compact icons with accessible tooltips', icon: Sliders },
            { id: 'hidden' as SidebarMode, label: 'Hidden (Max Canvas)', desc: 'Hidden until reopened via top header menu', icon: EyeOff },
          ].map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-500' : 'text-slate-400'}`} />
                  {isSelected && <Check className="w-4 h-4 text-cyan-500" />}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">{m.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Automated Clinical Alert & Threshold Configuration */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Automated Clinical Alert Trigger & Threshold
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically pushes an interactive system toast when the Digital Twin's predicted 2-hour strain probability crosses your threshold.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setTestSent(true);
                alertThresholdManager.triggerTestAlert();
                setTimeout(() => setTestSent(false), 2000);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-sm transition-all"
            >
              {testSent ? <Check className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
              <span>{testSent ? 'Toast Dispatched' : 'Test Alert Toast'}</span>
            </button>
          </div>
        </div>

        {/* Threshold Slider and Settings */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Trigger Threshold:
            </span>
            <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
              {alertSettings.riskThresholdPercent}% Predicted Risk
            </span>
          </div>

          <input
            type="range"
            min="35"
            max="95"
            step="1"
            value={alertSettings.riskThresholdPercent}
            onChange={(e) => alertThresholdManager.setRiskThreshold(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Quick Presets:</span>
            <div className="flex items-center space-x-1 font-mono">
              {[50, 65, 75, 80, 85].map((val) => (
                <button
                  key={val}
                  onClick={() => alertThresholdManager.setRiskThreshold(val)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    alertSettings.riskThresholdPercent === val
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {val}% {val === 75 ? '(Default)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Automated System Toast</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Display on-screen banner with direct action button</span>
            </div>
            <input
              type="checkbox"
              checked={alertSettings.enabled}
              onChange={(e) => alertThresholdManager.setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Auditory Warning Chime</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Synthesize gentle clinical chime upon threshold breach</span>
            </div>
            <input
              type="checkbox"
              checked={alertSettings.soundEnabled}
              onChange={(e) => alertThresholdManager.setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
            />
          </label>
        </div>
      </div>

      {/* Motion & Density Controls */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Accessibility & Visual Density</h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Reduced Motion Mode</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Disables rhythmic pulse animations and transitions</span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Compact Visual Density</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Reduces component padding for dense dashboard monitors</span>
            </div>
            <input
              type="checkbox"
              checked={density === 'compact'}
              onChange={(e) => setDensity(e.target.checked ? 'compact' : 'normal')}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
            />
          </label>
        </div>
      </div>

      {/* Keyboard Shortcuts Reference & Modal Trigger */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Keyboard Navigation & Telemetry Shortcuts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full accessibility keyboard suite for quick command search, stream controls, and tab jumping.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenShortcuts}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            aria-label="Open full Keyboard Shortcuts modal"
          >
            <Keyboard className="w-4 h-4" />
            <span>Open Shortcut Guide</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-950/20 text-[10px] font-mono">?</kbd>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Command Palette</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Search patients & actions</span>
            </div>
            <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400 shadow-xs">
              Ctrl+K
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Shortcuts Modal</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Universal shortcuts guide</span>
            </div>
            <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400 shadow-xs">
              ?
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Stream Telemetry</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Play / pause live sensor stream</span>
            </div>
            <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400 shadow-xs">
              Space
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">State Snapshot</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Save twin state to timeline</span>
            </div>
            <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400 shadow-xs">
              Alt + S
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Tab Navigation</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Direct workspace switching</span>
            </div>
            <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400 shadow-xs">
              Alt + 1-9
            </kbd>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Dismiss View</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Close modal or dialog</span>
            </div>
            <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400 shadow-xs">
              Esc
            </kbd>
          </div>
        </div>
      </div>

      {/* Reset Appearance Confirmation */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-bold text-sm text-slate-900 dark:text-white block">Reset Workspace Appearance</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Restores default theme and expanded sidebar layout. Patient records and model weights are never deleted.
          </span>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
        >
          Reset Defaults
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Reset Appearance?</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will restore the default dark theme and expanded sidebar. Your patient observations and model outputs remain intact.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAppearance}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={internalShortcutsOpen}
        onClose={() => setInternalShortcutsOpen(false)}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
