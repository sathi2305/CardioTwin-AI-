import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, ResolvedTheme } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'cardiotwin_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system' || saved === 'high-contrast') {
        return saved;
      }
    } catch (_) {}
    return 'dark'; // Default to clinical dark theme
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // Compute resolved theme
  useEffect(() => {
    const updateResolved = () => {
      let resolved: ResolvedTheme = 'dark';
      if (theme === 'system') {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = isDark ? 'dark' : 'light';
      } else if (theme === 'high-contrast') {
        resolved = 'high-contrast';
      } else {
        resolved = theme;
      }

      setResolvedTheme(resolved);

      // Apply to root element and body
      const root = document.documentElement;
      const body = document.body;
      root.classList.remove('dark', 'light', 'high-contrast');
      if (body) body.classList.remove('dark', 'light', 'high-contrast');

      if (resolved === 'high-contrast') {
        root.classList.add('dark', 'high-contrast');
        root.setAttribute('data-theme', 'high-contrast');
        if (body) {
          body.classList.add('dark', 'high-contrast');
          body.setAttribute('data-theme', 'high-contrast');
        }
      } else if (resolved === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        if (body) {
          body.classList.add('dark');
          body.setAttribute('data-theme', 'dark');
        }
      } else {
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        if (body) {
          body.classList.add('light');
          body.setAttribute('data-theme', 'light');
        }
      }
    };

    updateResolved();

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateResolved();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (_) {}
  };

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('high-contrast');
    else if (theme === 'high-contrast') setTheme('dark');
    else setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
