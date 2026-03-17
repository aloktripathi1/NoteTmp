import { useTabStorage } from '@/hooks/useTabStorage';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useSettings } from '@/hooks/useSettings';
import { SettingsMenu } from '@/components/SettingsMenu';
import { FileText, Plus, X, Clock } from 'lucide-react';
import { useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Extract a title from the first `# Heading` line, or fall back to the default
function getTabTitle(content: string, fallback: string): string {
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.startsWith('#')) {
    const title = firstLine.replace(/^#+\s*/, '').trim();
    if (title) return title;
  }
  return fallback;
}

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
    const tabIndex = tabs.findIndex(t => t.id === activeTabId);
    const rawTitle = getTabTitle(content, `notetmp-tab${tabIndex + 1}`);
    const safeName = rawTitle.replace(/[^a-z0-9\-_.\s]/gi, '').replace(/\s+/g, '-').toLowerCase();
    link.download = `${safeName}.txt`;
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

  const handleClearSavedData = useCallback(() => {
    if (!confirm('Clear all saved local data? This will remove tabs, settings, and theme and reload the app.')) {
      return;
    }

    localStorage.removeItem('notetmp_tabs_data');
    localStorage.removeItem('notetmp_data');
    localStorage.removeItem('notetmp_settings');
    localStorage.removeItem('notetmp_theme');

    toast({
      title: 'Saved data cleared',
      description: 'Reloading with a fresh state.',
    });

    setTimeout(() => {
      window.location.reload();
    }, 150);
  }, [toast]);

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
    const tab = tabs.find(t => t.id === tabId);
    const hasContent = tab && tab.content.trim().length > 0;
    if (hasContent && !confirm('Delete this tab? This cannot be undone.')) {
      return;
    }
    deleteTab(tabId);
    toast({
      title: 'Tab deleted',
      description: 'The tab has been removed.',
    });
  }, [tabs, deleteTab, toast]);

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
    <div className="app-shell flex flex-col transition-colors duration-300" style={{ background: 'hsl(var(--paper))' }}>
      {/* Header with status */}
      <header className="shrink-0 flex items-center justify-between px-6 py-2 border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h1 className="text-base font-semibold tracking-tight" style={{ color: 'hsl(var(--ink))' }}>
            NoteTmp
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="status-pill saved">
            <Clock className="h-3 w-3" />
            <span>{timeRemaining}</span>
          </div>
          <SettingsMenu
            isDark={isDark}
            toggleDarkMode={toggleDarkMode}
            settings={settings}
            updateSettings={updateSettings}
            onClearNotes={handleClearNotes}
            onClearSavedData={handleClearSavedData}
            onExportNotes={exportNotes}
            hasContent={hasContent}
            wordCount={wordCount}
            charCount={charCount}
          />
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="shrink-0 border-b border-border/50 bg-background/30 px-6 overflow-x-auto">
        <div className="flex w-full justify-center">
          <div className="flex items-center gap-2 min-w-max">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`
                group relative flex items-center gap-1 transition-all
                ${tab.id === activeTabId ? 'border-b-2 border-primary mb-[-1px]' : ''}
              `}
            >
              <button
                onClick={() => switchTab(tab.id)}
                className={`
                  flex items-center px-3 py-1.5 transition-all
                  ${tab.id === activeTabId
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <span className="text-sm font-medium max-w-[150px] truncate">
                  {getTabTitle(tab.content, `Tab ${index + 1}`)}
                </span>
              </button>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleDeleteTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive pr-1"
                  title="Delete tab"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={addTab}
            className="h-7 w-7 p-0 rounded-full"
            title="New tab (Ctrl+T)"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          </div>
        </div>
      </div>

      {/* Main writing area */}
      <main className="flex-1 min-h-0 overflow-hidden p-6 md:p-10 lg:p-16">
        <div className="max-w-4xl mx-auto h-full">
          <textarea
            className="notetmp-textarea h-full"
            style={{
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
      <footer className="shrink-0 px-6 py-4 text-center border-t border-border/30">
        <p className="text-xs" style={{ color: 'hsl(var(--ink-light))', opacity: 0.6 }}>
          Auto-saves every few seconds • Stored locally until you clear browser storage • Works offline
        </p>
      </footer>
    </div>
  );
}
