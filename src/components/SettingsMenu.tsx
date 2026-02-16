import { Moon, Sun, Settings2, Download, Type, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Settings } from '@/hooks/useSettings';

interface SettingsMenuProps {
  isDark: boolean;
  toggleDarkMode: () => void;
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  onClearNotes: () => void;
  onExportNotes: () => void;
  hasContent: boolean;
  wordCount: number;
  charCount: number;
}

export function SettingsMenu({
  isDark,
  toggleDarkMode,
  settings,
  updateSettings,
  onClearNotes,
  onExportNotes,
  hasContent,
  wordCount,
  charCount,
}: SettingsMenuProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Stats */}
      {hasContent && (
        <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground mr-2">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>
      )}

      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="h-9 w-9"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Export button */}
      {hasContent && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onExportNotes}
          className="h-9 w-9"
          title="Export notes"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}

      {/* Clear button */}
      {hasContent && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearNotes}
          className="h-9 w-9 text-destructive hover:text-destructive"
          title="Clear all notes (⌘K)"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      {/* Settings popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Settings">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Settings</h3>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size
                </label>
                <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
              </div>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSettings({ fontSize: value })}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            {/* Tab Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tab Size</label>
                <span className="text-sm text-muted-foreground">{settings.tabSize} spaces</span>
              </div>
              <Slider
                value={[settings.tabSize]}
                onValueChange={([value]) => updateSettings({ tabSize: value })}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Line Height</label>
                <span className="text-sm text-muted-foreground">{settings.lineHeight}</span>
              </div>
              <Slider
                value={[settings.lineHeight * 10]}
                onValueChange={([value]) => updateSettings({ lineHeight: value / 10 })}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground space-y-1">
              <div>⌘/Ctrl + K - Clear notes</div>
              <div>⌘/Ctrl + S - Export notes</div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
