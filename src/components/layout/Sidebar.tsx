import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  Radio, 
  BrainCircuit, 
  SlidersHorizontal, 
  LineChart, 
  FileSpreadsheet, 
  FileCode2, 
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Database,
  Camera,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  EyeOff
} from 'lucide-react';
import { NavTab, PatientEHR } from '../../types';
import { useSidebar } from '../../context/SidebarContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { notificationStore } from '../../utils/notificationStore';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isStreaming: boolean;
  selectedPatient?: PatientEHR;
}

interface NavGroup {
  name: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isStreaming,
  selectedPatient,
}) => {
  const { mode, toggleCollapsed, toggleHidden, isMobileOpen, closeMobile } = useSidebar();
  const { t } = useLanguage();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const unreadNotifications = notificationStore.getUnreadCount();

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const navGroups: NavGroup[] = [
    {
      name: t('nav.workspace'),
      items: [
        { id: 'overview', label: t('nav.overview'), icon: Activity },
        { id: 'patients', label: t('nav.patients'), icon: Users, badge: '20' },
        { id: 'monitoring', label: t('nav.monitoring'), icon: Radio, badge: isStreaming ? 'LIVE' : undefined },
        { id: 'risk-analysis', label: t('nav.riskAnalysis'), icon: BrainCircuit },
        { id: 'simulator', label: t('nav.simulator'), icon: SlidersHorizontal },
      ],
    },
    {
      name: t('nav.intelligence'),
      items: [
        { id: 'insights', label: t('nav.insights'), icon: Sparkles },
        { id: 'model-lab', label: t('nav.modelLab'), icon: LineChart },
        { id: 'timeline', label: t('nav.timeline'), icon: Camera },
      ],
    },
    {
      name: t('nav.dataManagement'),
      items: [
        { id: 'data-quality', label: t('nav.dataQuality'), icon: Database },
      ],
    },
    {
      name: t('nav.reporting'),
      items: [
        { id: 'reports', label: t('nav.reports'), icon: FileSpreadsheet },
      ],
    },
    {
      name: t('nav.system'),
      items: [
        { id: 'notifications', label: t('nav.notifications'), icon: Bell, badge: unreadNotifications > 0 ? `${unreadNotifications}` : undefined },
        { id: 'settings', label: t('nav.settings'), icon: Settings },
        { id: 'docs', label: t('nav.docs'), icon: FileCode2 },
      ],
    },
  ];

  const isCollapsed = mode === 'collapsed';
  const isHidden = mode === 'hidden';

  const handleItemClick = (id: NavTab) => {
    onSelectTab(id);
    closeMobile();
  };

  // Content of the sidebar
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c1222] border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-all duration-200 select-none">
      {/* Brand & Collapse Header */}
      <div className={`p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center space-x-3 truncate">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">{t('brand.title')}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 rounded">{t('brand.badge')}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-tight">{t('brand.subtitle')}</p>
            </div>
          )}
        </div>

        {/* Collapse button on desktop */}
        {!isCollapsed && (
          <div className="hidden lg:flex items-center space-x-1">
            <button
              onClick={toggleCollapsed}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Collapse Sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={toggleHidden}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Hide Sidebar"
              aria-label="Hide sidebar"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        )}

        {isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="hidden lg:block p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Expand Sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Close mobile menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Patient Pill in Expanded Sidebar */}
      {!isCollapsed && selectedPatient && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1">
            <span>ACTIVE SUBJECT</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedPatient.patientId}</span>
          </div>
          <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
            {selectedPatient.fullName}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-0.5">
            <span>{selectedPatient.age}y {selectedPatient.gender}</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{selectedPatient.baselineRiskCategory} Risk</span>
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto" role="navigation" aria-label="Main sidebar">
        {navGroups.map((group) => {
          const isGroupCollapsed = collapsedGroups[group.name];
          return (
            <div key={group.name} className="space-y-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase hover:text-slate-600 dark:hover:text-slate-300"
                  aria-expanded={!isGroupCollapsed}
                >
                  <span>{group.name}</span>
                  {isGroupCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              {(!isGroupCollapsed || isCollapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <div key={item.id} className="relative group">
                        <button
                          onClick={() => handleItemClick(item.id)}
                          title={isCollapsed ? item.label : undefined}
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-full flex items-center ${
                            isCollapsed ? 'justify-center py-2.5' : 'justify-between px-2.5 py-2'
                          } rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                          }`}
                        >
                          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'}`}>
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                              }`}
                            />
                            {!isCollapsed && <span className="tracking-tight truncate">{item.label}</span>}
                          </div>

                          {!isCollapsed && item.badge && (
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                                item.badge === 'LIVE'
                                  ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>

                        {/* Tooltip on collapsed desktop sidebar */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 z-50 shadow-xl transition-opacity border border-slate-800">
                            {item.label}
                            {item.badge && <span className="ml-1.5 text-cyan-400">({item.badge})</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className={`p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090d18] text-xs ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium">{t('status.online')}</span>
            <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1.5 animate-ping" />
              v2.4
            </span>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mx-auto animate-pulse" title={t('status.online')} />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Expanded or Collapsed) */}
      {!isHidden && (
        <aside
          className={`hidden lg:block shrink-0 sticky top-0 h-screen z-20 transition-all duration-200 ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
          aria-label="Application Sidebar"
        >
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Backdrop & Drawer with Synchronized State Animation */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
        aria-hidden={!isMobileOpen}
      >
        {/* Backdrop with synchronized fade in/out */}
        <div
          className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobile}
          aria-hidden="true"
        />

        {/* Drawer container with synchronized slide in/out */}
        <div
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};
