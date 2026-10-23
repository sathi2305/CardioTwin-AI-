import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  UserCheck, 
  Clock, 
  ChevronDown, 
  Menu, 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  Maximize, 
  Minimize, 
  Search, 
  Camera, 
  Sidebar as SidebarIcon,
  Keyboard,
  Languages,
  Contrast
} from 'lucide-react';
import { PatientEHR, NavTab } from '../../types';
import { useSidebar } from '../../context/SidebarContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { notificationStore } from '../../utils/notificationStore';
import { SupportedLanguage } from '../../i18n/types';

interface HeaderProps {
  currentTab: NavTab;
  patients: PatientEHR[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  onResetStream: () => void;
  lastUpdateTime: string;
  dataQualityScore: number;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  onCreateSnapshot: () => void;
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  patients,
  selectedPatientId,
  onSelectPatient,
  isStreaming,
  onToggleStream,
  onResetStream,
  lastUpdateTime,
  dataQualityScore,
  onOpenCommandPalette,
  onOpenNotifications,
  onCreateSnapshot,
  onOpenShortcuts,
}) => {
  const { mode, toggleHidden, openMobile } = useSidebar();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const unreadCount = notificationStore.getUnreadCount();

  const selectedPatient = patients.find((p) => p.patientId === selectedPatientId) || patients[0];

  const pageTitles: Record<NavTab, { titleKey: string; defaultTitle: string; subtitle: string }> = {
    overview: { titleKey: 'nav.overview', defaultTitle: 'Executive Health Overview', subtitle: 'Personalized Digital Twin Dashboard & Real-Time Physiological Vitals' },
    patients: { titleKey: 'nav.patients', defaultTitle: 'Patient Digital Twin Registry', subtitle: 'Synthetic Patient Cohorts, Longitudinal EHR & Historical Profiles' },
    monitoring: { titleKey: 'nav.monitoring', defaultTitle: 'Live Wearable Stream', subtitle: 'Simulated Biosensor Observations, Autonomic Telemetry & Anomaly Alerts' },
    'risk-analysis': { titleKey: 'nav.riskAnalysis', defaultTitle: 'AI Risk Intelligence & Explainability', subtitle: 'Predictive Pattern Risk, SHAP-Style Attributions & Odds Ratios' },
    simulator: { titleKey: 'nav.simulator', defaultTitle: 'What-If Digital Twin Simulator', subtitle: 'Counterfactual Physiological Simulation & Interventional Modeling' },
    insights: { titleKey: 'nav.insights', defaultTitle: 'Clinical AI Insights Engine', subtitle: 'Automated Rule-Based Autonomic and Hemodynamic Findings' },
    'model-lab': { titleKey: 'nav.modelLab', defaultTitle: 'Model Performance & Validation Suite', subtitle: 'Held-Out Test Metrics, GroupKFold Leakage Proof, ROC-AUC & Confusion Matrix' },
    timeline: { titleKey: 'nav.timeline', defaultTitle: 'Digital Twin Snapshot Timeline', subtitle: 'Audit Trail of Versioned Twin States & Longitudinal Parameter Diffing' },
    'data-quality': { titleKey: 'nav.dataQuality', defaultTitle: 'Data Quality & Provenance Center', subtitle: 'Biosensor Completeness Audit, Synthetic Seed Integrity & Error Analysis' },
    reports: { titleKey: 'nav.reports', defaultTitle: 'Clinical Reports & Data Export', subtitle: 'Digital Twin Summaries, Raw Sensor Time-Series CSV & Submission Dossiers' },
    notifications: { titleKey: 'nav.notifications', defaultTitle: 'Application Notifications Center', subtitle: 'Real-Time Alert Feed, Stream State Changes & Twin Synchronization Events' },
    settings: { titleKey: 'nav.settings', defaultTitle: 'Workspace Settings & Appearance', subtitle: 'Theme Modes, Navigation Preferences, Motion, and Dashboard Customization' },
    docs: { titleKey: 'nav.docs', defaultTitle: 'Challenge Dossier & Architecture', subtitle: 'Happiest Health Digital Twin Challenge 2026 Submission Specifications' },
  };

  const currentInfo = pageTitles[currentTab] || { titleKey: 'brand.title', defaultTitle: 'CardioTwin AI', subtitle: 'Cardiovascular Digital Twin' };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="h-18 bg-white/95 dark:bg-[#0a0f1e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Reopen Sidebar / Mobile Menu + Page Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={openMobile}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop reopen sidebar trigger if hidden */}
        {mode === 'hidden' && (
          <button
            onClick={toggleHidden}
            className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700"
            title="Restore Sidebar"
          >
            <SidebarIcon className="w-4 h-4 text-cyan-500" />
            <span>Show Menu</span>
          </button>
        )}

        <div>
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>CardioTwin</span>
            <span>/</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold capitalize">{t(currentInfo.titleKey, currentTab.replace('-', ' '))}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <span>{t(currentInfo.titleKey, currentInfo.defaultTitle)}</span>
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5">
        {/* Multilingual Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs">
          <Languages className="w-3.5 h-3.5 text-cyan-500 mr-1.5 shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
            aria-label="Language selector"
            title="Select Language / மொழியைத் தேர்ந்தெடுக்கவும்"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs transition-colors"
          title="Open Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden md:inline">{t('header.commandPalette')}</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Stream Play/Pause Control */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 space-x-0.5">
          <button
            onClick={onToggleStream}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              isStreaming
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
            title={isStreaming ? t('header.streamPause') : t('header.streamStart')}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">{t('header.streamPause')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">{t('header.streamStart')}</span>
              </>
            )}
          </button>

          <button
            onClick={onResetStream}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded transition-colors"
            title={t('header.resetBuffer')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Patient Switcher */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <select
            value={selectedPatientId}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer pr-2 text-xs"
          >
            {patients.map((p) => (
              <option key={p.patientId} value={p.patientId} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                {p.patientId} — {p.fullName} ({p.baselineRiskCategory})
              </option>
            ))}
          </select>
        </div>

        {/* Snapshot Quick Action */}
        <button
          onClick={onCreateSnapshot}
          className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          title={t('header.takeSnapshot')}
        >
          <Camera className="w-3.5 h-3.5 text-purple-500" />
          <span>{t('header.takeSnapshot')}</span>
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={t('header.notifications')}
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Keyboard Shortcuts Trigger */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('header.shortcuts')}
            aria-label="Keyboard shortcuts (Press ?)"
          >
            <Keyboard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </button>
        )}

        {/* Theme Toggle Button with High-Contrast Support */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
          aria-label="Toggle color theme"
        >
          {resolvedTheme === 'high-contrast' ? (
            <Contrast className="w-4 h-4 text-sky-400 animate-spin-slow" />
          ) : resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="hidden xl:block p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
