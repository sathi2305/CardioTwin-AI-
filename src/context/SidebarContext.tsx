import React, { createContext, useContext, useEffect, useState } from 'react';
import { SidebarMode } from '../types';

interface SidebarContextType {
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  toggleCollapsed: () => void;
  toggleHidden: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = 'cardiotwin_sidebar_mode';

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SidebarMode>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY) as SidebarMode | null;
      if (saved === 'expanded' || saved === 'collapsed' || saved === 'hidden') {
        return saved;
      }
    } catch (_) {}
    return 'expanded';
  });

  const [lastNonHiddenMode, setLastNonHiddenMode] = useState<'expanded' | 'collapsed'>('expanded');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const setMode = (newMode: SidebarMode) => {
    if (newMode !== 'hidden') {
      setLastNonHiddenMode(newMode);
    }
    setModeState(newMode);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, newMode);
    } catch (_) {}
  };

  const toggleCollapsed = () => {
    if (mode === 'hidden') {
      setMode('expanded');
    } else if (mode === 'expanded') {
      setMode('collapsed');
    } else {
      setMode('expanded');
    }
  };

  const toggleHidden = () => {
    if (mode === 'hidden') {
      setMode(lastNonHiddenMode);
    } else {
      setMode('hidden');
    }
  };

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  // Close mobile drawer on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeMobile();
      }
    };

    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  // Auto-close mobile drawer when viewport resize detects transition to desktop breakpoint (lg >= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen((prev) => (prev ? false : prev));
      }
    };

    window.addEventListener('resize', handleResize);

    // Also listen with MediaQueryList for instant breakpoint transition event
    let mql: MediaQueryList | null = null;
    let mqlListener: ((e: MediaQueryListEvent) => void) | null = null;
    if (typeof window.matchMedia === 'function') {
      mql = window.matchMedia('(min-width: 1024px)');
      mqlListener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          setIsMobileOpen(false);
        }
      };
      if (mql.addEventListener) {
        mql.addEventListener('change', mqlListener);
      } else {
        // Fallback for older browsers
        (mql as any).addListener(mqlListener);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mql && mqlListener) {
        if (mql.removeEventListener) {
          mql.removeEventListener('change', mqlListener);
        } else {
          (mql as any).removeListener(mqlListener);
        }
      }
    };
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        mode,
        setMode,
        toggleCollapsed,
        toggleHidden,
        isMobileOpen,
        setIsMobileOpen,
        openMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
