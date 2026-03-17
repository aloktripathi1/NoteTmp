import { useState, useEffect, useCallback, useRef } from 'react';

export interface Tab {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

interface TabStorageData {
  tabs: Tab[];
  activeTabId: string;
}

const STORAGE_KEY = 'notetmp_tabs_data';
const DEBOUNCE_MS = 400;

const generateId = () => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function useTabStorage() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const timeRemaining = 'Saved locally';
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: TabStorageData = JSON.parse(stored);
        const validTabs = data.tabs;
        
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
      };
      setTabs([newTab]);
      setActiveTabId(newTab.id);
    }
  }, []);

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
