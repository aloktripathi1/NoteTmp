import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useSettings } from '@/hooks/useSettings';
import { SettingsMenu } from '@/components/SettingsMenu';
import { FileText } from 'lucide-react';
import { useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function NoteTmp() {
  const { content, updateContent, clearNotes, timeRemaining, hasContent } = useLocalStorage();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  // Word and character count
  const { wordCount, charCount } = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return { wordCount: words, charCount: content.length };
  }, [content]);

  // Export notes function
  const exportNotes = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notetmp-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Notes exported',
      description: 'Your notes have been downloaded successfully.',
    });
  }, [content, toast]);

  // Clear notes with confirmation
  const handleClearNotes = useCallback(() => {
    if (confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
      clearNotes();
      toast({
        title: 'Notes cleared',
        description: 'All your notes have been removed.',
      });
    }
  }, [clearNotes, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to clear
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (hasContent) handleClearNotes();
      }
      // Cmd/Ctrl + S to export
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasContent) exportNotes();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasContent, handleClearNotes, exportNotes]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: 'hsl(var(--paper))' }}>
      {/* Header with status */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'hsl(var(--ink))' }}>
            NoteTmp
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="status-pill saved">
            <span>⏱️ {timeRemaining || '6h 0m'}</span>
          </div>
          <SettingsMenu
            isDark={isDark}
            toggleDarkMode={toggleDarkMode}
            settings={settings}
            updateSettings={updateSettings}
            onClearNotes={handleClearNotes}
            onExportNotes={exportNotes}
            hasContent={hasContent}
            wordCount={wordCount}
            charCount={charCount}
          />
        </div>
      </header>

      {/* Main writing area */}
      <main className="flex-1 p-6 md:p-10 lg:p-16">
        <div className="max-w-4xl mx-auto h-full">
          <textarea
            className="notetmp-textarea"
            style={{
              minHeight: 'calc(100vh - 180px)',
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              tabSize: settings.tabSize,
            }}
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Start writing... ✨"
            spellCheck="true"
            autoFocus
          />
        </div>
      </main>

      {/* Enhanced footer */}
      <footer className="px-6 py-4 text-center border-t border-border/30">
        <p className="text-xs" style={{ color: 'hsl(var(--ink-light))', opacity: 0.6 }}>
          Auto-saves every few seconds • Notes expire after 6 hours • Works offline
        </p>
      </footer>
    </div>
  );
}
