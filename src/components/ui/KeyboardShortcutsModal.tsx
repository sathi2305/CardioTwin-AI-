import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Keyboard,
  X,
  Search,
  Compass,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  Accessibility,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { NavTab } from '../../types';

export interface ShortcutItem {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: 'General' | 'Navigation' | 'Stream & Telemetry' | 'Twin & Analytics' | 'Accessibility';
  action?: () => void;
  actionLabel?: string;
  isExecutable?: boolean;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onToggleStream?: () => void;
  onResetStream?: () => void;
  onCreateSnapshot?: () => void;
  onOpenCommandPalette?: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onToggleStream,
  onResetStream,
  onCreateSnapshot,
  onOpenCommandPalette,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [recentActionMessage, setRecentActionMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // List of all shortcuts
  const shortcuts: ShortcutItem[] = useMemo(() => [
    // General
    {
      id: 'cmd-palette',
      name: 'Command Palette',
      description: 'Search synthetic patients, quick navigation, actions, and theme controls',
      keys: ['Ctrl', 'K'],
      category: 'General',
      action: onOpenCommandPalette,
      actionLabel: 'Open Palette',
      isExecutable: !!onOpenCommandPalette,
    },
    {
      id: 'shortcuts-guide',
      name: 'Keyboard Shortcuts Guide',
      description: 'Open this accessible dialog listing all application shortcuts',
      keys: ['?'],
      category: 'General',
    },
    {
      id: 'close-dialog',
      name: 'Close Dialog / Drawer',
      description: 'Dismiss current modal, command palette, or mobile drawer',
      keys: ['Esc'],
      category: 'General',
    },
    {
      id: 'toggle-theme',
      name: 'Toggle Theme',
      description: 'Switch between light and dark clinical palettes',
      keys: ['Alt', 'T'],
      category: 'General',
    },
    {
      id: 'toggle-sidebar',
      name: 'Toggle Sidebar',
      description: 'Collapse or expand the adaptive sidebar navigation',
      keys: ['Alt', 'B'],
      category: 'General',
    },

    // Navigation
    {
      id: 'nav-overview',
      name: 'Overview Dashboard',
      description: 'Jump to personalized digital twin dashboard and physiological vitals',
      keys: ['Alt', '1'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('overview') : undefined,
      actionLabel: 'Go to Overview',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-patients',
      name: 'Patient Registry',
      description: 'Jump to synthetic patient cohort and longitudinal EHR records',
      keys: ['Alt', '2'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('patients') : undefined,
      actionLabel: 'Go to Patients',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-monitoring',
      name: 'Live Wearable Stream',
      description: 'Jump to biosensor observation charts and telemetry alerts',
      keys: ['Alt', '3'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('monitoring') : undefined,
      actionLabel: 'Go to Stream',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-risk',
      name: 'AI Risk Intelligence',
      description: 'Jump to calibrated risk prediction and SHAP feature attributions',
      keys: ['Alt', '4'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('risk-analysis') : undefined,
      actionLabel: 'Go to Risk Analysis',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-sim',
      name: 'What-If Twin Simulator',
      description: 'Jump to counterfactual physiological parameter intervention playground',
      keys: ['Alt', '5'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('simulator') : undefined,
      actionLabel: 'Go to Simulator',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-insights',
      name: 'Clinical AI Insights',
      description: 'Jump to rule-based autonomic and hemodynamic clinical findings',
      keys: ['Alt', '6'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('insights') : undefined,
      actionLabel: 'Go to Insights',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-models',
      name: 'Model Performance Lab',
      description: 'Jump to held-out test ROC-AUC curve and confusion matrix',
      keys: ['Alt', '7'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('model-lab') : undefined,
      actionLabel: 'Go to Model Lab',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-timeline',
      name: 'Twin Snapshot Timeline',
      description: 'Jump to versioned snapshots and longitudinal parameter diffs',
      keys: ['Alt', '8'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('timeline') : undefined,
      actionLabel: 'Go to Timeline',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-data',
      name: 'Data Quality & Provenance',
      description: 'Jump to biosensor completeness audit and synthetic seed integrity',
      keys: ['Alt', '9'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('data-quality') : undefined,
      actionLabel: 'Go to Data Quality',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-settings',
      name: 'Settings & Appearance',
      description: 'Jump to theme selection, accessibility controls, and shortcuts',
      keys: ['Alt', '0'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('settings') : undefined,
      actionLabel: 'Go to Settings',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-notif',
      name: 'Notification Feed',
      description: 'Jump to real-time alerts and stream audit events',
      keys: ['Alt', 'N'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('notifications') : undefined,
      actionLabel: 'Go to Notifications',
      isExecutable: !!onNavigateTab,
    },
    {
      id: 'nav-docs',
      name: 'Challenge Dossier & Docs',
      description: 'Jump to technical architecture, pipeline specs, and challenge docs',
      keys: ['Alt', 'D'],
      category: 'Navigation',
      action: onNavigateTab ? () => onNavigateTab('docs') : undefined,
      actionLabel: 'Go to Docs',
      isExecutable: !!onNavigateTab,
    },

    // Stream & Telemetry
    {
      id: 'stream-toggle',
      name: 'Play / Pause Telemetry Stream',
      description: 'Toggle real-time synthetic photoplethysmography and accelerometer stream',
      keys: ['Space'],
      category: 'Stream & Telemetry',
      action: onToggleStream,
      actionLabel: 'Toggle Stream',
      isExecutable: !!onToggleStream,
    },
    {
      id: 'stream-reset',
      name: 'Reset Stream Buffer',
      description: 'Flush rolling observation window back to clinical baseline values',
      keys: ['Alt', 'R'],
      category: 'Stream & Telemetry',
      action: onResetStream,
      actionLabel: 'Reset Buffer',
      isExecutable: !!onResetStream,
    },

    // Twin & Analytics
    {
      id: 'twin-snapshot',
      name: 'Capture Twin State Snapshot',
      description: 'Record an immutable timestamped state snapshot for audit timeline and comparison',
      keys: ['Alt', 'S'],
      category: 'Twin & Analytics',
      action: onCreateSnapshot,
      actionLabel: 'Capture Snapshot',
      isExecutable: !!onCreateSnapshot,
    },

    // Accessibility & Assistive Tech
    {
      id: 'a11y-focus-forward',
      name: 'Navigate Forward',
      description: 'Move keyboard focus forward to next interactive element',
      keys: ['Tab'],
      category: 'Accessibility',
    },
    {
      id: 'a11y-focus-back',
      name: 'Navigate Backward',
      description: 'Move keyboard focus backward to previous interactive element',
      keys: ['Shift', 'Tab'],
      category: 'Accessibility',
    },
    {
      id: 'a11y-activate',
      name: 'Activate Button / Link',
      description: 'Trigger selected interactive control or navigate link',
      keys: ['Enter'],
      category: 'Accessibility',
    },
    {
      id: 'a11y-list-nav',
      name: 'Cycle List Options',
      description: 'Traverse options in command palette and dropdown menus',
      keys: ['↑', '↓'],
      category: 'Accessibility',
    },
  ], [onNavigateTab, onToggleStream, onResetStream, onCreateSnapshot, onOpenCommandPalette]);

  // Categories
  const categories = ['All', 'General', 'Navigation', 'Stream & Telemetry', 'Twin & Analytics', 'Accessibility'];

  // Filtered list
  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = item.name.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const catMatch = item.category.toLowerCase().includes(q);
      const keyMatch = item.keys.some((k) => k.toLowerCase().includes(q));
      return nameMatch || descMatch || catMatch || keyMatch;
    });
  }, [shortcuts, selectedCategory, searchQuery]);

  // Focus trap and accessibility management
  useEffect(() => {
    if (isOpen) {
      // Record previous focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus search input after mount
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      // Handle keyboard trap and Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      // Prevent background body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
        // Restore focus to previous element
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  const handleExecuteAction = (item: ShortcutItem) => {
    if (item.action) {
      item.action();
      setRecentActionMessage(`Triggered: ${item.name}`);
      setTimeout(() => {
        setRecentActionMessage(null);
        onClose();
      }, 600);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Accessible Dialog Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        aria-describedby="shortcuts-modal-desc"
        className="relative w-full max-w-3xl bg-white dark:bg-[#0c1324] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Keyboard className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2
                  id="shortcuts-modal-title"
                  className="text-base font-bold text-slate-900 dark:text-white tracking-tight"
                >
                  Keyboard Shortcuts & Quick Actions
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {shortcuts.length} Shortcuts
                </span>
              </div>
              <p
                id="shortcuts-modal-desc"
                className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
              >
                Global hotkeys designed for fast, accessible clinical navigation and telemetry control.
              </p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog (Escape)"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Action feedback banner if triggered */}
        {recentActionMessage && (
          <div
            role="status"
            aria-live="polite"
            className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2 flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{recentActionMessage}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#0c1324]">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts by name, key (e.g. Alt, Space, K), or description..."
              aria-label="Filter keyboard shortcuts"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div
            role="tablist"
            aria-label="Shortcut categories"
            className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'All' ? shortcuts.length : shortcuts.filter(s => s.category === cat).length;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live search results counter for screen readers */}
          <div className="sr-only" aria-live="polite">
            Showing {filteredShortcuts.length} shortcuts for {selectedCategory} category
          </div>
        </div>

        {/* Shortcuts List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Keyboard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No shortcuts found for "{searchQuery}"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try searching for keys like "Ctrl", "Alt", "Space", or select "All".
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredShortcuts.map((item) => (
              <div
                key={item.id}
                className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 dark:hover:bg-slate-900/40 p-2.5 rounded-xl transition-colors"
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  {/* Key Combo Display */}
                  <div className="flex items-center space-x-1" aria-label={`Shortcut: ${item.keys.join(' + ')}`}>
                    {item.keys.map((k, idx) => (
                      <React.Fragment key={idx}>
                        <kbd
                          className="min-w-6 h-6 px-2 inline-flex items-center justify-center font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-xs"
                        >
                          {k}
                        </kbd>
                        {idx < item.keys.length - 1 && (
                          <span className="text-slate-400 text-xs font-semibold" aria-hidden="true">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Accessible Execute / Jump Button for users with motor limitations */}
                  {item.isExecutable && item.action && (
                    <button
                      onClick={() => handleExecuteAction(item)}
                      aria-label={`${item.actionLabel || 'Run'} for ${item.name}`}
                      title={item.actionLabel || 'Execute shortcut action'}
                      className="ml-2 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/10 hover:bg-cyan-500 text-cyan-600 dark:text-cyan-400 hover:text-slate-950 dark:hover:text-slate-950 border border-cyan-500/20 transition-all flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <span>{item.actionLabel || 'Run'}</span>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Accessibility Notice */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <Accessibility className="w-4 h-4 text-cyan-500 shrink-0" aria-hidden="true" />
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">Esc</kbd> to close or <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">?</kbd> anywhere to reopen.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
