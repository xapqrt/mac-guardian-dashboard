import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Terminal,
  Shield,
  Layers,
  Cpu,
  Flame,
  LayoutDashboard,
  Headphones,
  FileBox,
  Power
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
  stats?: any;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  triggerAction,
  setActiveTab,
  stats,
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
    // Top-Level View Navigation
    {
      id: 'nav-overview',
      title: 'Jump to Overview Stage',
      category: 'Views & Navigation',
      icon: LayoutDashboard,
      action: () => setActiveTab('overview'),
    },
    {
      id: 'nav-sentry',
      title: 'Jump to GhostKey & Gaze Sentry',
      category: 'Views & Navigation',
      icon: Headphones,
      action: () => setActiveTab('sentry'),
    },
    {
      id: 'nav-thermal',
      title: 'Jump to Thermal & Battery Sentry',
      category: 'Views & Navigation',
      icon: Flame,
      action: () => setActiveTab('thermal'),
    },
    {
      id: 'nav-storage',
      title: 'Jump to APFS Storage & Sunburst',
      category: 'Views & Navigation',
      icon: HardDrive,
      action: () => setActiveTab('storage'),
    },
    {
      id: 'nav-processes',
      title: 'Jump to Activity Monitor & Processes',
      category: 'Views & Navigation',
      icon: Layers,
      action: () => setActiveTab('processes'),
    },
    {
      id: 'nav-dev',
      title: 'Jump to Dev Ghost Hunter & Ports',
      category: 'Views & Navigation',
      icon: Terminal,
      action: () => setActiveTab('dev'),
    },
    {
      id: 'nav-privacy',
      title: 'Jump to Privacy Vault & Hygiene',
      category: 'Views & Navigation',
      icon: Shield,
      action: () => setActiveTab('privacy'),
    },
    {
      id: 'nav-tweaks',
      title: 'Jump to Titanium Tweaks & Audio',
      category: 'Views & Navigation',
      icon: Sliders,
      action: () => setActiveTab('tweaks'),
    },
    {
      id: 'nav-startup',
      title: 'Jump to Launch Daemons Manager',
      category: 'Views & Navigation',
      icon: Power,
      action: () => setActiveTab('startup'),
    },
  ];

  // Dynamically index stats data (processes, storage files, launch agents, dev ports)
  const allActions = React.useMemo(() => {
    const list = [...actions];

    // Index real processes
    if (stats?.topProcesses && Array.isArray(stats.topProcesses)) {
      stats.topProcesses.forEach((p: any) => {
        list.push({
          id: `proc-${p.pid}`,
          title: `${p.name} (PID ${p.pid}) • ${p.rssMb}MB RAM • ${p.cpu}% CPU`,
          category: 'Active Processes',
          icon: Cpu,
          action: () => setActiveTab('processes'),
        });
      });
    }

    // Index large storage files
    if (stats?.largeFiles && Array.isArray(stats.largeFiles)) {
      stats.largeFiles.forEach((f: any, idx: number) => {
        list.push({
          id: `file-${idx}-${f.name}`,
          title: `${f.name} (${f.size}) • ${f.path}`,
          category: 'Storage & Downloads',
          icon: FileBox,
          action: () => setActiveTab('storage'),
        });
      });
    }

    // Index startup daemons
    if (stats?.launchAgents && Array.isArray(stats.launchAgents)) {
      stats.launchAgents.forEach((a: any, idx: number) => {
        list.push({
          id: `agent-${idx}-${a.fileName}`,
          title: `${a.label || a.fileName} (${a.isEnabled ? 'Enabled' : 'Disabled'}) • ${a.category || 'Daemon'}`,
          category: 'Startup Daemons',
          icon: Power,
          action: () => setActiveTab('startup'),
        });
      });
    }

    // Index active dev ports
    if (stats?.devPorts && Array.isArray(stats.devPorts)) {
      stats.devPorts.forEach((p: any) => {
        list.push({
          id: `port-${p.port}-${p.pid}`,
          title: `Port :${p.port} (${p.command}) • PID ${p.pid} • ${p.user}`,
          category: 'TCP Listening Ports',
          icon: Terminal,
          action: () => setActiveTab('dev'),
        });
      });
    }

    return list;
  }, [actions, stats, setActiveTab]);

  const filtered = allActions.filter((item) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-xl rounded-2xl bg-[#0e0e12] border border-white/10 shadow-[0_0_40px_rgba(124,58,237,0.2)] overflow-hidden flex flex-col text-[#F5F5F7]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Search className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search processes, daemons, ports, files, or actions (⌘K)..."
                className="flex-1 bg-transparent text-xs text-[#F5F5F7] placeholder-[#8A8A93] focus:outline-none"
              />
              <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-mono text-[#8A8A93] border border-white/10">
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-white shadow-[0_0_20px_rgba(124,58,237,0.25)]'
                          : 'text-[#8A8A93] hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-[#7C3AED]/30 text-[#22D3EE]' : 'bg-white/5 text-[#8A8A93]'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-[#F5F5F7]'}`}>{item.title}</div>
                          <div className="text-[10px] font-mono text-[#8A8A93]">{item.category}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.shortcut && (
                          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-mono text-white border border-white/10">
                            {item.shortcut}
                          </span>
                        )}
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#22D3EE]" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[#8A8A93]">
                  No matching commands found.
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#8A8A93]">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1.5 py-0.5 rounded-lg bg-white/10 text-[#F5F5F7] border border-white/10">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded-lg bg-white/10 text-[#F5F5F7] border border-white/10">↵</kbd> Execute</span>
                <span><kbd className="px-1.5 py-0.5 rounded-lg bg-white/10 text-[#F5F5F7] border border-white/10">ESC</kbd> Close</span>
              </div>
              <span className="text-[#7C3AED]">⌘K to toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
