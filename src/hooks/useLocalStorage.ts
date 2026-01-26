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
  const [expiresIn, setExpiresIn] = useState(DEFAULT_EXPIRY_HOURS);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

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

  // No localStorage: start with empty content
  useEffect(() => {
    setContent('');
  }, []);

  // Update time remaining every minute (simulate expiry countdown)
  useEffect(() => {
    const start = Date.now();
    const updateRemaining = () => {
      setTimeRemaining(calculateTimeRemaining(start, expiresIn));
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 60000);
    return () => clearInterval(interval);
  }, [expiresIn, calculateTimeRemaining]);

  // Update content
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Clear all notes
  const clearNotes = useCallback(() => {
    setContent('');
    setTimeRemaining('');
  }, []);

  return {
    content,
    updateContent,
    clearNotes,
    timeRemaining,
    hasContent: content.length > 0,
  };
}
