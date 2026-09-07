import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Headphones,
  Flame,
  HardDrive,
  Layers,
  Terminal,
  Shield,
  Sliders,
  Power,
  Cpu,
  Bot,
  FileCheck2,
  Sparkles,
  Command,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sound } from '../utils/audio';

export interface NavItemDef {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: (stats: any) => string | number | null;
  badgeVariant?: 'violet' | 'cyan' | 'slate' | 'danger';
}

export const DASHBOARD_NAV_ITEMS: NavItemDef[] = [
  {
    id: 'overview',
    label: 'Overview Stage',
    icon: LayoutDashboard,
  },
  {
    id: 'sentry',
    label: 'GhostKey Sentry',
    icon: Headphones,
    badge: (stats) => (stats?.earbudConfig?.enableStemTap ? 'ARMED' : null),
    badgeVariant: 'cyan',
  },
  {
    id: 'thermal',
    label: 'Thermal & Fans',
    icon: Flame,
    badge: (stats) => (stats?.temperature ? `${stats.temperature}°C` : null),
    badgeVariant: 'slate',
  },
  {
    id: 'storage',
    label: 'APFS Storage',
    icon: HardDrive,
    badge: (stats) => (stats?.disk?.capacity ? stats.disk.capacity : null),
    badgeVariant: 'slate',
  },
  {
    id: 'processes',
    label: 'Activity & RAM',
    icon: Layers,
    badge: (stats) => (stats?.topProcesses ? stats.topProcesses.length : null),
    badgeVariant: 'violet',
  },
  {
    id: 'dev',
    label: 'Dev Ghost Hunter',
    icon: Terminal,
    badge: (stats) => (stats?.devPorts ? `${stats.devPorts.length}p` : null),
    badgeVariant: 'violet',
  },
  {
    id: 'privacy',
    label: 'Privacy Vault',
    icon: Shield,
    badge: (stats) => (stats?.micMuted ? 'LOCKED' : null),
    badgeVariant: 'danger',
  },
  {
    id: 'tweaks',
    label: 'Titanium Tweaks',
    icon: Sliders,
  },
  {
    id: 'startup',
    label: 'Launch Daemons',
    icon: Power,
    badge: (stats) => (stats?.launchAgents ? stats.launchAgents.length : null),
    badgeVariant: 'slate',
  },
];

interface AppSidebarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  stats: any;
  onOpenSpecs: () => void;
  onOpenAI: () => void;
  onOpenReceipts: () => void;
  onOpenShortcuts: () => void;
  receiptCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onSelectView,
  stats,
  onOpenSpecs,
  onOpenAI,
  onOpenReceipts,
  onOpenShortcuts,
  receiptCount,
  soundEnabled,
  onToggleSound,
}) => {
  const chip = stats?.specs?.chip || 'Apple Silicon';
  const model = stats?.specs?.model || 'MacBook Pro';

  return (
    <aside className="w-64 h-screen shrink-0 bg-[#08080a]/95 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between select-none sticky top-0 z-40">
      {/* 1. Header & Brand */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22D3EE] p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.35)] flex items-center justify-center">
              <div className="w-full h-full bg-[#08080a] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#22D3EE]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-[#F5F5F7] flex items-center gap-1.5">
                <span>Mac Guardian</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#7C3AED]/20 text-[#22D3EE] font-mono border border-[#7C3AED]/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#8A8A93] font-mono truncate max-w-[140px]">
                {chip}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sound effects' : 'Enable audio feedback'}
            className="p-1.5 rounded-xl hover:bg-white/5 text-[#8A8A93] hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#22D3EE]" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Live Kernel Telemetry Pill */}
        <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-[#8A8A93]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            <span className="text-[#F5F5F7]">Mach Kernel</span>
          </span>
          <span className="text-[#22D3EE]">ACTIVE</span>
        </div>
      </div>

      {/* 2. Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pb-1 pt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8A8A93]">
          Navigation
        </div>

        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          const badgeVal = item.badge ? item.badge(stats) : null;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectView(item.id);
              }}
              className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-white bg-gradient-to-r from-[#7C3AED]/20 to-[#22D3EE]/10 border border-[#7C3AED]/40 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                  : 'text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute left-0 w-1 h-5 rounded-r-full bg-gradient-to-b from-[#7C3AED] to-[#22D3EE] shadow-[0_0_12px_#22D3EE]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#22D3EE]' : 'text-[#8A8A93]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {badgeVal !== null && badgeVal !== undefined && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'bg-white/5 text-[#8A8A93] border border-white/5'
                  }`}
                >
                  {badgeVal}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Bottom Footer & Action Hub */}
      <div className="p-3 border-t border-white/[0.08] space-y-2">
        {/* Quick Hub Buttons */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            onClick={() => {
              sound.playClick();
              onOpenAI();
            }}
            title="Guardian AI Assistant (⌘J)"
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/[0.06] text-[#8A8A93] hover:text-white transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-[#7C3AED] mb-1" />
            <span className="text-[10px]">AI Studio</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenReceipts();
            }}
            title="Action Audit Log & Receipts"
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/[0.06] text-[#8A8A93] hover:text-white transition-all relative cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#22D3EE] mb-1" />
            <span className="text-[10px]">Receipts</span>
            {receiptCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#22D3EE]" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSpecs();
            }}
            title="Inspect Die Silicon Architecture"
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/[0.06] text-[#8A8A93] hover:text-white transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-[#7C3AED] mb-1" />
            <span className="text-[10px]">Specs</span>
          </button>
        </div>

        {/* Shortcuts Info */}
        <button
          onClick={onOpenShortcuts}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/[0.04] text-[11px] text-[#8A8A93] hover:text-[#F5F5F7] transition-all cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-[#8A8A93]" />
            <span>Shortcuts</span>
          </span>
          <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-[#8A8A93]">?</kbd>
        </button>
      </div>
    </aside>
  );
};
