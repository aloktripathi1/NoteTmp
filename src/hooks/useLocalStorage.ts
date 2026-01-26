import { useState, useEffect, useCallback, useRef } from 'react';

interface StoredData {
  content: string;
  timestamp: number;
  expiresIn: number; // hours
}

const STORAGE_KEY = 'scratchpad_data';
const DEFAULT_EXPIRY_HOURS = 6;
const DEBOUNCE_MS = 400;

export function useLocalStorage() {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [expiresIn, setExpiresIn] = useState(DEFAULT_EXPIRY_HOURS);
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

  // Check if stored data has expired
  const isExpired = useCallback((data: StoredData): boolean => {
    const expiryTime = data.timestamp + data.expiresIn * 60 * 60 * 1000;
    return Date.now() > expiryTime;
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        if (isExpired(data)) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setContent(data.content);
          setLastSaved(data.timestamp);
          setExpiresIn(data.expiresIn);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isExpired]);

  // Update time remaining every minute
  useEffect(() => {
    if (!lastSaved) return;
    const updateRemaining = () => {
      setTimeRemaining(calculateTimeRemaining(lastSaved, expiresIn));
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 60000);
    return () => clearInterval(interval);
  }, [lastSaved, expiresIn, calculateTimeRemaining]);

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
        expiresIn,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(now);
    }, DEBOUNCE_MS);
  }, [expiresIn]);

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
    setTimeRemaining('');
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
