import { useState, useEffect } from 'react';

export interface Settings {
  fontSize: number;
  tabSize: number;
  lineHeight: number;
}

const DEFAULT_SETTINGS: Settings = {
  fontSize: 15,
  tabSize: 4, // Made wider from default 2
  lineHeight: 1.7,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('notetmp_settings');
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('notetmp_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, updateSettings, resetSettings };
}
