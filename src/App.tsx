import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/ui/CommandPalette';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { PatientsPage } from './pages/PatientsPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { InsightsPage } from './pages/InsightsPage';
import { ModelLabPage } from './pages/ModelLabPage';
import { TimelinePage } from './pages/TimelinePage';
import { DataQualityPage } from './pages/DataQualityPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocsPage } from './pages/DocsPage';

// Types & Services
import { PatientEHR, DigitalTwinState, WearableObservation, NavTab } from './types';
import { api } from './services/api';
import { wearableStream } from './services/stream';
import { buildDigitalTwinState } from './utils/digitalTwinEngine';
import { SYNTHETIC_PATIENTS } from './data/syntheticData';
import { snapshotStore } from './utils/snapshotStore';
import { notificationStore } from './utils/notificationStore';
import { alertThresholdManager } from './utils/alertThresholdManager';
import { SystemToast, ToastData } from './components/ui/SystemToast';
import { CheckCircle2 } from 'lucide-react';

const VALID_TABS: NavTab[] = [
  'overview',
  'patients',
  'monitoring',
  'risk-analysis',
  'simulator',
  'insights',
  'model-lab',
  'timeline',
  'data-quality',
  'reports',
  'notifications',
  'settings',
  'docs',
];

function getTabFromHash(): NavTab {
  try {
    const hash = window.location.hash.replace('#', '');
    if (VALID_TABS.includes(hash as NavTab)) {
      return hash as NavTab;
    }
  } catch (_) {}
  return 'overview';
}

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>(() => getTabFromHash());
  const [patients, setPatients] = useState<PatientEHR[]>(SYNTHETIC_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('CT-1001');
  const [twinState, setTwinState] = useState<DigitalTwinState | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(new Date().toISOString());
  const [loading, setLoading] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);

  // Sync hash with browser history back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setCurrentTab(tab);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
  };



  // Load patients and initial twin state
  const loadPatientData = useCallback(async (patientId: string) => {
    try {
      const state = await api.getPatientTwin(patientId);
      setTwinState(state);
      setLastUpdateTime(new Date().toISOString());
      // Check threshold trigger on patient load
      alertThresholdManager.evaluateTwinState(state);
    } catch (err) {
      console.error('Failed to load patient twin:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getPatients().then((pList) => {
      if (pList && pList.length > 0) {
        setPatients(pList);
      }
    });
    loadPatientData(selectedPatientId);
  }, [loadPatientData, selectedPatientId]);

  // Subscribe to automated alert events triggered by monitoring logic
  useEffect(() => {
    const unsubscribeAlerts = alertThresholdManager.onAlert((event) => {
      // Record into clinical notification history
      notificationStore.add({
        title: event.title,
        message: event.message,
        severity: 'alert',
        patientId: event.patientId,
        category: 'Risk',
      });

      // Push interactive system toast
      setActiveToast({
        id: event.id,
        type: 'alert',
        title: event.title,
        message: event.message,
        badge: `P(Risk) = ${event.riskProbabilityPercent.toFixed(1)}% ≥ ${event.thresholdPercent}%`,
        actionLabel: 'Inspect Risk Analysis',
        onAction: () => handleNavigateTab('risk-analysis'),
        durationMs: 8000,
      });
    });

    return () => {
      unsubscribeAlerts();
    };
  }, []);

  // Handle incoming live wearable stream packets
  useEffect(() => {
    const unsubscribe = wearableStream.subscribe((packet: WearableObservation) => {
      if (!packet || typeof packet.heartRate !== 'number' || typeof packet.hrvRmssd !== 'number') {
        return;
      }

      setTwinState((prevState) => {
        if (!prevState || prevState.patientId !== packet.patientId) return prevState;

        const updatedObservations = [...prevState.recentObservations, packet];
        if (updatedObservations.length > 40) updatedObservations.shift();

        const updatedState = buildDigitalTwinState(prevState.ehr, updatedObservations);
        
        // Automated notification trigger: check if predicted risk probability exceeds user-defined threshold
        alertThresholdManager.evaluateTwinState(updatedState);

        return updatedState;
      });
      setLastUpdateTime(packet.timestamp || new Date().toISOString());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    loadPatientData(patientId);
    if (isStreaming) {
      wearableStream.start(patientId);
    }
  };

  const handleToggleStream = () => {
    if (isStreaming) {
      wearableStream.pause();
      setIsStreaming(false);
      notificationStore.add({
        title: 'Wearable Stream Paused',
        message: `Telemetry stream suspended for ${selectedPatientId}.`,
        severity: 'info',
        patientId: selectedPatientId,
        category: 'Stream',
      });
    } else {
      wearableStream.start(selectedPatientId);
      setIsStreaming(true);
      notificationStore.add({
        title: 'Wearable Stream Initiated',
        message: `Real-time simulated photoplethysmography and accelerometer stream active for ${selectedPatientId}.`,
        severity: 'info',
        patientId: selectedPatientId,
        category: 'Stream',
      });
    }
  };

  const handleResetStream = () => {
    wearableStream.reset(selectedPatientId);
    setIsStreaming(false);
    loadPatientData(selectedPatientId);
    notificationStore.add({
      title: 'Stream Buffer Reset',
      message: `Dynamic time-series observation buffer reset to clinical baseline.`,
      severity: 'info',
      patientId: selectedPatientId,
      category: 'Stream',
    });
  };

  const handleCreateSnapshot = () => {
    if (!twinState) return;
    const snap = snapshotStore.createSnapshot(twinState);
    notificationStore.add({
      title: `Snapshot #${snap.snapshotNumber} Saved`,
      message: `Captured twin state at ${new Date(snap.timestamp).toLocaleTimeString()} with ${snap.riskLevel} risk (${(snap.riskProbability * 100).toFixed(1)}%).`,
      severity: 'success',
      patientId: twinState.patientId,
      category: 'Twin',
    });
    setActiveToast({
      id: `snap-${Date.now()}`,
      type: 'success',
      title: `Snapshot #${snap.snapshotNumber} Recorded`,
      message: `Digital twin state archived with ${(snap.riskProbability * 100).toFixed(1)}% risk to audit timeline.`,
      actionLabel: 'View in Timeline',
      onAction: () => handleNavigateTab('timeline'),
      durationMs: 4000,
    });
  };

  // Global comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      // Command Palette: Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Snapshot: Ctrl+S or Cmd+S or Alt+S
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') || (e.altKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        handleCreateSnapshot();
        return;
      }

      // Keyboard Shortcuts Dialog: '?' (when not typing in an input)
      if (e.key === '?' && !isInputActive) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Alt key navigation shortcuts
      if (e.altKey && !e.metaKey && !e.ctrlKey) {
        if (e.key === '1') { e.preventDefault(); handleNavigateTab('overview'); }
        else if (e.key === '2') { e.preventDefault(); handleNavigateTab('patients'); }
        else if (e.key === '3') { e.preventDefault(); handleNavigateTab('monitoring'); }
        else if (e.key === '4') { e.preventDefault(); handleNavigateTab('risk-analysis'); }
        else if (e.key === '5') { e.preventDefault(); handleNavigateTab('simulator'); }
        else if (e.key === '6') { e.preventDefault(); handleNavigateTab('insights'); }
        else if (e.key === '7') { e.preventDefault(); handleNavigateTab('model-lab'); }
        else if (e.key === '8') { e.preventDefault(); handleNavigateTab('timeline'); }
        else if (e.key === '9') { e.preventDefault(); handleNavigateTab('data-quality'); }
        else if (e.key === '0') { e.preventDefault(); handleNavigateTab('settings'); }
        else if (e.key.toLowerCase() === 'n') { e.preventDefault(); handleNavigateTab('notifications'); }
        else if (e.key.toLowerCase() === 'd') { e.preventDefault(); handleNavigateTab('docs'); }
        else if (e.key.toLowerCase() === 'p') { e.preventDefault(); handleToggleStream(); }
        else if (e.key.toLowerCase() === 'r') { e.preventDefault(); handleResetStream(); }
        return;
      }

      // Space key to toggle stream (when not typing in input, not focused on button, and no modal open)
      if (e.key === ' ' && !isInputActive && activeEl?.tagName !== 'BUTTON' && !isCommandPaletteOpen && !isShortcutsModalOpen) {
        e.preventDefault();
        handleToggleStream();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateSnapshot, handleNavigateTab, handleToggleStream, handleResetStream, isCommandPaletteOpen, isShortcutsModalOpen]);

  const selectedPatient = patients.find((p) => p.patientId === selectedPatientId) || patients[0];

  if (loading || !twinState) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b16] flex items-center justify-center text-slate-700 dark:text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-200">
            Initializing CardioTwin AI Multi-Modal Engine...
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading synthetic EHR & wearable stream models</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b16] text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-cyan-500 selection:text-black transition-colors duration-200">
      {/* Automated System Toast Notification */}
      <SystemToast toast={activeToast} onClose={() => setActiveToast(null)} />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={handleNavigateTab}
        patients={patients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={handleSelectPatient}
        isStreaming={isStreaming}
        onToggleStream={handleToggleStream}
        onResetStream={handleResetStream}
        onCreateSnapshot={handleCreateSnapshot}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Accessible Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onNavigateTab={handleNavigateTab}
        onToggleStream={handleToggleStream}
        onResetStream={handleResetStream}
        onCreateSnapshot={handleCreateSnapshot}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigateTab}
        isStreaming={isStreaming}
        selectedPatient={selectedPatient}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Adaptive Header */}
        <Header
          currentTab={currentTab}
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={handleSelectPatient}
          isStreaming={isStreaming}
          onToggleStream={handleToggleStream}
          onResetStream={handleResetStream}
          lastUpdateTime={lastUpdateTime}
          dataQualityScore={twinState.dataQualityScore}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNotifications={() => handleNavigateTab('notifications')}
          onCreateSnapshot={handleCreateSnapshot}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto pb-12">
          {currentTab === 'overview' && (
            <OverviewPage
              twinState={twinState}
              isStreaming={isStreaming}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsPage
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={handleSelectPatient}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'monitoring' && (
            <MonitoringPage
              twinState={twinState}
              isStreaming={isStreaming}
              onToggleStream={handleToggleStream}
              onResetStream={handleResetStream}
            />
          )}

          {currentTab === 'risk-analysis' && (
            <RiskAnalysisPage twinState={twinState} />
          )}

          {currentTab === 'simulator' && (
            <SimulatorPage twinState={twinState} />
          )}

          {currentTab === 'insights' && (
            <InsightsPage twinState={twinState} />
          )}

          {currentTab === 'model-lab' && (
            <ModelLabPage />
          )}

          {currentTab === 'timeline' && (
            <TimelinePage
              twinState={twinState}
              onCreateSnapshot={handleCreateSnapshot}
            />
          )}

          {currentTab === 'data-quality' && (
            <DataQualityPage twinState={twinState} />
          )}

          {currentTab === 'reports' && (
            <ReportsPage twinState={twinState} />
          )}

          {currentTab === 'notifications' && (
            <NotificationsPage
              onNavigateTab={handleNavigateTab}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'docs' && (
            <DocsPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
