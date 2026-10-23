import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Activity, 
  Users, 
  Radio, 
  BrainCircuit, 
  SlidersHorizontal, 
  Sparkles, 
  LineChart, 
  Camera, 
  Database, 
  FileSpreadsheet, 
  Bell, 
  Settings, 
  FileCode2, 
  Moon, 
  Sun, 
  Play, 
  Pause, 
  RotateCcw, 
  X,
  ArrowRight,
  Keyboard
} from 'lucide-react';
import { NavTab, PatientEHR } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  patients: PatientEHR[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  onResetStream: () => void;
  onCreateSnapshot: () => void;
  onOpenShortcuts?: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Patients' | 'Streaming' | 'Actions';
  icon: React.ElementType;
  shortcut?: string;
  perform: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  patients,
  selectedPatientId,
  onSelectPatient,
  isStreaming,
  onToggleStream,
  onResetStream,
  onCreateSnapshot,
  onOpenShortcuts,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { toggleCollapsed } = useSidebar();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build commands
  const allCommands: CommandItem[] = [
    // Navigation
    { id: 'nav-overview', label: 'Go to Executive Health Overview', category: 'Navigation', icon: Activity, perform: () => onNavigateTab('overview') },
    { id: 'nav-patients', label: 'Go to Patient Registry & Cohort', category: 'Navigation', icon: Users, perform: () => onNavigateTab('patients') },
    { id: 'nav-monitoring', label: 'Go to Live Wearable Telemetry', category: 'Navigation', icon: Radio, perform: () => onNavigateTab('monitoring') },
    { id: 'nav-risk', label: 'Go to AI Risk Intelligence & SHAP', category: 'Navigation', icon: BrainCircuit, perform: () => onNavigateTab('risk-analysis') },
    { id: 'nav-sim', label: 'Go to What-If Digital Twin Simulator', category: 'Navigation', icon: SlidersHorizontal, perform: () => onNavigateTab('simulator') },
    { id: 'nav-insights', label: 'Go to Clinical AI Insights', category: 'Navigation', icon: Sparkles, perform: () => onNavigateTab('insights') },
    { id: 'nav-model', label: 'Go to Model Performance & ROC-AUC', category: 'Navigation', icon: LineChart, perform: () => onNavigateTab('model-lab') },
    { id: 'nav-timeline', label: 'Go to Digital Twin Snapshot Timeline', category: 'Navigation', icon: Camera, perform: () => onNavigateTab('timeline') },
    { id: 'nav-data', label: 'Go to Data Quality & Provenance', category: 'Navigation', icon: Database, perform: () => onNavigateTab('data-quality') },
    { id: 'nav-reports', label: 'Go to Reports & CSV Export', category: 'Navigation', icon: FileSpreadsheet, perform: () => onNavigateTab('reports') },
    { id: 'nav-notif', label: 'Go to Notification Center', category: 'Navigation', icon: Bell, perform: () => onNavigateTab('notifications') },
    { id: 'nav-settings', label: 'Go to Appearance & Workspace Settings', category: 'Navigation', icon: Settings, perform: () => onNavigateTab('settings') },
    { id: 'nav-docs', label: 'Go to Challenge Dossier & Docs', category: 'Navigation', icon: FileCode2, perform: () => onNavigateTab('docs') },

    // Streaming
    { 
      id: 'act-stream', 
      label: isStreaming ? 'Pause Wearable Telemetry Stream' : 'Start Simulated Wearable Stream', 
      category: 'Streaming', 
      icon: isStreaming ? Pause : Play, 
      perform: onToggleStream 
    },
    { 
      id: 'act-stream-reset', 
      label: 'Reset Wearable Telemetry Buffer', 
      category: 'Streaming', 
      icon: RotateCcw, 
      perform: onResetStream 
    },

    // Actions
    { 
      id: 'act-snapshot', 
      label: 'Capture Digital Twin State Snapshot', 
      category: 'Actions', 
      icon: Camera, 
      shortcut: '⌘S',
      perform: onCreateSnapshot 
    },
    { 
      id: 'act-theme', 
      label: `Switch Theme (Currently ${theme.toUpperCase()})`, 
      category: 'Actions', 
      icon: theme === 'dark' ? Sun : Moon, 
      perform: toggleTheme 
    },
    { 
      id: 'act-sidebar', 
      label: 'Toggle Sidebar Collapse/Expand', 
      category: 'Actions', 
      icon: SlidersHorizontal, 
      shortcut: 'Alt+B',
      perform: toggleCollapsed 
    },
    ...(onOpenShortcuts ? [{
      id: 'act-shortcuts',
      label: 'Open Keyboard Shortcuts Guide & Accessibility Controls',
      category: 'Actions' as const,
      icon: Keyboard,
      shortcut: '?',
      perform: onOpenShortcuts
    }] : []),

    // Languages (Multilingual Intelligence)
    { id: 'lang-en', label: 'Switch Language to English (English)', category: 'Actions', icon: ArrowRight, perform: () => onNavigateTab('settings') },
    { id: 'lang-ta', label: 'தமிழுக்கு மாறவும் (Switch to Tamil)', category: 'Actions', icon: ArrowRight, perform: () => onNavigateTab('settings') },
    { id: 'lang-hi', label: 'हिन्दी में बदलें (Switch to Hindi)', category: 'Actions', icon: ArrowRight, perform: () => onNavigateTab('settings') },
    { id: 'lang-ml', label: 'മലയാളത്തിലേക്ക് മാറ്റുക (Switch to Malayalam)', category: 'Actions', icon: ArrowRight, perform: () => onNavigateTab('settings') },
    { id: 'lang-te', label: 'తెలుగులోకి మార్చండి (Switch to Telugu)', category: 'Actions', icon: ArrowRight, perform: () => onNavigateTab('settings') },
    { id: 'lang-kn', label: 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ (Switch to Kannada)', category: 'Actions', icon: ArrowRight, perform: () => onNavigateTab('settings') },

    // Patient Switches
    ...patients.map((p) => ({
      id: `patient-${p.patientId}`,
      label: `Switch Patient: ${p.patientId} — ${p.fullName} (${p.baselineRiskCategory} Risk)`,
      category: 'Patients' as const,
      icon: Users,
      perform: () => {
        onSelectPatient(p.patientId);
        onNavigateTab('overview');
      },
    })),
  ];

  const filtered = allCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].perform();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="relative w-full max-w-xl bg-white dark:bg-[#0c1324] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <Search className="w-5 h-5 text-cyan-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g., 'Overview', 'Patient', 'Stream')..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1"
        >
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              No matching commands or patients found for "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.perform();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`p-1.5 rounded-lg ${
                      isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{cmd.label}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={`w-3 h-3 ${isSelected ? 'opacity-100 text-cyan-500' : 'opacity-0'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>CardioTwin AI Commands</span>
        </div>
      </div>
    </div>
  );
};
