import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  Activity, 
  SlidersHorizontal, 
  BrainCircuit, 
  Radio, 
  Sun, 
  Moon, 
  Monitor, 
  FileSpreadsheet, 
  Camera, 
  Settings, 
  FileCode2, 
  Sparkles, 
  Check, 
  X,
  Play,
  Pause,
  Database
} from 'lucide-react';
import { NavTab, PatientEHR } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  patients: PatientEHR[];
  onSelectPatient: (patientId: string) => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  onCreateSnapshot: () => void;
}

interface CommandItem {
  id: string;
  category: 'Pages' | 'Patients' | 'Controls' | 'Theme';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  patients,
  onSelectPatient,
  isStreaming,
  onToggleStream,
  onCreateSnapshot,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command list
  const allCommands: CommandItem[] = [
    // Pages
    {
      id: 'page-overview',
      category: 'Pages',
      title: 'Executive Overview Dashboard',
      subtitle: 'Real-time vitals, twin resilience score, rolling HR/HRV',
      icon: Activity,
      action: () => { onNavigateTab('overview'); onClose(); },
    },
    {
      id: 'page-patients',
      category: 'Pages',
      title: 'Patient Digital Twin Registry',
      subtitle: 'Browse 20 synthetic cohorts & longitudinal EHR history',
      icon: User,
      action: () => { onNavigateTab('patients'); onClose(); },
    },
    {
      id: 'page-monitoring',
      category: 'Pages',
      title: 'Live Wearable Biosensor Stream',
      subtitle: 'Real-time telemetry, ECG rhythm wave, packet inspector',
      icon: Radio,
      action: () => { onNavigateTab('monitoring'); onClose(); },
    },
    {
      id: 'page-risk',
      category: 'Pages',
      title: 'AI Predictive Risk Intelligence',
      subtitle: 'SHAP-style local feature attributions & calibrated odds ratios',
      icon: BrainCircuit,
      action: () => { onNavigateTab('risk-analysis'); onClose(); },
    },
    {
      id: 'page-simulator',
      category: 'Pages',
      title: 'What-If Digital Twin Simulator',
      subtitle: 'Counterfactual parameter exploration & interventional modeling',
      icon: SlidersHorizontal,
      action: () => { onNavigateTab('simulator'); onClose(); },
    },
    {
      id: 'page-insights',
      category: 'Pages',
      title: 'AI Insights & Clinical Rules',
      subtitle: 'Automated evidence-grounded autonomic & hemodynamic findings',
      icon: Sparkles,
      action: () => { onNavigateTab('insights'); onClose(); },
    },
    {
      id: 'page-timeline',
      category: 'Pages',
      title: 'Event Timeline & Snapshot History',
      subtitle: 'Inspect versioned twin states and compare historical snapshots',
      icon: Camera,
      action: () => { onNavigateTab('timeline'); onClose(); },
    },
    {
      id: 'page-quality',
      category: 'Pages',
      title: 'Data Quality & Provenance Center',
      subtitle: 'Sensor completeness audit, timestamp jitter, seed provenance',
      icon: Database,
      action: () => { onNavigateTab('data-quality'); onClose(); },
    },
    {
      id: 'page-model',
      category: 'Pages',
      title: 'Model Performance Lab (Jury Suite)',
      subtitle: 'Held-out test ROC curve, confusion matrix, GroupKFold proof',
      icon: Sparkles,
      action: () => { onNavigateTab('model-lab'); onClose(); },
    },
    {
      id: 'page-reports',
      category: 'Pages',
      title: 'Clinical Reports & CSV Export Center',
      subtitle: 'Printable summaries, raw time-series CSV, JSON dossier',
      icon: FileSpreadsheet,
      action: () => { onNavigateTab('reports'); onClose(); },
    },
    {
      id: 'page-settings',
      category: 'Pages',
      title: 'System Settings & Appearance',
      subtitle: 'Configure theme, sidebar modes, density, and animation',
      icon: Settings,
      action: () => { onNavigateTab('settings'); onClose(); },
    },
    {
      id: 'page-docs',
      category: 'Pages',
      title: 'Challenge Dossier & Architecture',
      subtitle: '12-slide deck, 20-min video demo script, Windows setup',
      icon: FileCode2,
      action: () => { onNavigateTab('docs'); onClose(); },
    },

    // Controls
    {
      id: 'ctl-stream',
      category: 'Controls',
      title: isStreaming ? 'Pause Simulated Wearable Stream' : 'Start Simulated Wearable Stream',
      subtitle: 'Toggle high-frequency biosensor telemetry',
      icon: isStreaming ? Pause : Play,
      action: () => { onToggleStream(); onClose(); },
    },
    {
      id: 'ctl-snapshot',
      category: 'Controls',
      title: 'Create Digital Twin Snapshot Now',
      subtitle: 'Capture current physiological parameters and risk prediction',
      icon: Camera,
      action: () => { onCreateSnapshot(); onClose(); },
    },

    // Themes
    {
      id: 'theme-dark',
      category: 'Theme',
      title: 'Switch to Dark Theme',
      subtitle: 'Deep midnight navy palette for clinical monitoring',
      icon: Moon,
      action: () => { setTheme('dark'); onClose(); },
    },
    {
      id: 'theme-light',
      category: 'Theme',
      title: 'Switch to Light Theme',
      subtitle: 'High-contrast clinical light mode',
      icon: Sun,
      action: () => { setTheme('light'); onClose(); },
    },
    {
      id: 'theme-system',
      category: 'Theme',
      title: 'Use System Default Theme',
      subtitle: 'Synchronize automatically with operating system preference',
      icon: Monitor,
      action: () => { setTheme('system'); onClose(); },
    },

    // Patients
    ...patients.map((p) => ({
      id: `pat-${p.patientId}`,
      category: 'Patients' as const,
      title: `Twin: ${p.fullName} (${p.patientId})`,
      subtitle: `${p.age}y ${p.gender} • BP ${p.systolicBP}/${p.diastolicBP} • ${p.baselineRiskCategory} Risk Tier`,
      icon: User,
      action: () => { onSelectPatient(p.patientId); onClose(); },
    })),
  ];

  const filteredCommands = allCommands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, page, patient name, or action (e.g. 'Eleanor', 'Dark', 'Stream')..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400 text-slate-900 dark:text-white"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching commands or patients found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {cmd.title}
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold shrink-0 ml-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-[#0a0f1e] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>CardioTwin AI Palette</span>
        </div>
      </div>
    </div>
  );
};
