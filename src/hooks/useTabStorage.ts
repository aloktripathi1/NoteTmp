import { useState, useEffect, useCallback, useRef } from 'react';

export interface Tab {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  expiresIn: number; // hours
}

interface TabStorageData {
  tabs: Tab[];
  activeTabId: string;
}

const STORAGE_KEY = 'notetmp_tabs_data';
const DEFAULT_EXPIRY_HOURS = 6;
const DEBOUNCE_MS = 400;

const generateId = () => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function useTabStorage() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Calculate time remaining until expiry
  const calculateTimeRemaining = useCallback((timestamp: number, hours: number): string => {
    const expiryTime = timestamp + hours * 60 * 60 * 1000;
    const remaining = expiryTime - Date.now();
    
    if (remaining <= 0) return 'Expired';
    
    const hoursLeft = Math.floor(remaining / (60 * 60 * 1000));
    const minutesLeft = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    }
    return `${minutesLeft}m`;
  }, []);

  // Check if tab has expired
  const isExpired = useCallback((tab: Tab): boolean => {
    const expiryTime = tab.timestamp + tab.expiresIn * 60 * 60 * 1000;
    return Date.now() > expiryTime;
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: TabStorageData = JSON.parse(stored);
        // Filter out expired tabs
        const validTabs = data.tabs.filter(tab => !isExpired(tab));
        
        if (validTabs.length > 0) {
          setTabs(validTabs);
          // Check if active tab still exists
          const activeExists = validTabs.some(tab => tab.id === data.activeTabId);
          setActiveTabId(activeExists ? data.activeTabId : validTabs[0].id);
        } else {
          // No valid tabs, create a new one
          const newTab: Tab = {
            id: generateId(),
            title: 'Untitled',
            content: '',
            timestamp: Date.now(),
            expiresIn: DEFAULT_EXPIRY_HOURS,
          };
          setTabs([newTab]);
          setActiveTabId(newTab.id);
        }
      } else {
        // First time user, create default tab
        const newTab: Tab = {
          id: generateId(),
          title: 'Untitled',
          content: '',
          timestamp: Date.now(),
          expiresIn: DEFAULT_EXPIRY_HOURS,
        };
        setTabs([newTab]);
        setActiveTabId(newTab.id);
      }
    } catch {
      // Error parsing, create fresh tab
      const newTab: Tab = {
        id: generateId(),
        title: 'Untitled',
        content: '',
        timestamp: Date.now(),
        expiresIn: DEFAULT_EXPIRY_HOURS,
      };
      setTabs([newTab]);
      setActiveTabId(newTab.id);
    }
  }, [isExpired]);

  // Update time remaining every minute
  useEffect(() => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab) return;
    
    const updateRemaining = () => {
      setTimeRemaining(calculateTimeRemaining(activeTab.timestamp, activeTab.expiresIn));
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 60000);
    return () => clearInterval(interval);
  }, [tabs, activeTabId, calculateTimeRemaining]);

  // Save to localStorage with debounce
  const saveToStorage = useCallback((updatedTabs: Tab[], currentActiveId: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      const data: TabStorageData = {
        tabs: updatedTabs,
        activeTabId: currentActiveId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, DEBOUNCE_MS);
  }, []);

  // Get current active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Update tab content
  const updateTabContent = useCallback((tabId: string, newContent: string) => {
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.map(tab =>
        tab.id === tabId
          ? { ...tab, content: newContent, timestamp: Date.now() }
          : tab
      );
      saveToStorage(updatedTabs, activeTabId);
      return updatedTabs;
    });
  }, [activeTabId, saveToStorage]);

  // Update tab title
  const updateTabTitle = useCallback((tabId: string, newTitle: string) => {
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.map(tab =>
        tab.id === tabId
          ? { ...tab, title: newTitle || 'Untitled', timestamp: Date.now() }
          : tab
      );
      saveToStorage(updatedTabs, activeTabId);
      return updatedTabs;
    });
  }, [activeTabId, saveToStorage]);

  // Add new tab
  const addTab = useCallback(() => {
    const newTab: Tab = {
      id: generateId(),
      title: 'Untitled',
      content: '',
      timestamp: Date.now(),
      expiresIn: DEFAULT_EXPIRY_HOURS,
    };
    setTabs(prevTabs => {
      const updatedTabs = [...prevTabs, newTab];
      saveToStorage(updatedTabs, newTab.id);
      return updatedTabs;
    });
    setActiveTabId(newTab.id);
  }, [saveToStorage]);

  // Delete tab
  const deleteTab = useCallback((tabId: string) => {
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If no tabs left, create a new one
      if (updatedTabs.length === 0) {
        const newTab: Tab = {
          id: generateId(),
          title: 'Untitled',
          content: '',
          timestamp: Date.now(),
          expiresIn: DEFAULT_EXPIRY_HOURS,
        };
        const newTabs = [newTab];
        saveToStorage(newTabs, newTab.id);
        setActiveTabId(newTab.id);
        return newTabs;
      }
      
      // If we deleted the active tab, switch to another one
      const newActiveId = tabId === activeTabId 
        ? updatedTabs[Math.max(0, prevTabs.findIndex(t => t.id === tabId) - 1)].id
        : activeTabId;
      
      saveToStorage(updatedTabs, newActiveId);
      setActiveTabId(newActiveId);
      return updatedTabs;
    });
  }, [activeTabId, saveToStorage]);

  // Switch to a tab
  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    saveToStorage(tabs, tabId);
  }, [tabs, saveToStorage]);

  // Clear current tab
  const clearCurrentTab = useCallback(() => {
    if (activeTab) {
      updateTabContent(activeTab.id, '');
    }
  }, [activeTab, updateTabContent]);

  // Export current tab
  const exportCurrentTab = useCallback(() => {
    if (!activeTab) return '';
    return activeTab.content;
  }, [activeTab]);

  return {
    tabs,
    activeTab,
    activeTabId,
    timeRemaining,
    updateTabContent,
    updateTabTitle,
    addTab,
    deleteTab,
    switchTab,
    clearCurrentTab,
    exportCurrentTab,
    hasContent: activeTab ? activeTab.content.length > 0 : false,
  };
}
