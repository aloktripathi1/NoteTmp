import { useTabStorage } from '@/hooks/useTabStorage';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useSettings } from '@/hooks/useSettings';
import { SettingsMenu } from '@/components/SettingsMenu';
import { FileText, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function NoteTmp() {
  const {
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
    hasContent,
  } = useTabStorage();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  // Word and character count
  const { wordCount, charCount } = useMemo(() => {
    const content = activeTab?.content || '';
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return { wordCount: words, charCount: content.length };
  }, [activeTab]);

  // Export notes function
  const exportNotes = useCallback(() => {
    const content = exportCurrentTab();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const tabNumber = tabs.indexOf(activeTab!) + 1;
    link.download = `notetmp-tab${tabNumber}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Notes exported',
      description: 'Your notes have been downloaded successfully.',
    });
  }, [exportCurrentTab, activeTab, tabs, toast]);

  // Clear notes with confirmation
  const handleClearNotes = useCallback(() => {
    if (confirm('Are you sure you want to clear this tab? This cannot be undone.')) {
      clearCurrentTab();
      toast({
        title: 'Tab cleared',
        description: 'The tab content has been removed.',
      });
    }
  }, [clearCurrentTab, toast]);

  // Handle delete tab
  const handleDeleteTab = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      toast({
        title: 'Cannot delete',
        description: 'You must have at least one tab.',
        variant: 'destructive',
      });
      return;
    }
    if (confirm('Delete this tab? This cannot be undone.')) {
      deleteTab(tabId);
      toast({
        title: 'Tab deleted',
        description: 'The tab has been removed.',
      });
    }
  }, [tabs.length, deleteTab, toast]);

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
      <header className="flex items-center justify-between px-6 py-2 border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h1 className="text-base font-semibold tracking-tight" style={{ color: 'hsl(var(--ink))' }}>
            NoteTmp
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={addTab}
            className="h-6 w-6 p-0 rounded-full"
            title="New tab"
          >
            <Plus className="h-3 w-3" />
          </Button>
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

      {/* Tabs Bar */}
      <div className="border-b border-border/50 bg-background/30 px-6 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`
                group relative flex items-center gap-2 px-3 py-1.5 transition-all
                ${tab.id === activeTabId
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <span className="text-sm font-medium max-w-[150px] truncate">
                Tab {tabs.indexOf(tab) + 1}
              </span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleDeleteTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  title="Delete tab"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>

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
            value={activeTab?.content || ''}
            onChange={(e) => activeTab && updateTabContent(activeTab.id, e.target.value)}
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
