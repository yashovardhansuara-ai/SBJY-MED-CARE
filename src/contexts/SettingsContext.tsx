import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ComprehensionLevel = 'layperson' | 'clinical';

interface SettingsContextProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  powerSaver: boolean;
  setPowerSaver: (p: boolean) => void;
  blurIntensity: number; // 0 to 20
  setBlurIntensity: (b: number) => void;
  autoBlur: boolean;
  setAutoBlur: (a: boolean) => void;
  ghostMode: boolean;
  setGhostMode: (g: boolean) => void;
  comprehensionLevel: ComprehensionLevel;
  setComprehensionLevel: (c: ComprehensionLevel) => void;
  proactiveAI: boolean;
  setProactiveAI: (p: boolean) => void;
  clearTerminalData: () => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [powerSaver, setPowerSaver] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(12); // Base blur
  const [autoBlur, setAutoBlur] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [comprehensionLevel, setComprehensionLevel] = useState<ComprehensionLevel>('clinical');
  const [proactiveAI, setProactiveAI] = useState(true);

  useEffect(() => {
    // Determine the actual theme
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes if using 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const clearTerminalData = () => {
    localStorage.clear();
    // Dispatch an event to let other components know the data was wiped
    window.dispatchEvent(new Event('terminalDataCleared'));
  };

  return (
    <SettingsContext.Provider value={{
      theme, setTheme,
      powerSaver, setPowerSaver,
      blurIntensity, setBlurIntensity,
      autoBlur, setAutoBlur,
      ghostMode, setGhostMode,
      comprehensionLevel, setComprehensionLevel,
      proactiveAI, setProactiveAI,
      clearTerminalData
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
}
