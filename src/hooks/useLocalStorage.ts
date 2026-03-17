import { useState, useEffect, useCallback, useRef } from 'react';

interface StoredData {
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'notetmp_data';
const DEBOUNCE_MS = 400;

export function useLocalStorage() {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const timeRemaining = 'Saved locally';
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        setContent(data.content);
        setLastSaved(data.timestamp);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save to localStorage with debounce
  const saveToStorage = useCallback((newContent: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      const now = Date.now();
      const data: StoredData = {
        content: newContent,
        timestamp: now,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(now);
    }, DEBOUNCE_MS);
  }, []);

  // Update content and trigger save
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    saveToStorage(newContent);
  }, [saveToStorage]);

  // Clear all notes
  const clearNotes = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setContent('');
    setLastSaved(null);
  }, []);

  return {
    content,
    updateContent,
    clearNotes,
    lastSaved,
    timeRemaining,
    hasContent: content.length > 0,
  };
}
