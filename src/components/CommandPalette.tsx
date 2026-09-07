import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Coffee,
  HardDrive,
  Trash2,
  Volume2,
  Globe,
  Sliders,
  Eye,
  Moon,
  Sparkles,
  Command,
  ArrowRight,
  Monitor,
  ShieldAlert,
  Gauge,
  FolderOpen,
  Terminal,
  Shield
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ActionItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  triggerAction: (action: string, payload: any, label: string) => void;
  setActiveTab: (tab: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  triggerAction,
  setActiveTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const actions: ActionItem[] = [
    {
      id: 'boost',
      title: 'One-Click Mac Sweep (Quick Flush)',
      category: 'System Performance',
      icon: Sparkles,
      shortcut: '⌘B',
      action: () => triggerAction('boost-quick', {}, 'Instant Mac Sweep'),
    },
    {
      id: 'reap-chrome',
      title: 'Browser Tab Memory Reaper (Keep Browser Open)',
      category: 'Browser Optimization',
      icon: Globe,
      action: () => triggerAction('reap-chrome-tabs', {}, 'Reap Heavy Browser Tabs'),
    },
    {
      id: 'boss-key',
      title: 'Focus Mode / Boss Key (Quit Slack, Discord, Spotify)',
      category: 'Workspace Focus',
      icon: ShieldAlert,
      action: () => triggerAction('boss-key-reap', {}, 'Focus Mode / Boss Key'),
    },
    {
      id: 'speed-test',
      title: 'Run Apple Network Quality Speedometer',
      category: 'Network Diagnostic',
      icon: Gauge,
      action: () => triggerAction('run-speed-test', {}, 'Network Quality Test'),
    },
    {
      id: 'deep-boost',
      title: 'Deep System Purge (Caches + Memory)',
      category: 'System Performance',
      icon: Zap,
      action: () => triggerAction('boost-deep', {}, 'Deep System Purge'),
    },
    {
      id: 'shred-clipboard',
      title: 'Shred macOS Clipboard (Scrub Sensitive Tokens & Keys)',
      category: 'Privacy & Security',
      icon: Shield,
      action: () => triggerAction('shred-clipboard', {}, 'Shred Clipboard Memory'),
    },
    {
      id: 'purge-dev-zombies',
      title: 'Purge Orphaned Dev Zombie Trees (Node/Python/Vite)',
      category: 'Developer Tools',
      icon: Terminal,
      action: () => triggerAction('purge-dev-zombies', {}, 'Purge Orphaned Dev Trees'),
    },
    {
      id: 'flush-dns',
      title: 'Flush DNS Cache (mDNSResponder)',
      category: 'Network Diagnostics',
      icon: Zap,
      action: () => triggerAction('flush-dns', {}, 'Flush DNS Cache'),
    },
    {
      id: 'purge-ram',
      title: 'Purge Inactive RAM (vm_stat reclamation)',
      category: 'Memory Management',
      icon: HardDrive,
      action: () => triggerAction('purge-ram', {}, 'Purge Inactive RAM'),
    },
    {
      id: 'clean-dev-caches',
      title: 'Flush Build Caches (NPM, Brew, UV, Xcode)',
      category: 'Disk Space',
      icon: Trash2,
      action: () => triggerAction('clean-dev-caches', {}, 'Flush Developer Caches'),
    },
    {
      id: 'caffeinate-1h',
      title: 'Keep Awake / Caffeinate (1 Hour)',
      category: 'Power Management',
      icon: Coffee,
      action: () => triggerAction('caffeinate', { duration: 3600 }, 'Keep Awake for 1 Hour'),
    },
    {
      id: 'allow-sleep',
      title: 'Allow Display & System Sleep',
      category: 'Power Management',
      icon: Coffee,
      action: () => triggerAction('allow-sleep', {}, 'Allow Sleep'),
    },
    {
      id: 'toggle-mic',
      title: 'Toggle Hardware Microphone Lockdown',
      category: 'Privacy & Security',
      icon: Shield,
      action: () => triggerAction('toggle-mic', {}, 'Toggle Microphone'),
    },
    {
      id: 'toggle-desktop',
      title: 'Toggle Desktop Icons (Presentations Mode)',
      category: 'macOS Appearance',
      icon: Eye,
      action: () => triggerAction('toggle-desktop-icons', {}, 'Toggle Desktop Icons'),
    },
    {
      id: 'toggle-dark',
      title: 'Toggle macOS Dark/Light Mode',
      category: 'macOS Appearance',
      icon: Moon,
      action: () => triggerAction('toggle-dark-mode', {}, 'Toggle Dark Mode'),
    },
    {
      id: 'restart-audio',
      title: 'Restart CoreAudio Daemon (Fix Glitches & Bluetooth Lag)',
      category: 'Audio Hardware',
      icon: Volume2,
      action: () => triggerAction('restart-audio', {}, 'Restart CoreAudio'),
    },
    {
      id: 'fix-spotlight',
      title: 'Re-index Spotlight Applications',
      category: 'System Diagnostics',
      icon: Search,
      action: () => triggerAction('fix-spotlight', {}, 'Re-index Spotlight'),
    },
    {
      id: 'kill-all-dev-ports',
      title: 'Nuke All Local Dev Ports (3000, 5173, 8080, etc.)',
      category: 'Developer Tools',
      icon: Terminal,
      action: () => triggerAction('kill-all-dev-ports', {}, 'Kill All Dev Ports'),
    },
    {
      id: 'empty-trash',
      title: 'Secure Empty Trash',
      category: 'Disk Space',
      icon: Trash2,
      action: () => triggerAction('empty-trash', {}, 'Empty Trash'),
    },
    {
      id: 'open-dev-tab',
      title: 'Jump to APFS Ghost Hunter',
      category: 'Navigation',
      icon: FolderOpen,
      action: () => setActiveTab('developer'),
    },
    {
      id: 'open-privacy-tab',
      title: 'Jump to Privacy Vault',
      category: 'Navigation',
      icon: Shield,
      action: () => setActiveTab('privacy'),
    },
    {
      id: 'open-thermal-tab',
      title: 'Jump to Thermal & Fan Sentry',
      category: 'Navigation',
      icon: Zap,
      action: () => setActiveTab('thermal'),
    },
    {
      id: 'open-earbuds-tab',
      title: 'Jump to OnePlus Buds 4 Audiophile Studio',
      category: 'Navigation',
      icon: Volume2,
      action: () => setActiveTab('earbuds'),
    },
  ];

  const filtered = actions.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.shortcut && item.shortcut.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        sound.playClick();
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-[#101010] border border-white/[0.08] shadow-2xl shadow-black overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-[#f5f5f7]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <Search className="w-4 h-4 text-[#86868b] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action..."
            className="flex-1 bg-transparent text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none"
          />
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono text-[#86868b] border border-white/[0.08]">
            ESC
          </span>
        </div>

        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all ${
                    isSelected
                      ? 'bg-white/[0.08] text-[#f5f5f7] shadow-sm'
                      : 'text-[#86868b] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/[0.08] text-[#f5f5f7]' : 'bg-white/[0.03] text-[#86868b]'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#f5f5f7] truncate">{item.title}</div>
                      <div className="text-[10px] font-mono text-[#86868b]">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="px-1.5 py-0.5 rounded-full bg-white/[0.05] text-[10px] font-mono text-[#86868b] border border-white/[0.06]">
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#f5f5f7]" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#86868b]">
              No matching commands found.
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 bg-[#0a0a0c] border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#86868b]">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[#86868b]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[#86868b]">↵</kbd> Execute</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[#86868b]">ESC</kbd> Close</span>
          </div>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
};
