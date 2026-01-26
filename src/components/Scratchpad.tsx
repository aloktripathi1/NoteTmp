import { useLocalStorage } from '@/hooks/useLocalStorage';

export function NoteTmp() {
  const { content, updateContent, clearNotes, timeRemaining, hasContent } = useLocalStorage();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--paper))' }}>
      {/* Header with status */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-medium tracking-tight" style={{ color: 'hsl(var(--ink))' }}>
            NoteTmp
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="status-pill saved">
            <span>Expires in {timeRemaining}</span>
          </div>
          {hasContent && (
            <button onClick={clearNotes} className="clear-button">
              Clear Notes
            </button>
          )}
        </div>
      </header>

      {/* Main writing area */}
      <main className="flex-1 p-6 md:p-10 lg:p-16">
        <div className="max-w-3xl mx-auto h-full">
          <textarea
            className="notetmp-textarea"
            style={{ minHeight: 'calc(100vh - 180px)' }}
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Start writing..."
            spellCheck="true"
            autoFocus
          />
        </div>
      </main>

      {/* Subtle footer */}
      <footer className="px-6 py-3 text-center">
        <p className="text-xs" style={{ color: 'hsl(var(--ink-light))', opacity: 0.5 }}>
          Notes auto-save and expire after 6 hours • Works offline
        </p>
      </footer>
    </div>
  );
}
